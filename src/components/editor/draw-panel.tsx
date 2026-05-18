"use client";

import { useCallback, useEffect, useMemo } from "react";
import {
  Eraser,
  GripHorizontal,
  Paintbrush,
  Trash2,
} from "lucide-react";
import { ImageDrawCanvas } from "@/components/editor/image-draw-canvas";
import { PaneExpandButton } from "@/components/editor/pane-expand-button";
import { useResizablePaneHeight } from "@/hooks/use-resizable-pane-height";
import { getNodeImageUrl, nodeCompareLabel } from "@/lib/node-image-url";
import { nodeHasDrawMask } from "@/lib/node-draw-mask";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/store/editor-store";
import { useUIStore } from "@/store/ui-store";

const DRAWABLE_TYPES = new Set(["source", "render", "detail"]);

type DrawPanelProps = {
  layout?: "panel" | "workspace";
};

export function DrawPanel({ layout = "panel" }: DrawPanelProps) {
  const isWorkspace = layout === "workspace";
  const nodes = useEditorStore((s) => s.nodes);
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
  const updateNodeData = useEditorStore((s) => s.updateNodeData);
  const setDirty = useEditorStore((s) => s.setDirty);

  const {
    drawTarget,
    setDrawTarget,
    drawTool,
    setDrawTool,
    drawBrushSize,
    setDrawBrushSize,
    previewTab,
  } = useUIStore();

  const { height, isResizing, startResize, resetHeight } = useResizablePaneHeight(
    "viz-right-draw-height",
    isWorkspace ? 600 : 340,
    200,
    720
  );

  const targetNode = useMemo(
    () => nodes.find((n) => n.id === drawTarget?.nodeId),
    [nodes, drawTarget?.nodeId]
  );

  const maskDataUrl = targetNode?.data?.maskDataUrl as string | undefined;

  useEffect(() => {
    if (previewTab !== "draw" || drawTarget) return;
    const selected = nodes.find((n) => n.id === selectedNodeId);
    if (!selected || !DRAWABLE_TYPES.has(selected.type ?? "")) return;
    const url = getNodeImageUrl(selected);
    if (!url) return;
    setDrawTarget({
      nodeId: selected.id,
      imageUrl: url,
      label: nodeCompareLabel(selected),
    });
  }, [previewTab, drawTarget, selectedNodeId, nodes, setDrawTarget]);

  useEffect(() => {
    if (previewTab !== "draw" || !selectedNodeId || drawTarget?.nodeId === selectedNodeId) {
      return;
    }
    const selected = nodes.find((n) => n.id === selectedNodeId);
    if (!selected || !DRAWABLE_TYPES.has(selected.type ?? "")) return;
    const url = getNodeImageUrl(selected);
    if (!url) return;
    setDrawTarget({
      nodeId: selected.id,
      imageUrl: url,
      label: nodeCompareLabel(selected),
    });
  }, [previewTab, selectedNodeId, nodes, drawTarget?.nodeId, setDrawTarget]);

  const onMaskChange = useCallback(
    (mask: string | null) => {
      if (!drawTarget?.nodeId) return;
      updateNodeData(drawTarget.nodeId, {
        maskDataUrl: mask ?? undefined,
        hasMask: Boolean(mask),
      });
      setDirty(true);
    },
    [drawTarget?.nodeId, updateNodeData, setDirty]
  );

  const clearMask = () => {
    window.dispatchEvent(new Event("viz:draw-clear"));
  };

  if (!drawTarget?.imageUrl) {
    return (
      <div
        className={cn(
          "p-6 text-center",
          isWorkspace ? "flex flex-1 flex-col justify-center" : "border-b border-border/60"
        )}
      >
        <p className="text-sm text-muted-foreground">
          Select a node with an image, or right-click and choose{" "}
          <strong className="text-foreground">Draw / Mask</strong>.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Painted areas are sent as a mask with Make for inpaint / edit workflows.
        </p>
      </div>
    );
  }

  const hasMask = nodeHasDrawMask(targetNode);

  return (
    <div
      className={cn(
        "flex flex-col",
        isWorkspace ? "h-full min-h-0 flex-1" : "border-b border-border/60"
      )}
    >
      <div className="flex flex-wrap items-center gap-2 border-b border-border/40 px-3 py-2">
        <span className="text-xs font-medium text-[hsl(var(--viz-cyan))]">
          {drawTarget.label}
        </span>
        {hasMask && (
          <span className="rounded bg-[hsl(var(--viz-cyan)/0.15)] px-1.5 py-0.5 text-[10px] font-semibold text-[hsl(var(--viz-cyan))]">
            Mask set
          </span>
        )}
        <div className="ml-auto flex items-center gap-1">
          {!isWorkspace && <PaneExpandButton />}
          <button
            type="button"
            title="Brush"
            onClick={() => setDrawTool("brush")}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
              drawTool === "brush"
                ? "bg-[hsl(var(--viz-cyan)/0.2)] text-[hsl(var(--viz-cyan))]"
                : "text-muted-foreground hover:bg-white/5"
            )}
          >
            <Paintbrush className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Eraser"
            onClick={() => setDrawTool("eraser")}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
              drawTool === "eraser"
                ? "bg-[hsl(var(--viz-cyan)/0.2)] text-[hsl(var(--viz-cyan))]"
                : "text-muted-foreground hover:bg-white/5"
            )}
          >
            <Eraser className="h-4 w-4" />
          </button>
          <label className="flex items-center gap-1.5 px-1 text-xs text-muted-foreground">
            <span className="hidden sm:inline">Size</span>
            <input
              type="range"
              min={4}
              max={72}
              value={drawBrushSize}
              onChange={(e) => setDrawBrushSize(Number(e.target.value))}
              className="h-1 w-20 accent-[hsl(var(--viz-cyan))]"
            />
          </label>
          <button
            type="button"
            title="Clear mask"
            onClick={clearMask}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-white/5 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className={cn("flex min-h-0 flex-1 flex-col", isWorkspace ? "p-4" : "p-3")}>
        <div
          className={cn(
            "overflow-hidden rounded-md border border-border/50 bg-black",
            isWorkspace && "min-h-0 flex-1"
          )}
          style={isWorkspace ? undefined : { height }}
        >
          <ImageDrawCanvas
            key={drawTarget.nodeId}
            imageUrl={drawTarget.imageUrl}
            maskDataUrl={maskDataUrl}
            brushSize={drawBrushSize}
            tool={drawTool}
            onMaskChange={onMaskChange}
            className="h-full"
          />
        </div>
        <p className="mt-2 shrink-0 text-xs leading-relaxed text-muted-foreground">
          Paint areas to edit in cyan. The mask is sent with this node when you press Make.
        </p>
        {!isWorkspace && (
          <div
            role="separator"
            aria-orientation="horizontal"
            title="Drag to resize height · double-click to reset"
            onMouseDown={startResize}
            onDoubleClick={resetHeight}
            className={cn(
              "mt-2 flex h-3 cursor-row-resize items-center justify-center rounded-md transition-colors",
              isResizing
                ? "bg-[hsl(var(--viz-cyan)/0.2)]"
                : "hover:bg-white/5"
            )}
          >
            <GripHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        )}
      </div>
    </div>
  );
}
