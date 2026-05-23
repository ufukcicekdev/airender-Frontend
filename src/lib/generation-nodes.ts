import type { Edge } from "@xyflow/react";
import { useEditorStore, type EditorNode } from "@/store/editor-store";
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
      /** Use this finished render's output as the input image (keeps prior node). */
      branchFromRenderId?: string;
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

/** Finished generation with output — used for UI hints. */
export function isCompletedRenderNode(node?: EditorNode): boolean {
  if (!node || !isCommittedRender(node)) return false;
  const status = node.data.status as string | undefined;
  return Boolean(
    node.data.imageUrl ||
      node.data.videoUrl ||
      status === "completed" ||
      status === "failed"
  );
}

/** Walk upstream edges to the original source node (for draft slot / metadata). */
export function findRootSourceIdForRender(
  renderId: string,
  nodes: EditorNode[],
  edges: Edge[]
): string | undefined {
  const visited = new Set<string>();
  let current: string | undefined = renderId;

  while (current && !visited.has(current)) {
    visited.add(current);
    const parents = edges
      .filter((e) => e.target === current)
      .map((e) => nodes.find((n) => n.id === e.source))
      .filter((n): n is EditorNode => Boolean(n));

    const sourceParent = parents.find((p) => p.type === "source");
    if (sourceParent) return sourceParent.id;

    const renderParent = parents.find((p) => isCommittedRender(p));
    if (renderParent) {
      current = renderParent.id;
      continue;
    }
    break;
  }
  return undefined;
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

/** Child render nodes wired out of a completed render (for chaining Make). */
export function countCommittedChildrenFromRender(
  renderId: string,
  nodes: EditorNode[],
  edges: Edge[]
): number {
  return edges.filter((e) => {
    if (e.source !== renderId) return false;
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
  selectedNodeId: string | null,
  options?: { allowNoSource?: boolean; makeAnchorRenderId?: string | null }
): MakeAction {
  const allowNoSource = options?.allowNoSource ?? false;
  const focusId = selectedNodeId ?? options?.makeAnchorRenderId ?? null;
  const selected = focusId ? nodes.find((n) => n.id === focusId) : undefined;

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

    // Committed render (incl. completed / idle / failed): always chain from selection.
    if (isCommittedRender(selected)) {
      const anchorId =
        findRootSourceIdForRender(selected.id, nodes, edges) ??
        edges.find(
          (e) =>
            e.target === selected.id &&
            nodes.find((n) => n.id === e.source)?.type === "source"
        )?.source ??
        sourceIds.find((id) => nodes.find((n) => n.id === id)?.type === "source");

      return {
        mode: "create",
        sourceIds: anchorId ? [anchorId] : [],
        anchorSourceId: anchorId ?? "",
        branchFromRenderId: selected.id,
      };
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
    if (allowNoSource) {
      return { mode: "create", sourceIds: [], anchorSourceId: "" };
    }
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
  /** Position anchor — source node or parent render for chained Make. */
  anchorNode: EditorNode;
  generationIndex: number;
  positive: string;
  negative: string;
  modelSlug: string | null;
  categorySlug: string | null;
  inputImages: ModelInputImage[];
  modelName?: string;
  isDraft?: boolean;
  /** When true, place beside parent render (same Y for first child). */
  chainFromRender?: boolean;
  /** Original source id(s) stored on the node for draft reposition. */
  sourceIdsForData?: string[];
}): EditorNode {
  const {
    anchorNode,
    generationIndex,
    positive,
    negative,
    modelSlug,
    categorySlug,
    inputImages,
    modelName,
    isDraft = false,
    chainFromRender = false,
    sourceIdsForData = [],
  } = options;

  const parentGen =
    chainFromRender && typeof anchorNode.data.generationIndex === "number"
      ? anchorNode.data.generationIndex
      : 0;
  const genNum = isDraft
    ? 0
    : chainFromRender
      ? parentGen + 1 + generationIndex
      : generationIndex + 1;
  const x = anchorNode.position.x + GENERATION_X_OFFSET;
  const y = anchorNode.position.y + generationIndex * GENERATION_Y_STEP;

  const data: NodeData = {
    label: modelName ? `${modelName}` : `Generate ${generationIndex + 1}`,
    badge: isDraft ? "·" : String(genNum),
    status: isDraft ? "idle" : "queued",
    isDraft,
    positive,
    negative,
    modelSlug: modelSlug ?? undefined,
    categorySlug: categorySlug ?? undefined,
    inputImages,
    generationIndex: genNum,
    sourceIds: sourceIdsForData,
    ...(chainFromRender ? { parentRenderId: anchorNode.id } : {}),
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

/** Move draft preview beside source after source drag (skip if user placed draft manually). */
export function repositionDraftPreviewForSource(sourceId: string): void {
  const { nodes, edges, setNodePosition } = useEditorStore.getState();
  const source = nodes.find((n) => n.id === sourceId);
  const draft = findDraftRenderForSource(sourceId, nodes, edges);
  if (!source || !draft || draft.data.userPositioned === true) return;

  const slot = countCommittedGenerationsFromSource(sourceId, nodes, edges);
  setNodePosition(draft.id, defaultGenerationPosition(source, slot));
}

function edgeStyle(isDraft: boolean) {
  return {
    stroke: isDraft
      ? "hsl(174 72% 46% / 0.45)"
      : "hsl(174 72% 46% / 0.6)",
    strokeWidth: 2,
    ...(isDraft ? { strokeDasharray: "6 4" } : {}),
  } as const;
}

/** Wire parent nodes (source or render) into a new render target. */
export function buildGenerationEdges(
  parentNodes: EditorNode[],
  renderNodeId: string,
  isDraft = false
): Edge[] {
  const ts = Date.now();
  return parentNodes.map((parent, index) => ({
    id: `e-${parent.id}-${renderNodeId}-${ts}-${index}`,
    source: parent.id,
    target: renderNodeId,
    targetHandle: inputHandleId(index),
    type: "smoothstep",
    animated: !isDraft,
    style: edgeStyle(isDraft),
  }));
}
