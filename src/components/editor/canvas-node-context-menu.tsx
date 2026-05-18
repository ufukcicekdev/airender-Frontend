"use client";

import { useEffect, useRef } from "react";
import { Columns2, Eraser, ImageIcon, Paintbrush, Ungroup } from "lucide-react";
import { cn } from "@/lib/utils";
import { getNodeImageUrl, nodeCompareLabel } from "@/lib/node-image-url";
import type { EditorNode } from "@/store/editor-store";
import { useEditorStore } from "@/store/editor-store";
import { useUIStore } from "@/store/ui-store";

export type CanvasContextMenuState = {
  nodeId: string;
  x: number;
  y: number;
} | null;

type CanvasNodeContextMenuProps = {
  menu: CanvasContextMenuState;
  node: EditorNode | undefined;
  onClose: () => void;
};

export function CanvasNodeContextMenu({
  menu,
  node,
  onClose,
}: CanvasNodeContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const setCompareSlotA = useUIStore((s) => s.setCompareSlotA);
  const setCompareSlotB = useUIStore((s) => s.setCompareSlotB);
  const clearCompare = useUIStore((s) => s.clearCompare);
  const setPreviewTab = useUIStore((s) => s.setPreviewTab);
  const setDrawTarget = useUIStore((s) => s.setDrawTarget);
  const ungroupSelection = useEditorStore((s) => s.ungroupSelection);
  const setSelectedNodeIds = useEditorStore((s) => s.setSelectedNodeIds);

  const imageUrl = getNodeImageUrl(node);
  const isGroup = node?.type === "group";

  useEffect(() => {
    if (!menu) return;
    const onPointerDown = (e: MouseEvent) => {
      if (ref.current?.contains(e.target as Node)) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [menu, onClose]);

  if (!menu || !node) return null;

  if (isGroup) {
    return (
      <div
        ref={ref}
        className="fixed z-[100] min-w-[200px] overflow-hidden rounded-lg border border-border/80 bg-[hsl(220,18%,11%)] py-1 shadow-xl"
        style={{ left: menu.x, top: menu.y }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Group
        </p>
        <button
          type="button"
          onClick={() => {
            setSelectedNodeIds([node.id]);
            ungroupSelection();
            onClose();
          }}
          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-white/5"
        >
          <Ungroup className="h-4 w-4 text-[hsl(var(--viz-cyan))]" />
          Ungroup
        </button>
        <p className="px-3 pb-2 text-xs text-muted-foreground">
          Double-click the title to rename. Drag nodes into the area.
        </p>
      </div>
    );
  }

  const assignSlot = (slot: "A" | "B") => {
    if (!imageUrl) return;
    const payload = {
      nodeId: node.id,
      imageUrl,
      label: nodeCompareLabel(node),
    };
    if (slot === "A") setCompareSlotA(payload);
    else setCompareSlotB(payload);
    setPreviewTab("compare");
    onClose();
  };

  return (
    <div
      ref={ref}
      className="fixed z-[100] min-w-[200px] overflow-hidden rounded-lg border border-border/80 bg-[hsl(220,18%,11%)] py-1 shadow-xl"
      style={{ left: menu.x, top: menu.y }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        Compare
      </p>
      <button
        type="button"
        disabled={!imageUrl}
        onClick={() => assignSlot("A")}
        className={cn(
          "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-white/5",
          !imageUrl && "cursor-not-allowed opacity-40"
        )}
      >
        <ImageIcon className="h-4 w-4 text-[hsl(var(--viz-cyan))]" />
        Compare A
      </button>
      <button
        type="button"
        disabled={!imageUrl}
        onClick={() => assignSlot("B")}
        className={cn(
          "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-white/5",
          !imageUrl && "cursor-not-allowed opacity-40"
        )}
      >
        <Columns2 className="h-4 w-4 text-[hsl(var(--viz-cyan))]" />
        Compare B
      </button>
      {!imageUrl && (
        <p className="px-3 pb-2 text-xs text-muted-foreground">
          No image on this node
        </p>
      )}
      <div className="my-1 h-px bg-border/60" />
      <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        Draw
      </p>
      <button
        type="button"
        disabled={!imageUrl}
        onClick={() => {
          if (!imageUrl) return;
          setDrawTarget({
            nodeId: node.id,
            imageUrl,
            label: nodeCompareLabel(node),
          });
          setPreviewTab("draw");
          onClose();
        }}
        className={cn(
          "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-white/5",
          !imageUrl && "cursor-not-allowed opacity-40"
        )}
      >
        <Paintbrush className="h-4 w-4 text-[hsl(var(--viz-cyan))]" />
        Draw / Edit mask
      </button>
      <div className="my-1 h-px bg-border/60" />
      <button
        type="button"
        onClick={() => {
          clearCompare();
          onClose();
        }}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground"
      >
        <Eraser className="h-4 w-4" />
        Clear compare
      </button>
    </div>
  );
}
