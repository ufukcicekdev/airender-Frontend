import { isAxiosError } from "axios";

/** User-facing message from a failed API call. */
export function getApiErrorMessage(error: unknown, fallback = "Request failed."): string {
  if (!isAxiosError(error)) {
    return fallback;
  }

  const data = error.response?.data as Record<string, unknown> | undefined;
  if (!data) {
    if (error.response?.status === 402) {
      return "Insufficient credits.";
    }
    return error.message || fallback;
  }

  if (typeof data.error === "string") {
    return data.error;
  }
  if (typeof data.detail === "string") {
    return data.detail;
  }
  if (Array.isArray(data.non_field_errors) && data.non_field_errors[0]) {
    return String(data.non_field_errors[0]);
  }

  const firstKey = Object.keys(data)[0];
  if (firstKey) {
    const val = data[firstKey];
    if (Array.isArray(val) && val[0]) return `${firstKey}: ${val[0]}`;
    if (typeof val === "string") return val;
  }

  return fallback;
}
