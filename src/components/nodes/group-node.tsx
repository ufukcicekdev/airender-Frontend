"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { NodeProps } from "@xyflow/react";
import { NodeResizer, useNodeId } from "@xyflow/react";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/store/editor-store";
import type { NodeData } from "@/types";

export function GroupNode({ selected, data }: NodeProps) {
  const nodeId = useNodeId();
  const updateNodeData = useEditorStore((s) => s.updateNodeData);
  const label = String((data as NodeData)?.label || "Group");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(label);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) setDraft(label);
  }, [label, editing]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commitLabel = useCallback(() => {
    const next = draft.trim() || "Group";
    if (nodeId) updateNodeData(nodeId, { label: next });
    setEditing(false);
  }, [draft, nodeId, updateNodeData]);

  return (
    <>
      <NodeResizer
        minWidth={200}
        minHeight={140}
        isVisible={selected}
        lineClassName="!border-[hsl(var(--viz-cyan)/0.5)]"
        handleClassName="!h-2.5 !w-2.5 !rounded-sm !border-[hsl(var(--viz-cyan))] !bg-[hsl(220,18%,12%)]"
      />
      <div
        className={cn(
          "relative h-full w-full rounded-xl border-2 border-dashed",
          "border-[hsl(var(--viz-cyan)/0.4)] bg-[hsl(220,18%,7%)/0.72]",
          selected &&
            "border-[hsl(var(--viz-cyan)/0.75)] ring-2 ring-[hsl(var(--viz-cyan)/0.2)]"
        )}
      >
        <div
          className="nodrag nopan absolute left-0 right-0 top-0 z-10 flex items-center gap-2 px-3 py-2"
          onDoubleClick={(e) => {
            e.stopPropagation();
            setEditing(true);
          }}
        >
          {editing ? (
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitLabel}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitLabel();
                if (e.key === "Escape") {
                  setDraft(label);
                  setEditing(false);
                }
              }}
              className="min-w-0 flex-1 rounded border border-[hsl(var(--viz-cyan)/0.5)] bg-[hsl(220,18%,10%)] px-2 py-0.5 text-xs font-semibold text-foreground outline-none ring-1 ring-[hsl(var(--viz-cyan)/0.3)]"
              placeholder="Group name"
            />
          ) : (
            <>
              <span className="truncate text-xs font-semibold uppercase tracking-wide text-[hsl(var(--viz-cyan))]">
                {label}
              </span>
              <span className="shrink-0 text-[10px] text-muted-foreground">
                double-click to rename
              </span>
            </>
          )}
        </div>
        {!editing && (
          <p className="pointer-events-none absolute bottom-3 left-0 right-0 text-center text-[10px] text-muted-foreground/80">
            Drag nodes into this area — they move together
          </p>
        )}
      </div>
    </>
  );
}
