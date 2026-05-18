"use client";

import type { NodeProps } from "@xyflow/react";
import { FlowNodeShell } from "./flow-node-shell";
import { FLOW_HANDLES } from "@/types/flow-graph";
import type { FlowAiModelData } from "@/types/flow-graph";
import { useEditorStore } from "@/store/editor-store";

const ASPECT_RATIOS = ["1:1", "16:9", "9:16", "4:3"];

export function AiModelNode(props: NodeProps) {
  const updateNodeData = useEditorStore((s) => s.updateNodeData);
  const data = props.data as unknown as FlowAiModelData & {
    label?: string;
    status?: string;
  };

  return (
    <FlowNodeShell
      title={data.label || "AI Model"}
      subtitle={`${data.model_name ?? "Model"} · prompt_input → image_output`}
      selected={props.selected}
      inputs={[
        { id: FLOW_HANDLES.aiModel.promptInput, type: "target", label: "prompt" },
      ]}
      outputs={[
        { id: FLOW_HANDLES.aiModel.imageOutput, type: "source", label: "image" },
      ]}
    >
      <div className="space-y-2 text-[11px]">
        <label className="block text-muted-foreground">
          Model
          <input
            value={String(data.model_name ?? "")}
            onChange={(e) => updateNodeData(props.id, { model_name: e.target.value })}
            className="nodrag nopan mt-0.5 w-full rounded border border-border/50 bg-[hsl(220,20%,8%)] px-2 py-1 text-foreground"
          />
        </label>
        <label className="block text-muted-foreground">
          Aspect
          <select
            value={String(data.aspect_ratio ?? "16:9")}
            onChange={(e) => updateNodeData(props.id, { aspect_ratio: e.target.value })}
            className="nodrag nopan mt-0.5 w-full rounded border border-border/50 bg-[hsl(220,20%,8%)] px-2 py-1 text-foreground"
          >
            {ASPECT_RATIOS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-muted-foreground">
          Steps
          <input
            type="number"
            min={1}
            max={100}
            value={Number(data.steps ?? 30)}
            onChange={(e) =>
              updateNodeData(props.id, { steps: parseInt(e.target.value, 10) || 30 })
            }
            className="nodrag nopan mt-0.5 w-full rounded border border-border/50 bg-[hsl(220,20%,8%)] px-2 py-1 text-foreground"
          />
        </label>
        {data.status && (
          <p className="text-[10px] text-[hsl(var(--viz-cyan))]">Status: {data.status}</p>
        )}
      </div>
    </FlowNodeShell>
  );
}
