import type { Edge } from "@xyflow/react";
import type { EditorNode } from "@/store/editor-store";
import { inputHandleId } from "@/lib/dynamic-input-handles";
import type { ModelInputImage, NodeData } from "@/types";

export const GENERATION_X_OFFSET = 280;
export const GENERATION_Y_STEP = 200;

const RENDER_TYPES = new Set(["render", "detail"]);

export type MakeAction =
  | {
      mode: "create";
      sourceIds: string[];
      anchorSourceId: string;
    }
  | {
      mode: "rerun";
      renderNodeId: string;
      sourceIds: string[];
    }
  | {
      mode: "invalid";
      reason: "no_source" | "select_source";
    };

export function isRenderNodeType(type?: string): boolean {
  return Boolean(type && RENDER_TYPES.has(type));
}

function isCommittedRender(node?: EditorNode): boolean {
  return Boolean(
    node && isRenderNodeType(node.type) && node.data.isDraft !== true
  );
}

/** Finished / in-progress generations from this source (excludes transparent draft). */
export function countCommittedGenerationsFromSource(
  sourceId: string,
  nodes: EditorNode[],
  edges: Edge[]
): number {
  return edges.filter((e) => {
    if (e.source !== sourceId) return false;
    const target = nodes.find((n) => n.id === e.target);
    return isCommittedRender(target);
  }).length;
}

/** All render targets including draft preview. */
export function countGenerationsFromSource(
  sourceId: string,
  nodes: EditorNode[],
  edges: Edge[]
): number {
  const renderIds = new Set(
    nodes.filter((n) => isRenderNodeType(n.type)).map((n) => n.id)
  );
  return edges.filter((e) => e.source === sourceId && renderIds.has(e.target)).length;
}

export function draftNodeIdForSource(sourceId: string): string {
  return `draft-preview-${sourceId}`;
}

/** Pending render node (model chosen, Make not pressed yet). */
export function findDraftRenderForSource(
  sourceId: string,
  nodes: EditorNode[],
  edges: Edge[]
): EditorNode | undefined {
  return nodes.find(
    (n) =>
      isRenderNodeType(n.type) &&
      n.data.isDraft === true &&
      edges.some((e) => e.source === sourceId && e.target === n.id)
  );
}

export function resolveMakeAction(
  nodes: EditorNode[],
  edges: Edge[],
  selectedNodeId: string | null
): MakeAction {
  const selected = selectedNodeId
    ? nodes.find((n) => n.id === selectedNodeId)
    : undefined;

  if (selected && isRenderNodeType(selected.type)) {
    const sourceIds = edges
      .filter((e) => e.target === selected.id)
      .map((e) => e.source)
      .filter((id) => {
        const n = nodes.find((node) => node.id === id);
        return n?.type === "source" || isCommittedRender(n);
      });

    if (selected.data.isDraft) {
      const sourceEdge = edges.find((e) => e.target === selected.id);
      const anchorId =
        sourceEdge?.source &&
        nodes.find((n) => n.id === sourceEdge.source)?.type === "source"
          ? sourceEdge.source
          : sourceIds[0];
      if (anchorId) {
        return {
          mode: "create",
          sourceIds: [anchorId],
          anchorSourceId: anchorId,
        };
      }
    }

    return { mode: "rerun", renderNodeId: selected.id, sourceIds };
  }

  const sourcesWithImage = nodes.filter(
    (n) => n.type === "source" && n.data?.imageUrl
  );

  if (selected?.type === "source" && selected.data?.imageUrl) {
    return {
      mode: "create",
      sourceIds: [selected.id],
      anchorSourceId: selected.id,
    };
  }

  if (sourcesWithImage.length === 0) {
    return { mode: "invalid", reason: "no_source" };
  }

  if (sourcesWithImage.length === 1) {
    return {
      mode: "create",
      sourceIds: [sourcesWithImage[0].id],
      anchorSourceId: sourcesWithImage[0].id,
    };
  }

  return { mode: "invalid", reason: "select_source" };
}

export function sourceNodesFromIds(
  nodes: EditorNode[],
  sourceIds: string[]
): EditorNode[] {
  return sourceIds
    .map((id) => nodes.find((n) => n.id === id))
    .filter((n): n is EditorNode => n?.type === "source");
}

export function buildGenerationRenderNode(options: {
  sourceNodes: EditorNode[];
  generationIndex: number;
  positive: string;
  negative: string;
  modelSlug: string | null;
  categorySlug: string | null;
  inputImages: ModelInputImage[];
  modelName?: string;
  isDraft?: boolean;
}): EditorNode {
  const {
    sourceNodes,
    generationIndex,
    positive,
    negative,
    modelSlug,
    categorySlug,
    inputImages,
    modelName,
    isDraft = false,
  } = options;

  const anchor = sourceNodes[0];
  const genNum = isDraft ? 0 : generationIndex + 1;
  const x = anchor.position.x + GENERATION_X_OFFSET;
  const y = anchor.position.y + generationIndex * GENERATION_Y_STEP;

  const data: NodeData = {
    label: modelName ? `${modelName}` : `Generate ${generationIndex + 1}`,
    badge: isDraft ? "·" : String(generationIndex + 1),
    status: isDraft ? "idle" : "queued",
    isDraft,
    positive,
    negative,
    modelSlug: modelSlug ?? undefined,
    categorySlug: categorySlug ?? undefined,
    inputImages,
    generationIndex: genNum,
    sourceIds: sourceNodes.map((s) => s.id),
  };

  return {
    id: `render-${Date.now()}-${genNum}`,
    type: "render",
    position: { x, y },
    data,
  };
}

export function defaultGenerationPosition(
  source: EditorNode,
  slotIndex: number
): { x: number; y: number } {
  return {
    x: source.position.x + GENERATION_X_OFFSET,
    y: source.position.y + slotIndex * GENERATION_Y_STEP,
  };
}

export function buildGenerationEdges(
  sourceNodes: EditorNode[],
  renderNodeId: string,
  isDraft = false
): Edge[] {
  const ts = Date.now();
  return sourceNodes.map((source, index) => ({
    id: `e-${source.id}-${renderNodeId}-${ts}-${index}`,
    source: source.id,
    target: renderNodeId,
    targetHandle: inputHandleId(index),
    type: "smoothstep",
    animated: !isDraft,
    style: {
      stroke: isDraft
        ? "hsl(174 72% 46% / 0.45)"
        : "hsl(174 72% 46% / 0.6)",
      strokeWidth: 2,
      ...(isDraft ? { strokeDasharray: "6 4" } : {}),
    },
  }));
}
