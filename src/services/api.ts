import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

/** Browser: same-origin proxy via Next.js rewrites (no CORS). SSR: direct backend URL. */
function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    return "/api";
  }
  const backend = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  return `${backend.replace(/\/$/, "")}/api`;
}

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

/** Prevent axios from stripping trailing slashes on relative URLs */
api.interceptors.request.use((config) => {
  if (config.url?.startsWith("/")) {
    config.url = config.url.replace(/\/{2,}/g, "/");
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve();
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post("/auth/refresh");
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error);
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
