import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { setWsAccessToken } from "@/services/websocket.service";
import { getBackendOrigin } from "@/lib/backend-url";

/** Browser: same-origin /api proxy (cookies, no CORS). SSR: direct backend URL. */
function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    return "/api";
  }
  return `${getBackendOrigin()}/api`;
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

    const url = originalRequest.url ?? "";
    const isAuthEndpoint =
      url.includes("/auth/login") ||
      url.includes("/auth/register") ||
      url.includes("/auth/refresh");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post<{ access?: string }>("/auth/refresh");
        if (data?.access) setWsAccessToken(data.access);
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
