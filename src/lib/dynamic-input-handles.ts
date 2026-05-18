import type { Connection, Edge } from "@xyflow/react";
import type { EditorNode } from "@/store/editor-store";

export interface InputPortInfo {
  id: string;
  index: number;
  connected: boolean;
  thumbnailUrl?: string;
}

export const INPUT_HANDLE_PREFIX = "input-";

export function inputHandleId(index: number): string {
  return `${INPUT_HANDLE_PREFIX}${index}`;
}

export function parseInputHandleIndex(handle?: string | null): number {
  if (!handle?.startsWith(INPUT_HANDLE_PREFIX)) return 0;
  const n = parseInt(handle.slice(INPUT_HANDLE_PREFIX.length), 10);
  return Number.isNaN(n) ? 0 : n;
}

/** One slot per connection + one empty slot for the next wire. */
export function computeInputSlotCount(connectedCount: number): number {
  return Math.max(1, connectedCount + 1);
}

/** Preview URL from a source or an upstream generation node. */
export function upstreamPreviewUrl(node?: EditorNode): string | undefined {
  if (!node?.data) return undefined;
  if (node.type === "source") {
    const url = node.data.thumbnailUrl || node.data.imageUrl;
    return url ? String(url) : undefined;
  }
  if (node.type === "render" || node.type === "detail") {
    const url =
      node.data.imageUrl || node.data.thumbnailUrl || node.data.url;
    return url ? String(url) : undefined;
  }
  return undefined;
}

export function isMultiInputTarget(node?: EditorNode): boolean {
  return node?.type === "render" || node?.type === "detail";
}

export function getInputHandleIds(slotCount: number): string[] {
  return Array.from({ length: slotCount }, (_, i) => inputHandleId(i));
}

/** Vertical position (%) for a port on the node card (preview zone, above footer). */
export function inputPortTopPercent(index: number, total: number): number {
  const topInset = 14;
  const bottomInset = 36;
  const range = 100 - topInset - bottomInset;
  if (total <= 1) return topInset + range / 2;
  return topInset + (range * index) / (total - 1);
}

export function buildInputPorts(
  targetId: string,
  nodes: EditorNode[],
  edges: Edge[]
): { ports: InputPortInfo[]; connectedCount: number } {
  const incoming = edges.filter((e) => e.target === targetId);
  const slotCount = computeInputSlotCount(incoming.length);
  const handleIds = getInputHandleIds(slotCount);
  const edgeByHandle = new Map<string, (typeof incoming)[0]>();

  for (const edge of incoming) {
    if (edge.targetHandle?.startsWith(INPUT_HANDLE_PREFIX)) {
      edgeByHandle.set(edge.targetHandle, edge);
    }
  }

  let orphanSlot = 0;
  for (const edge of incoming) {
    if (edge.targetHandle?.startsWith(INPUT_HANDLE_PREFIX)) continue;
    while (orphanSlot < handleIds.length && edgeByHandle.has(handleIds[orphanSlot])) {
      orphanSlot += 1;
    }
    if (orphanSlot < handleIds.length) {
      edgeByHandle.set(handleIds[orphanSlot], edge);
      orphanSlot += 1;
    }
  }

  const ports: InputPortInfo[] = handleIds.map((id, index) => {
    const edge = edgeByHandle.get(id);
    const source = edge ? nodes.find((n) => n.id === edge.source) : undefined;
    const thumb = upstreamPreviewUrl(source);
    return {
      id,
      index,
      connected: Boolean(edge),
      thumbnailUrl: thumb ? String(thumb) : undefined,
    };
  });

  return { ports, connectedCount: incoming.length };
}

export function firstFreeInputHandle(
  targetNodeId: string,
  edges: Edge[],
  slotCount: number
): string {
  const used = new Set(
    edges
      .filter((e) => e.target === targetNodeId && e.targetHandle)
      .map((e) => e.targetHandle as string)
  );
  for (let i = 0; i < slotCount; i++) {
    const id = inputHandleId(i);
    if (!used.has(id)) return id;
  }
  return inputHandleId(slotCount);
}

export function assignConnectionTargetHandle(
  connection: Connection,
  nodes: EditorNode[],
  edges: Edge[]
): Connection {
  const target = nodes.find((n) => n.id === connection.target);
  if (!target || !isMultiInputTarget(target)) {
    return connection;
  }

  const incoming = edges.filter((e) => e.target === connection.target);
  const slotCount = computeInputSlotCount(incoming.length);
  const targetHandle =
    connection.targetHandle || firstFreeInputHandle(connection.target!, edges, slotCount);

  return { ...connection, targetHandle };
}

export function edgesWithoutDuplicateTargetHandle(
  edges: Edge[],
  target: string,
  targetHandle: string
): Edge[] {
  return edges.filter(
    (e) => !(e.target === target && e.targetHandle === targetHandle)
  );
}

/** Assign input-0, input-1, … to legacy edges missing targetHandle. */
export function normalizeMultiInputEdges(edges: Edge[], nodes: EditorNode[]): Edge[] {
  const byTarget = new Map<string, Edge[]>();

  return edges.map((edge) => {
    const targetNode = nodes.find((n) => n.id === edge.target);
    if (!targetNode || !isMultiInputTarget(targetNode)) return edge;
    if (edge.targetHandle?.startsWith(INPUT_HANDLE_PREFIX)) return edge;

    const list = byTarget.get(edge.target) ?? [];
    const index = list.length;
    list.push(edge);
    byTarget.set(edge.target, list);

    return { ...edge, targetHandle: inputHandleId(index) };
  });
}
