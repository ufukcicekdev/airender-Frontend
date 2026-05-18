"use client";

import type { NodeProps } from "@xyflow/react";
import { FlowNodeShell } from "./flow-node-shell";
import { useEditorStore } from "@/store/editor-store";
import { FLOW_HANDLES } from "@/types/flow-graph";
import type { FlowTextPromptData } from "@/types/flow-graph";

export function TextPromptNode(props: NodeProps) {
  const updateNodeData = useEditorStore((s) => s.updateNodeData);
  const data = props.data as unknown as FlowTextPromptData & { label?: string };

  return (
    <FlowNodeShell
      title={data.label || "Text Prompt"}
      subtitle="Root input · output"
      selected={props.selected}
      outputs={[{ id: FLOW_HANDLES.textPrompt.output, type: "source", label: "output" }]}
    >
      <textarea
        value={String(data.text ?? "")}
        onChange={(e) =>
          updateNodeData(props.id, { text: e.target.value, label: "Text Prompt" })
        }
        rows={4}
        className="nodrag nopan w-full resize-none rounded-md border border-border/50 bg-[hsl(220,20%,8%)] px-2 py-1.5 text-[11px] text-foreground outline-none focus:border-[hsl(var(--viz-cyan)/0.5)]"
        placeholder="Describe your image…"
      />
    </FlowNodeShell>
  );
}
