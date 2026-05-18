"use client";

import { useEffect, useMemo } from "react";
import type { NodeProps } from "@xyflow/react";
import { useUpdateNodeInternals } from "@xyflow/react";
import { VizNodeCard } from "./viz-node-card";
import { useEditorStore } from "@/store/editor-store";
import { buildInputPorts } from "@/lib/dynamic-input-handles";
import type { NodeData } from "@/types";

export function DetailNode(props: NodeProps) {
  const data = props.data as NodeData;
  const edges = useEditorStore((s) => s.edges);
  const nodes = useEditorStore((s) => s.nodes);
  const updateNodeInternals = useUpdateNodeInternals();

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
        label: data.label || "Details editor",
        status: data.status || "idle",
      }}
      selected={props.selected}
      badge="2"
      subtitle="Create photorealistic image"
      dynamicInputs
      inputPorts={ports}
      connectedCount={connectedCount}
    />
  );
}
