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
  return "image";
}
