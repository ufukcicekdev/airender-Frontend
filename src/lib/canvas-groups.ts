import type { EditorNode } from "@/store/editor-store";

const GROUP_PADDING = 48;
const DEFAULT_GROUP_WIDTH = 440;
const DEFAULT_GROUP_HEIGHT = 320;

export function getNodeSize(node: EditorNode): { width: number; height: number } {
  const w = Number(node.measured?.width ?? node.width ?? node.style?.width ?? 220);
  const h = Number(node.measured?.height ?? node.height ?? node.style?.height ?? 160);
  return { width: w, height: h };
}

export function getGroupSize(node: EditorNode): { width: number; height: number } {
  const w = Number(node.style?.width ?? node.width ?? DEFAULT_GROUP_WIDTH);
  const h = Number(node.style?.height ?? node.height ?? DEFAULT_GROUP_HEIGHT);
  return { width: w, height: h };
}

/** React Flow requires parent nodes before children in the nodes array. */
export function sortNodesParentFirst(nodes: EditorNode[]): EditorNode[] {
  const sorted: EditorNode[] = [];
  const added = new Set<string>();

  const addNode = (node: EditorNode) => {
    if (added.has(node.id)) return;
    if (node.parentId) {
      const parent = nodes.find((n) => n.id === node.parentId);
      if (parent && !added.has(parent.id)) addNode(parent);
    }
    sorted.push(node);
    added.add(node.id);
  };

  for (const node of nodes) addNode(node);
  return sorted;
}

export function getAbsolutePosition(
  nodes: EditorNode[],
  node: EditorNode
): { x: number; y: number } {
  let x = node.position.x;
  let y = node.position.y;
  let parentId = node.parentId;
  while (parentId) {
    const parent = nodes.find((n) => n.id === parentId);
    if (!parent) break;
    x += parent.position.x;
    y += parent.position.y;
    parentId = parent.parentId;
  }
  return { x, y };
}

export function createGroupNode(
  position: { x: number; y: number },
  size: { width: number; height: number },
  label = "Group"
): EditorNode {
  const id = `group_${crypto.randomUUID().slice(0, 8)}`;
  return {
    id,
    type: "group",
    position,
    data: { label },
    style: {
      width: size.width,
      height: size.height,
      zIndex: 0,
    },
    draggable: true,
    selectable: true,
  };
}

function attachNodesToGroup(
  nodes: EditorNode[],
  group: EditorNode,
  nodeIds: string[]
): EditorNode[] {
  const groupX = group.position.x;
  const groupY = group.position.y;

  return nodes.map((n) => {
    if (!nodeIds.includes(n.id)) return n;
    const abs = getAbsolutePosition(nodes, n);
    return {
      ...n,
      parentId: group.id,
      extent: "parent" as const,
      position: {
        x: abs.x - groupX,
        y: abs.y - groupY,
      },
    };
  });
}

export type CreateGroupOptions = {
  /** Center of new empty group when nothing is wrapped. */
  position: { x: number; y: number };
  label?: string;
  wrapNodeIds?: string[];
};

/**
 * Add a group frame on canvas. Optionally wrap existing nodes (no shift-select required).
 */
export function createGroupOnCanvas(
  nodes: EditorNode[],
  options: CreateGroupOptions
): { nodes: EditorNode[]; newGroupId: string } {
  const wrapIds = (options.wrapNodeIds ?? []).filter((id) => {
    const n = nodes.find((node) => node.id === id);
    return n && n.type !== "group" && !n.parentId;
  });

  let group: EditorNode;

  if (wrapIds.length > 0) {
    const selected = nodes.filter((n) => wrapIds.includes(n.id));
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const n of selected) {
      const abs = getAbsolutePosition(nodes, n);
      const { width, height } = getNodeSize(n);
      minX = Math.min(minX, abs.x);
      minY = Math.min(minY, abs.y);
      maxX = Math.max(maxX, abs.x + width);
      maxY = Math.max(maxY, abs.y + height);
    }

    const groupX = minX - GROUP_PADDING;
    const groupY = minY - GROUP_PADDING;
    group = createGroupNode(
      { x: groupX, y: groupY },
      {
        width: maxX - minX + GROUP_PADDING * 2,
        height: maxY - minY + GROUP_PADDING * 2,
      },
      options.label ?? "Group"
    );

    const attached = attachNodesToGroup(nodes, group, wrapIds);
    return {
      nodes: sortNodesParentFirst([...attached, group]),
      newGroupId: group.id,
    };
  }

  group = createGroupNode(
    {
      x: options.position.x - DEFAULT_GROUP_WIDTH / 2,
      y: options.position.y - DEFAULT_GROUP_HEIGHT / 2,
    },
    { width: DEFAULT_GROUP_WIDTH, height: DEFAULT_GROUP_HEIGHT },
    options.label ?? "Group"
  );

  return {
    nodes: sortNodesParentFirst([...nodes, group]),
    newGroupId: group.id,
  };
}

/** @deprecated Use createGroupOnCanvas */
export function groupSelectedNodes(
  nodes: EditorNode[],
  selectedIds: string[]
): { nodes: EditorNode[]; newGroupId: string } | null {
  const movable = selectedIds.filter((id) => {
    const n = nodes.find((node) => node.id === id);
    return n && n.type !== "group" && !n.parentId;
  });
  if (movable.length < 1) return null;

  return createGroupOnCanvas(nodes, {
    position: { x: 0, y: 0 },
    wrapNodeIds: movable,
  });
}

export function ungroupNode(nodes: EditorNode[], groupId: string): EditorNode[] {
  const group = nodes.find((n) => n.id === groupId);
  if (!group) return nodes;

  return nodes
    .filter((n) => n.id !== groupId)
    .map((n) => {
      if (n.parentId !== groupId) return n;
      const abs = getAbsolutePosition(nodes, n);
      const { parentId: _p, extent: _e, ...rest } = n;
      return {
        ...rest,
        position: abs,
      };
    });
}

function pointInGroup(
  px: number,
  py: number,
  group: EditorNode
): boolean {
  const { width, height } = getGroupSize(group);
  return (
    px >= group.position.x &&
    py >= group.position.y &&
    px <= group.position.x + width &&
    py <= group.position.y + height
  );
}

/** After drag: snap node into / out of group based on node center. */
export function applyGroupMembershipAfterDrag(
  nodes: EditorNode[],
  draggedNodeId: string
): EditorNode[] {
  const node = nodes.find((n) => n.id === draggedNodeId);
  if (!node || node.type === "group") return nodes;

  const abs = getAbsolutePosition(nodes, node);
  const { width, height } = getNodeSize(node);
  const cx = abs.x + width / 2;
  const cy = abs.y + height / 2;

  const groups = nodes.filter((n) => n.type === "group" && n.id !== draggedNodeId);
  let targetGroup: EditorNode | undefined;
  for (const g of groups) {
    if (pointInGroup(cx, cy, g)) targetGroup = g;
  }

  if (targetGroup?.id === node.parentId) return nodes;

  if (targetGroup) {
    return sortNodesParentFirst(
      nodes.map((n) => {
        if (n.id !== draggedNodeId) return n;
        return {
          ...n,
          parentId: targetGroup!.id,
          extent: "parent" as const,
          position: {
            x: abs.x - targetGroup!.position.x,
            y: abs.y - targetGroup!.position.y,
          },
        };
      })
    );
  }

  if (node.parentId) {
    return nodes.map((n) => {
      if (n.id !== draggedNodeId) return n;
      const { parentId: _p, extent: _e, ...rest } = n;
      return { ...rest, position: abs };
    });
  }

  return nodes;
}
