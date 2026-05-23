"use client";

import { useMemo } from "react";
import { useEditorStore } from "@/store/editor-store";
import { useUIStore } from "@/store/ui-store";
import {
  resolveEditorPreviewMedia,
  resolveSelectedRenderProgress,
} from "@/lib/editor-preview";

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
  const renderProgress = useUIStore((s) => s.renderProgress);
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  const previewMedia = useMemo(
    () =>
      resolveEditorPreviewMedia(
        previewUrl,
        selectedNode,
        nodes,
        PREVIEW_PLACEHOLDER
      ),
    [previewUrl, selectedNode, nodes]
  );

  const displayProgress = useMemo(
    () => resolveSelectedRenderProgress(selectedNode, renderProgress),
    [selectedNode, renderProgress]
  );

  return {
    displayImage: previewMedia.url,
    previewMedia,
    displayProgress,
    selectedNode,
  };
}
