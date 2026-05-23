import { APP_EXPORT_PREFIX } from "@/lib/brand";
import { normalizeMediaUrl } from "@/lib/media-url";

export type MediaKind = "image" | "video";

const PLACEHOLDER_PREFIX = "data:image/svg+xml";

export function isDownloadableMediaUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  if (url.startsWith(PLACEHOLDER_PREFIX)) return false;
  return url.startsWith("data:") || url.startsWith("http") || url.startsWith("/");
}

function resolveFetchUrl(url: string): string {
  if (url.startsWith("data:")) return url;
  if (url.startsWith("/") && typeof window !== "undefined") {
    return `${window.location.origin}${url}`;
  }
  return url;
}

function extensionFor(kind: MediaKind, mime?: string, url?: string): string {
  if (kind === "video") return "mp4";
  if (mime?.includes("png")) return "png";
  if (mime?.includes("webp")) return "webp";
  if (mime?.includes("jpeg") || mime?.includes("jpg")) return "jpg";
  const path = url?.split("?")[0] ?? "";
  const match = path.match(/\.([a-z0-9]+)$/i);
  if (match && ["png", "jpg", "jpeg", "webp", "gif", "mp4", "webm"].includes(match[1].toLowerCase())) {
    return match[1].toLowerCase() === "jpeg" ? "jpg" : match[1].toLowerCase();
  }
  return "png";
}

export function defaultDownloadFilename(
  baseName: string,
  kind: MediaKind,
  mime?: string,
  url?: string
): string {
  const safe = baseName
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 48) || APP_EXPORT_PREFIX;
  const ext = extensionFor(kind, mime, url);
  return `${safe}.${ext}`;
}

function triggerBlobDownload(blob: Blob, filename: string) {
  const blobUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = blobUrl;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(blobUrl);
}

function triggerAnchorDownload(url: string, filename: string) {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener noreferrer";
  anchor.target = "_blank";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

/** Download image or video to the user's device. */
export async function downloadMedia(
  rawUrl: string,
  options?: { filename?: string; kind?: MediaKind }
): Promise<void> {
  const url = normalizeMediaUrl(rawUrl) ?? rawUrl;
  if (!isDownloadableMediaUrl(url)) {
    throw new Error("Nothing to download");
  }

  const kind =
    options?.kind ??
    (url.includes(".mp4") || url.includes(".webm") ? "video" : "image");
  const filename =
    options?.filename ?? defaultDownloadFilename(APP_EXPORT_PREFIX, kind, undefined, url);

  if (url.startsWith("data:")) {
    triggerAnchorDownload(url, filename);
    return;
  }

  const fetchUrl = resolveFetchUrl(url);

  try {
    const response = await fetch(fetchUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob();
    const name =
      options?.filename ??
      defaultDownloadFilename(APP_EXPORT_PREFIX, kind, blob.type, url);
    triggerBlobDownload(blob, name);
  } catch {
    triggerAnchorDownload(fetchUrl, filename);
  }
}
