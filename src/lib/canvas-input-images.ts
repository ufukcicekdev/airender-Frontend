import type { Edge } from "@xyflow/react";
import type { EditorNode } from "@/store/editor-store";
import { parseInputHandleIndex } from "@/lib/dynamic-input-handles";
import { getNodeMaskDataUrl } from "@/lib/node-draw-mask";
import type { ModelInputImage } from "@/types";

export function nodeToModelInputImage(node: EditorNode): ModelInputImage | null {
  if (!node.data?.imageUrl) return null;
  const maskUrl = getNodeMaskDataUrl(node);
  return {
    id: node.id,
    url: String(node.data.imageUrl),
    thumbnailUrl: node.data.thumbnailUrl ? String(node.data.thumbnailUrl) : undefined,
    name: node.data.label ? String(node.data.label) : undefined,
    ...(maskUrl ? { maskUrl } : {}),
  };
}

/** All source nodes on the canvas that have an image (for Make / validation). */
export function collectCanvasSourceImages(nodes: EditorNode[]): ModelInputImage[] {
  return nodes
    .filter((n) => n.type === "source" && n.data?.imageUrl)
    .map((n) => nodeToModelInputImage(n))
    .filter((img): img is ModelInputImage => img !== null);
}

/** Source nodes wired into a render/detail node (ordered by input port). */
export function collectImagesForRenderTarget(
  targetId: string,
  nodes: EditorNode[],
  edges: Edge[]
): ModelInputImage[] {
  const incoming = edges
    .filter((e) => e.target === targetId)
    .sort(
      (a, b) =>
        parseInputHandleIndex(a.targetHandle) - parseInputHandleIndex(b.targetHandle)
    );

  const images: ModelInputImage[] = [];
  for (const edge of incoming) {
    const source = nodes.find((n) => n.id === edge.source);
    if (source?.type === "source" && source.data?.imageUrl) {
      const img = nodeToModelInputImage(source);
      if (img) images.push(img);
    }
  }
  return images;
}

export function pickInputImagesForMake(
  nodes: EditorNode[],
  edges: Edge[],
  selectedNodeId: string | null
): ModelInputImage[] {
  const target =
    selectedNodeId && ["render", "detail"].includes(nodes.find((n) => n.id === selectedNodeId)?.type ?? "")
      ? selectedNodeId
      : nodes.find((n) => n.type === "render" || n.type === "detail")?.id;

  if (target) {
    const connected = collectImagesForRenderTarget(target, nodes, edges);
    if (connected.length) return connected;
  }

  return collectCanvasSourceImages(nodes);
}
