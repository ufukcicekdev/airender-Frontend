import type { User } from "@/types";
import { api } from "./api";

export const authService = {
  getSignupConfig: () =>
    api.get<{ free_signup_credits: number }>("/auth/signup-config"),

  register: (data: {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
  }) => api.post<{ user: User; access?: string }>("/auth/register", data),

  login: (data: { email: string; password: string }) =>
    api.post<{ user: User; access?: string }>("/auth/login", data),

  logout: () => api.post("/auth/logout"),

  me: () => api.get<User>("/auth/me"),

  refresh: () => api.post<{ message?: string; access?: string }>("/auth/refresh"),

  verifyEmail: (token: string) =>
    api.post<{ user: User }>("/auth/verify-email", { token }),

  requestPasswordReset: (email: string) =>
    api.post("/auth/password-reset", { email }),

  confirmPasswordReset: (data: {
    token: string;
    password: string;
    password_confirm: string;
  }) => api.post("/auth/password-reset/confirm", data),

  resendVerification: () => api.post("/auth/resend-verification"),
};
