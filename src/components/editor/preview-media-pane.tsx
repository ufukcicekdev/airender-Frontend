"use client";

import { GripHorizontal } from "lucide-react";
import { ImageCompareSlider } from "@/components/editor/image-compare-slider";
import { useResizablePaneHeight } from "@/hooks/use-resizable-pane-height";
import { cn } from "@/lib/utils";
import type { CompareSlot } from "@/store/ui-store";

const PLACEHOLDER =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="220" viewBox="0 0 400 220">
      <rect fill="#0d0f12" width="400" height="220"/>
      <text x="200" y="115" text-anchor="middle" fill="#5a6478" font-size="14" font-family="system-ui">Preview</text>
    </svg>`
  );

type PreviewMediaPaneProps = {
  layout?: "panel" | "workspace";
  mode: "preview" | "compare";
  singleImage: string;
  slotA: CompareSlot | null;
  slotB: CompareSlot | null;
  split: number;
  onSplitChange: (v: number) => void;
  storageKey?: string;
  defaultHeight?: number;
  hint?: string;
};

export function PreviewMediaPane({
  layout = "panel",
  mode,
  singleImage,
  slotA,
  slotB,
  split,
  onSplitChange,
  storageKey = "viz-right-preview-height",
  defaultHeight = 280,
  hint,
}: PreviewMediaPaneProps) {
  const isWorkspace = layout === "workspace";
  const { height, isResizing, startResize, resetHeight } = useResizablePaneHeight(
    storageKey,
    defaultHeight,
    160,
    640
  );

  const canCompare = Boolean(slotA?.imageUrl && slotB?.imageUrl);
  const showSlider = mode === "compare" ? canCompare : canCompare;

  return (
    <div
      className={cn(
        "relative flex flex-col",
        isWorkspace
          ? "h-full min-h-0 flex-1 p-4"
          : "border-b border-border/60 p-3"
      )}
    >
      <div
        className={cn(
          "overflow-hidden rounded-md border border-border/50 bg-black",
          isWorkspace && "min-h-0 flex-1"
        )}
        style={isWorkspace ? undefined : { height }}
      >
        {showSlider ? (
          <ImageCompareSlider
            imageA={slotA!.imageUrl}
            imageB={slotB!.imageUrl}
            labelA={slotA!.label}
            labelB={slotB!.label}
            split={split}
            onSplitChange={onSplitChange}
            className="h-full min-h-[200px]"
          />
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={singleImage || PLACEHOLDER}
            alt="Preview"
            className={cn(
              "w-full object-contain",
              isWorkspace ? "h-full min-h-[200px]" : "h-full"
            )}
          />
        )}
      </div>

      {mode === "compare" && !canCompare && (
        <p className="mt-2 shrink-0 text-xs leading-relaxed text-muted-foreground">
          {hint ??
            "Right-click a node on the canvas and choose Compare A / Compare B."}
        </p>
      )}

      {canCompare && mode === "preview" && !isWorkspace && (
        <p className="mt-2 text-xs text-[hsl(var(--viz-cyan)/0.9)]">
          A and B assigned — use the slider to compare
        </p>
      )}

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
  );
}
