import { collectCanvasSourceImages } from "@/lib/canvas-input-images";
import { getNodeMediaInfo } from "@/lib/node-image-url";
import { normalizeMediaUrl } from "@/lib/media-url";
import type { EditorNode } from "@/store/editor-store";

/** Preview image for the right panel — selected node wins over stale global previewUrl. */
export function resolveEditorDisplayImage(
  previewUrl: string | null,
  selectedNode: EditorNode | undefined,
  nodes: EditorNode[],
  placeholder: string
): string {
  const fromSelected = getNodeMediaInfo(selectedNode)?.url;
  if (fromSelected) return fromSelected;

  const selectedStatus = selectedNode?.data?.status;
  const selectedIsLive =
    selectedNode &&
    (selectedNode.type === "render" || selectedNode.type === "detail") &&
    (selectedStatus === "processing" || selectedStatus === "queued");

  if (selectedIsLive && previewUrl) {
    const live = normalizeMediaUrl(previewUrl);
    if (live) return live;
  }

  const inputImages = selectedNode?.data?.inputImages;
  if (Array.isArray(inputImages)) {
    for (const item of inputImages) {
      if (item && typeof item === "object" && "url" in item) {
        const u = normalizeMediaUrl(String((item as { url: string }).url));
        if (u) return u;
      }
    }
  }

  const canvasImages = collectCanvasSourceImages(nodes);
  const firstInput = canvasImages[0]?.url;
  if (firstInput) {
    const u = normalizeMediaUrl(firstInput);
    if (u) return u;
  }

  const sourceNode = nodes.find((n) => n.type === "source");
  const sourceUrl = normalizeMediaUrl(sourceNode?.data?.imageUrl as string);
  if (sourceUrl) return sourceUrl;

  return placeholder;
}

/** Progress bar for the selected render node (not a stale global 0% after another task finished). */
export function resolveSelectedRenderProgress(
  selectedNode: EditorNode | undefined,
  globalProgress: number
): number {
  if (!selectedNode || (selectedNode.type !== "render" && selectedNode.type !== "detail")) {
    return globalProgress;
  }

  const status = selectedNode.data.status;
  if (status === "completed" || getNodeMediaInfo(selectedNode)) {
    return 100;
  }
  if (status === "processing" || status === "queued") {
    const p = selectedNode.data.progress;
    return typeof p === "number" ? p : globalProgress;
  }
  return globalProgress;
}
