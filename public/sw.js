const CACHE_NAME = "pgknma-cache-v1";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/favicon.ico",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
  "/logo-light.png",
  "/logo-dark.png",
  "/program.csv"
];

// Install Event - Pre-cache Static Shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Pre-caching offline shell");
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean Up Old Caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("[Service Worker] Clearing old cache:", cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Helper: Check if request is an API call
const isApiRequest = (url) => {
  return url.includes("/api/") || url.includes("/status");
};

// Fetch Event - Caching Strategies
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests (POST comments, votes, Turnstile validation)
  if (request.method !== "GET") {
    return;
  }

  // Strategy 1: API requests (Network First, Cache Fallback)
  if (isApiRequest(request.url)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(async () => {
          // If offline, try serving from cache
          const cached = await caches.match(request);
          return cached || new Response(JSON.stringify({ detail: 'Offline' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          });
        })
    );
    return;
  }

  // Strategy 2: SPA Navigation request (serve index.html if offline/network fails)
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache page shell for offline
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put("/index.html", responseClone);
          });
          return response;
        })
        .catch(async () => {
          const cached = await caches.match("/index.html");
          if (cached) return cached;
          const root = await caches.match("/");
          if (root) return root;
          return new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
        })
    );
    return;
  }

  // Strategy 3: Static Assets, Fonts, and Images (Stale-While-Revalidate)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Network failed — return cached version if available
        return cachedResponse ? cachedResponse.clone() : new Response('', { status: 503 });
      });

      return cachedResponse || fetchPromise;
    })
  );
});

// Update event listener from message
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
