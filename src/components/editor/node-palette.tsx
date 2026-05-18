"use client";

import { NODE_PALETTE } from "@/components/nodes";
import { useEditorStore, type EditorNode } from "@/store/editor-store";

export function NodePalette() {
  const addNode = useEditorStore((s) => s.addNode);

  const handleAdd = (type: string, label: string) => {
    const node: EditorNode = {
      id: `${type}-${Date.now()}`,
      type,
      position: { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 },
      data: { label, status: "idle" },
    };
    addNode(node);
  };

  return (
    <div className="absolute left-20 top-16 z-10 w-48 rounded-xl border border-border/50 bg-card/80 p-2 shadow-glass backdrop-blur-xl">
      <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Add Node
      </p>
      <div className="space-y-1">
        {NODE_PALETTE.map(({ type, label }) => (
          <button
            key={type}
            onClick={() => handleAdd(type, label)}
            className="w-full rounded-lg px-2 py-1.5 text-left text-xs transition-colors hover:bg-white/10"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
