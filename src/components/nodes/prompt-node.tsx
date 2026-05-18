"use client";

import type { NodeProps } from "@xyflow/react";
import { MessageSquare } from "lucide-react";
import { BaseNode } from "./base-node";
import { useEditorStore } from "@/store/editor-store";
import type { NodeData } from "@/types";

export function PromptNode(props: NodeProps) {
  const updateNodeData = useEditorStore((s) => s.updateNodeData);
  const data = props.data as NodeData;

  return (
    <BaseNode {...props} icon={<MessageSquare className="h-4 w-4" />} color="from-violet-500/20 to-fuchsia-500/10">
      <textarea
        placeholder="Positive prompt..."
        className="w-full resize-none rounded-md border border-border bg-background/50 p-2 text-xs"
        rows={2}
        value={(data.positive as string) || ""}
        onChange={(e) => updateNodeData(props.id, { positive: e.target.value })}
      />
      <textarea
        placeholder="Negative prompt..."
        className="w-full resize-none rounded-md border border-border bg-background/50 p-2 text-xs"
        rows={2}
        value={(data.negative as string) || ""}
        onChange={(e) => updateNodeData(props.id, { negative: e.target.value })}
      />
    </BaseNode>
  );
}
