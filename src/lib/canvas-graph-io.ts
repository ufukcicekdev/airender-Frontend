import type { Edge } from "@xyflow/react";
import type { EditorNode } from "@/store/editor-store";
import type { WorkflowGraph } from "@/types";

/** Node types the user sees on canvas (Vizmaker-style). */
export const CANVAS_NODE_TYPES = new Set(["source", "render", "detail", "group"]);

export function isCanvasGraph(graph: { nodes?: { type?: string }[] }): boolean {
  return Boolean(
    graph.nodes?.some((n) => CANVAS_NODE_TYPES.has(n.type ?? ""))
  );
}

/** Merge server canvas graph into editor state (keeps positions, updates data). */
export function mergeCanvasGraphFromServer(
  currentNodes: EditorNode[],
  currentEdges: Edge[],
  serverGraph: WorkflowGraph
): { nodes: EditorNode[]; edges: Edge[] } {
  const serverById = new Map(
    (serverGraph.nodes || []).map((n) => [n.id, n])
  );

  const nodes = currentNodes.map((node) => {
    const server = serverById.get(node.id);
    if (!server || !CANVAS_NODE_TYPES.has(node.type ?? "")) {
      return node;
    }
    const serverNode = server as EditorNode;
    return {
      ...node,
      data: { ...node.data, ...server.data },
      ...(serverNode.parentId !== undefined ? { parentId: serverNode.parentId } : {}),
      ...(serverNode.style ? { style: { ...node.style, ...serverNode.style } } : {}),
    };
  });

  return { nodes, edges: currentEdges };
}

/**
 * Persist only canvas nodes — not internal DAG types.
 * text_prompt / ai_model / image_output are built on the server at Make time.
 */
export function toCanvasGraph(nodes: EditorNode[], edges: Edge[]) {
  const canvasNodes = nodes.filter((n) => CANVAS_NODE_TYPES.has(n.type ?? ""));
  const ids = new Set(canvasNodes.map((n) => n.id));
  const canvasEdges = edges.filter(
    (e) => ids.has(e.source) && ids.has(e.target)
  );

  return {
    nodes: canvasNodes.map((n) => ({
      id: n.id,
      type: n.type,
      position: { x: n.position.x, y: n.position.y },
      data: { ...n.data },
      ...(n.parentId ? { parentId: n.parentId } : {}),
      ...(n.extent ? { extent: n.extent } : {}),
      ...(n.style ? { style: { ...n.style } } : {}),
      ...(n.width != null ? { width: n.width } : {}),
      ...(n.height != null ? { height: n.height } : {}),
    })),
    edges: canvasEdges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle,
      targetHandle: e.targetHandle,
    })),
  };
}
