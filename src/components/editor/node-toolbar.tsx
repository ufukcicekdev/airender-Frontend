"use client";

import { Group, Image, Layers, Plus, Ungroup } from "lucide-react";
import { cn } from "@/lib/utils";
import { createPaletteNode } from "@/lib/create-palette-node";
import { useEditorStore } from "@/store/editor-store";
import { useUIStore } from "@/store/ui-store";

/**
 * Vizmaker-style toolbar: upload / add source, group, canvas dots.
 */
export function NodeToolbar() {
  const addNode = useEditorStore((s) => s.addNode);
  const setSelectedNodeIds = useEditorStore((s) => s.setSelectedNodeIds);
  const nodeCount = useEditorStore((s) => s.nodes.length);
  const nodes = useEditorStore((s) => s.nodes);
  const selectedNodeIds = useEditorStore((s) => s.selectedNodeIds);
  const ungroupSelection = useEditorStore((s) => s.ungroupSelection);
  const requestNewGroup = useUIStore((s) => s.requestNewGroup);
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const showCanvasDots = useUIStore((s) => s.showCanvasDots);
  const toggleCanvasDots = useUIStore((s) => s.toggleCanvasDots);

  const addSource = () => {
    const node = createPaletteNode("source", "Source Image", nodeCount);
    addNode(node);
    setSelectedNodeIds([node.id]);
  };

  const hasGroupSelected = selectedNodeIds.some(
    (id) => nodes.find((n) => n.id === id)?.type === "group"
  );

  return (
    <aside
      className={cn(
        "flex shrink-0 border-border/60 bg-[hsl(220,20%,7%)]",
        "flex-row items-center gap-0.5 overflow-x-auto border-b px-2 py-1.5",
        "lg:w-12 lg:flex-col lg:gap-1 lg:overflow-visible lg:border-b-0 lg:border-r lg:py-3"
      )}
    >
      <button
        type="button"
        title="Commands (⌘K)"
        onClick={() => setCommandPaletteOpen(true)}
        className="mb-0 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--viz-cyan)/0.15)] text-[hsl(var(--viz-cyan))] hover:bg-[hsl(var(--viz-cyan)/0.25)] lg:mb-2"
      >
        <Plus className="h-4 w-4" />
      </button>
      <button
        type="button"
        title="Add source image"
        onClick={addSource}
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors",
          "hover:bg-white/5 hover:text-[hsl(var(--viz-cyan))]"
        )}
      >
        <Image className="h-4 w-4" strokeWidth={1.75} />
      </button>
      <button
        type="button"
        title="Add group area — drag nodes inside (⌘G)"
        onClick={() => requestNewGroup()}
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors",
          "hover:bg-white/5 hover:text-[hsl(var(--viz-cyan))]"
        )}
      >
        <Group className="h-4 w-4" strokeWidth={1.75} />
      </button>
      <button
        type="button"
        title="Ungroup (⌘⇧G)"
        disabled={!hasGroupSelected}
        onClick={ungroupSelection}
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors",
          hasGroupSelected
            ? "hover:bg-white/5 hover:text-[hsl(var(--viz-cyan))]"
            : "cursor-not-allowed opacity-35"
        )}
      >
        <Ungroup className="h-4 w-4" strokeWidth={1.75} />
      </button>
      <button
        type="button"
        title={showCanvasDots ? "Hide dot grid" : "Show dot grid"}
        onClick={toggleCanvasDots}
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
          showCanvasDots
            ? "bg-[hsl(var(--viz-cyan)/0.12)] text-[hsl(var(--viz-cyan))]"
            : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
        )}
      >
        <Layers className="h-4 w-4" strokeWidth={1.75} />
      </button>
    </aside>
  );
}
