const CACHE_NAME = "pgknma-cache-v3";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/favicon.ico",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
  "/logo-light.png",
  "/logo-dark.png"
];

const PUBLIC_API_PATHS = [
  /^\/api\/posts\/(?:\d+\/?)?$/,
  /^\/api\/events\/?$/,
  /^\/api\/program\/?$/,
  /^\/api\/changelog\/?$/,
  /^\/api\/terms-of-service\/?$/,
  /^\/api\/privacy-policy\/?$/,
  /^\/api\/site-status\/?$/
];

const offlineJson = () => new Response(JSON.stringify({ detail: "Offline" }), {
  status: 503,
  headers: { "Content-Type": "application/json" }
});

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))))
      .then(() => self.clients.claim())
  );
});

const networkFirstPublicApi = async (request) => {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    return (await caches.match(request)) || offlineJson();
  }
};

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/api/")) {
    const isPublicCacheable = !request.headers.has("Authorization")
      && PUBLIC_API_PATHS.some((pattern) => pattern.test(url.pathname));
    event.respondWith(
      isPublicCacheable
        ? networkFirstPublicApi(request)
        : fetch(request).catch(offlineJson)
    );
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(async (response) => {
          if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put("/index.html", response.clone());
          }
          return response;
        })
        .catch(async () => (
          (await caches.match("/index.html"))
          || (await caches.match("/"))
          || new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain" } })
        ))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const fromNetwork = fetch(request)
        .then(async (response) => {
          if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(request, response.clone());
          }
          return response;
        })
        .catch(() => cached || new Response("", { status: 503 }));
      return cached || fromNetwork;
    })
  );
});

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : "Имате ново известие." };
  }

  event.waitUntil(self.registration.showNotification(data.title || "ПГКНМА Блог", {
    body: data.body || "Имате ново известие.",
    icon: data.icon || "/icon-192.png",
    badge: data.badge || "/icon-192.png",
    tag: data.tag || "pgknma-notification",
    data: { url: data.url || "/" }
  }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const requestedUrl = new URL(event.notification.data?.url || "/", self.location.origin);
  const targetUrl = requestedUrl.origin === self.location.origin ? requestedUrl.href : self.location.origin;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(async (clients) => {
      for (const client of clients) {
        if ("navigate" in client) await client.navigate(targetUrl);
        if ("focus" in client) return client.focus();
      }
      return self.clients.openWindow ? self.clients.openWindow(targetUrl) : undefined;
    })
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});
