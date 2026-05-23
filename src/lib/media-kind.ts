import type { MediaKind } from "@/lib/download-media";
import type { EditorNode } from "@/store/editor-store";

const VIDEO_SUFFIXES = [".mp4", ".webm", ".mov", ".m4v"];

export function looksLikeVideoUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const path = url.split("?")[0].toLowerCase();
  return VIDEO_SUFFIXES.some((suffix) => path.endsWith(suffix));
}

export function inferMediaKind(
  url: string | null | undefined,
  node?: EditorNode
): MediaKind {
  if (node?.data?.videoUrl) return "video";
  if (String(node?.data?.outputType || "").toLowerCase() === "video") return "video";
  if (node?.data?.categorySlug === "image-to-video") return "video";
  if (looksLikeVideoUrl(url)) return "video";
  if (
    url &&
    url.includes("/api/render/") &&
    url.endsWith("/preview") &&
    node?.data?.categorySlug === "image-to-video"
  ) {
    return "video";
  }
  return "image";
}

/** Prefer same-origin URLs for playback in the editor. */
export function toPlayableMediaUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("data:")) return url;
  if (url.startsWith("/api/") || url.startsWith("/media/")) return url;
  try {
    const parsed = new URL(url, typeof window !== "undefined" ? window.location.origin : undefined);
    if (parsed.pathname.startsWith("/media/")) {
      return parsed.pathname;
    }
  } catch {
    /* keep absolute URL */
  }
  return url;
}
