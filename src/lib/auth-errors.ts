import { isAxiosError } from "axios";

export function getAuthErrorMessage(error: unknown): string {
  if (!isAxiosError(error)) {
    return "Something went wrong. Please try again.";
  }

  const data = error.response?.data as Record<string, unknown> | undefined;
  if (!data) {
    return error.message || "Network error. Is the backend running on port 8000?";
  }

  if (Array.isArray(data.non_field_errors) && data.non_field_errors[0]) {
    return String(data.non_field_errors[0]);
  }

  if (typeof data.detail === "string") {
    return data.detail;
  }

  if (typeof data === "object") {
    const firstKey = Object.keys(data)[0];
    const val = data[firstKey];
    if (Array.isArray(val) && val[0]) return `${firstKey}: ${val[0]}`;
    if (typeof val === "string") return val;
  }

  return "Invalid email or password.";
}
