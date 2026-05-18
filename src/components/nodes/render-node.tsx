"use client";

import { useEffect, useMemo } from "react";
import type { NodeProps } from "@xyflow/react";
import { useUpdateNodeInternals } from "@xyflow/react";
import { VizNodeCard } from "./viz-node-card";
import { useEditorStore } from "@/store/editor-store";
import { buildInputPorts } from "@/lib/dynamic-input-handles";
import type { NodeData } from "@/types";

export function RenderNode(props: NodeProps) {
  const data = props.data as NodeData;
  const edges = useEditorStore((s) => s.edges);
  const nodes = useEditorStore((s) => s.nodes);
  const updateNodeInternals = useUpdateNodeInternals();
  const badge = (data.badge as string) || "1";

  const { ports, connectedCount } = useMemo(
    () => buildInputPorts(props.id, nodes, edges),
    [edges, nodes, props.id]
  );

  const incomingKey = useMemo(
    () =>
      edges
        .filter((e) => e.target === props.id)
        .map((e) => `${e.id}:${e.targetHandle ?? ""}`)
        .join("|"),
    [edges, props.id]
  );

  useEffect(() => {
    updateNodeInternals(props.id);
  }, [props.id, ports.length, incomingKey, updateNodeInternals]);

  return (
    <VizNodeCard
      data={{
        ...data,
        label: data.label || "Generation",
        status: data.status || "idle",
      }}
      selected={props.selected}
      badge={badge}
      subtitle={
        data.isDraft
          ? "Generate with Make · preview"
          : data.positive
            ? String(data.positive)
            : "Generated result"
      }
      dynamicInputs
      inputPorts={ports}
      connectedCount={connectedCount}
    />
  );
}
