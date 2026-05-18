import type { EditorNode } from "@/store/editor-store";
import type { Edge } from "@xyflow/react";

/** Empty canvas — users add sources via upload; render nodes appear on Make. */
export function createStarterWorkflow(): { nodes: EditorNode[]; edges: Edge[] } {
  return { nodes: [], edges: [] };
}
