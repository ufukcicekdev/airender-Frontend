import { normalizeMediaUrl } from "@/lib/media-url";
import type { EditorNode } from "@/store/editor-store";

/** Best display URL for compare / preview from a canvas node. */
export function getNodeImageUrl(node: EditorNode | undefined): string | undefined {
  if (!node) return undefined;
  const d = node.data;
  const url =
    (d.videoUrl as string) ||
    (d.imageUrl as string) ||
    (d.url as string) ||
    (d.thumbnailUrl as string);
  return url ? normalizeMediaUrl(String(url)) : undefined;
}

export function nodeCompareLabel(node: EditorNode): string {
  const label = String(node.data?.label || node.type || "Node");
  const badge = node.data?.badge ? ` #${node.data.badge}` : "";
  return `${label}${badge}`;
}
