/** Use same-origin /media proxy in the browser so images load without CORS issues. */
export function normalizeMediaUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("data:")) return url;
  if (url.includes(".digitaloceanspaces.com") || url.includes(".fal.media")) return url;
  try {
    const parsed = new URL(url, typeof window !== "undefined" ? window.location.origin : undefined);
    if (parsed.pathname.startsWith("/media/")) {
      return parsed.pathname;
    }
    if (parsed.hostname.endsWith(".digitaloceanspaces.com")) {
      return url;
    }
  } catch {
    if (url.startsWith("/media/")) return url;
  }
  return url;
}
