import type { MediaKind } from "@/lib/download-media";
import { looksLikeVideoUrl } from "@/lib/media-kind";
import { normalizeMediaUrl } from "@/lib/media-url";
import type { EditorNode } from "@/store/editor-store";

export type NodeMediaInfo = { url: string; kind: MediaKind };

/** Best display URL for compare / preview from a canvas node. */
export function getNodeImageUrl(node: EditorNode | undefined): string | undefined {
  return getNodeMediaInfo(node)?.url;
}

/** URL + type for download / export from a canvas node. */
export function getNodeMediaInfo(node: EditorNode | undefined): NodeMediaInfo | null {
  if (!node) return null;
  const d = node.data;
  const videoRaw = d.videoUrl as string | undefined;
  if (videoRaw) {
    const url = normalizeMediaUrl(videoRaw);
    return url ? { url, kind: "video" } : null;
  }
  const imageRaw =
    (d.imageUrl as string) ||
    (d.url as string) ||
    (d.thumbnailUrl as string);
  if (!imageRaw) return null;
  const url = normalizeMediaUrl(String(imageRaw));
  if (!url) return null;
  const kind: MediaKind =
    looksLikeVideoUrl(url) ||
    String(d.outputType || "").toLowerCase() === "video" ||
    d.categorySlug === "image-to-video"
      ? "video"
      : "image";
  return { url, kind };
}

export function nodeCompareLabel(node: EditorNode): string {
  const label = String(node.data?.label || node.type || "Node");
  const badge = node.data?.badge ? ` #${node.data.badge}` : "";
  return `${label}${badge}`;
}
