"use client";

import { useMemo } from "react";
import { useEditorStore } from "@/store/editor-store";
import { normalizeMediaUrl } from "@/lib/media-url";
import { collectCanvasSourceImages } from "@/lib/canvas-input-images";

const PREVIEW_PLACEHOLDER =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
      <rect fill="#0d0f12" width="800" height="600"/>
      <text x="400" y="300" text-anchor="middle" fill="#5a6478" font-size="18" font-family="system-ui">Preview</text>
    </svg>`
  );

/** Shared preview / compare image for right panel and workspace overlay. */
export function useEditorMediaDisplay() {
  const previewUrl = useEditorStore((s) => s.previewUrl);
  const nodes = useEditorStore((s) => s.nodes);
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  const canvasImages = useMemo(
    () => collectCanvasSourceImages(nodes),
    [nodes]
  );
  const firstInputPreview = canvasImages[0]?.url;
  const sourceNode = nodes.find((n) => n.type === "source");
  const selectedPreview =
    selectedNode?.type === "source"
      ? (selectedNode.data?.imageUrl as string)
      : selectedNode?.type === "render" || selectedNode?.type === "detail"
        ? (selectedNode.data?.imageUrl as string) ||
          (selectedNode.data?.thumbnailUrl as string)
        : undefined;

  const displayImage =
    previewUrl ||
    normalizeMediaUrl(selectedPreview) ||
    normalizeMediaUrl(firstInputPreview) ||
    normalizeMediaUrl(sourceNode?.data?.imageUrl as string) ||
    PREVIEW_PLACEHOLDER;

  return { displayImage, selectedNode };
}
