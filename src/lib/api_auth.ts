const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

let isRefreshing = false;

interface QueueItem {
  resolve: () => void;
  reject: (reason?: unknown) => void;
}

let failedQueue: QueueItem[] = [];

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export const apiUrl = (path: string) => {
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL}${path}`;
};

export const resolveApiUrl = (url: string | null | undefined) => {
  if (!url || /^(https?:|data:|blob:)/i.test(url)) return url || "";
  return apiUrl(url);
};

export const setTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

const clearAuth = (message: string) => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem("user");
  window.dispatchEvent(new CustomEvent("auth:session-ended", {
    detail: { message },
  }));
};

const processQueue = (error?: unknown) => {
  failedQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve()));
  failedQueue = [];
};

const requestHeaders = (init: RequestInit | undefined, token: string | null): Headers => {
  const headers = new Headers(init?.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init?.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return headers;
};

const originalFetch = window.fetch;

export const authFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const performRequest = (token: string | null) => originalFetch(input, {
    ...init,
    headers: requestHeaders(init, token),
  });

  const token = getAccessToken();
  let response = await performRequest(token);

  if (response.status !== 401 || !token) return response;

  if (isRefreshing) {
    await new Promise<void>((resolve, reject) => failedQueue.push({ resolve, reject }));
    return performRequest(getAccessToken());
  }

  isRefreshing = true;
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) throw new Error("Няма наличен токен за опресняване.");

    const refreshResponse = await originalFetch(apiUrl("/api/auth/token/refresh/"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });
    if (!refreshResponse.ok) {
      const message = "Сесията е изтекла или е прекратена. Моля, влезте отново.";
      clearAuth(message);
      throw new Error(message);
    }

    const { access, refresh } = await refreshResponse.json();
    setTokens(access, refresh || refreshToken);
    processQueue();
    response = await performRequest(access);
    return response;
  } catch (error) {
    processQueue(error);
    throw error;
  } finally {
    isRefreshing = false;
  }
};

export const apiRequest = (url: string, options: RequestInit = {}) => authFetch(apiUrl(url), options);
