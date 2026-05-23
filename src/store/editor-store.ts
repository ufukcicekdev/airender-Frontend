import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
} from "@xyflow/react";
import { create } from "zustand";
import {
  assignConnectionTargetHandle,
  edgesWithoutDuplicateTargetHandle,
  normalizeMultiInputEdges,
} from "@/lib/dynamic-input-handles";
import { mergeCanvasGraphFromServer, toCanvasGraph } from "@/lib/canvas-graph-io";
import {
  applyGroupMembershipAfterDrag,
  createGroupOnCanvas,
  sortNodesParentFirst,
  ungroupNode,
} from "@/lib/canvas-groups";
import { countCommittedGenerationsFromSource } from "@/lib/generation-nodes";
import { getNodeMediaInfo } from "@/lib/node-image-url";
import { fromFlowData, isFlowNodeType } from "@/lib/flow-graph-io";
import type { FlowData } from "@/types/flow-graph";
import type { NodeData, Workflow, WorkflowGraph } from "@/types";

export type EditorNode = Node<NodeData>;

interface HistoryEntry {
  nodes: EditorNode[];
  edges: Edge[];
}

export type WorkflowLoadState = "idle" | "loading" | "ready" | "error";

interface EditorState {
  projectId: string | null;
  workflowId: string | null;
  workflowLoadState: WorkflowLoadState;
  projectName: string;
  nodes: EditorNode[];
  edges: Edge[];
  selectedNodeId: string | null;
  selectedNodeIds: string[];
  /** Last selected committed render — Make chains from this if selection clears. */
  makeAnchorRenderId: string | null;
  selectedEdgeIds: string[];
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: number | null;
  previewUrl: string | null;
  activeRenderTaskId: string | null;
  renderingNodeId: string | null;
  history: HistoryEntry[];
  historyIndex: number;
  /** Bumped after Make commits a preview so draft sync runs again. */
  draftSyncVersion: number;

  setProject: (projectId: string, workflowId: string, name: string) => void;
  setWorkflowLoadState: (state: WorkflowLoadState) => void;
  resetForProject: (projectId: string) => void;
  loadWorkflow: (workflow: Workflow) => void;
  onNodesChange: (changes: NodeChange<EditorNode>[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  setSelectedNode: (id: string | null) => void;
  setSelectedNodeIds: (ids: string[]) => void;
  setSelectedEdgeIds: (ids: string[]) => void;
  deleteSelectedEdges: () => void;
  createGroup: (options?: {
    position: { x: number; y: number };
    wrapNodeIds?: string[];
  }) => void;
  groupSelection: () => void;
  ungroupSelection: () => void;
  applyNodeGroupAfterDrag: (nodeId: string) => void;
  updateNodeData: (
    id: string,
    data: Partial<NodeData>,
    options?: { silent?: boolean }
  ) => void;
  setRenderingNodeId: (id: string | null) => void;
  setNodePosition: (id: string, position: { x: number; y: number }) => void;
  addNode: (node: EditorNode) => void;
  /** Add a render node + edges created by Make (generation-driven canvas). */
  spawnGeneration: (node: EditorNode, newEdges: Edge[]) => string;
  /** Turn preview node into a committed generation (frees draft id for next preview). */
  commitDraftPreview: (draftId: string, data: Partial<NodeData>) => string;
  bumpDraftSync: () => void;
  applyFlowData: (flow: FlowData) => void;
  mergeCanvasGraph: (graph: WorkflowGraph, options?: { silent?: boolean }) => void;
  getCanvasGraph: () => ReturnType<typeof toCanvasGraph>;
  duplicateSelected: () => void;
  deleteSelected: () => void;
  setDirty: (dirty: boolean) => void;
  setSaving: (saving: boolean) => void;
  setLastSavedAt: (timestamp: number | null) => void;
  setPreviewUrl: (url: string | null) => void;
  setActiveRenderTask: (id: string | null) => void;
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

const MAX_HISTORY = 50;

export const useEditorStore = create<EditorState>((set, get) => ({
  projectId: null,
  workflowId: null,
  workflowLoadState: "idle",
  projectName: "Untitled",
  nodes: [],
  edges: [],
  selectedNodeId: null,
  selectedNodeIds: [],
  makeAnchorRenderId: null,
  selectedEdgeIds: [],
  isDirty: false,
  isSaving: false,
  lastSavedAt: null,
  previewUrl: null,
  activeRenderTaskId: null,
  renderingNodeId: null,
  history: [],
  historyIndex: -1,
  draftSyncVersion: 0,

  setProject: (projectId, workflowId, name) =>
    set({ projectId, workflowId, projectName: name }),

  setWorkflowLoadState: (workflowLoadState) => set({ workflowLoadState }),

  resetForProject: (projectId) =>
    set({
      projectId,
      workflowId: null,
      workflowLoadState: "loading",
      projectName: "Untitled",
      nodes: [],
      edges: [],
      selectedNodeId: null,
      selectedNodeIds: [],
      selectedEdgeIds: [],
      isDirty: false,
      isSaving: false,
      lastSavedAt: null,
      previewUrl: null,
      activeRenderTaskId: null,
      renderingNodeId: null,
      history: [],
      historyIndex: -1,
      draftSyncVersion: 0,
    }),

  loadWorkflow: (workflow) => {
    const graph = workflow.graph || { nodes: [], edges: [] };
    const rawNodes = graph.nodes || [];
    const hasFlow = rawNodes.some((n: { type?: string }) =>
      isFlowNodeType(n.type)
    );

    let nodes: EditorNode[];
    let edges: Edge[];

    if (hasFlow) {
      ({ nodes, edges } = fromFlowData(graph as FlowData));
    } else {
      nodes = sortNodesParentFirst(rawNodes as EditorNode[]);
      edges = normalizeMultiInputEdges((graph.edges || []) as Edge[], nodes);
    }

    set({
      workflowId: workflow.id,
      workflowLoadState: "ready",
      nodes,
      edges,
      isDirty: false,
      lastSavedAt: Date.now(),
      history: [{ nodes, edges }],
      historyIndex: 0,
    });
  },

  applyFlowData: (flow) => {
    const { nodes, edges } = fromFlowData(flow);
    set({ nodes, edges, isDirty: true });
  },

  mergeCanvasGraph: (graph, options) => {
    const { nodes, edges } = get();
    const merged = mergeCanvasGraphFromServer(nodes, edges, graph);
    set({
      nodes: merged.nodes,
      edges: merged.edges,
      ...(options?.silent ? {} : { isDirty: true }),
    });
  },

  getCanvasGraph: () => {
    const { nodes, edges } = get();
    return toCanvasGraph(nodes, edges);
  },

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
      isDirty: true,
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
      isDirty: true,
    });
  },

  onConnect: (connection) => {
    const nodes = get().nodes;
    let edges = get().edges;

    const sourceNode = nodes.find((n) => n.id === connection.source);
    const targetNode = nodes.find((n) => n.id === connection.target);

    if (
      connection.target &&
      connection.targetHandle &&
      edges.some(
        (e) =>
          e.target === connection.target &&
          e.targetHandle === connection.targetHandle &&
          e.source === connection.source
      )
    ) {
      return;
    }

    const canWire =
      sourceNode?.type === "source" ||
      (sourceNode?.type === "render" &&
        (sourceNode.data?.imageUrl || sourceNode.data?.isDraft === false));
    const canReceive =
      targetNode?.type === "render" || targetNode?.type === "detail";

    if (!canWire || !canReceive) {
      return;
    }

    const assigned = assignConnectionTargetHandle(connection, nodes, edges);

    if (assigned.target && assigned.targetHandle) {
      edges = edgesWithoutDuplicateTargetHandle(
        edges,
        assigned.target,
        assigned.targetHandle
      );
    }

    const newEdge = {
      ...assigned,
      type: "smoothstep" as const,
      animated: true,
    };

    set({
      edges: addEdge(newEdge, edges),
      isDirty: true,
    });
  },

  setSelectedNode: (id) => {
    const nodes = get().nodes;
    const n = id ? nodes.find((node) => node.id === id) : undefined;
    const makeAnchorRenderId =
      n &&
      (n.type === "render" || n.type === "detail") &&
      n.data.isDraft !== true
        ? id
        : null;
    const selectedMedia = getNodeMediaInfo(n)?.url ?? null;
    set({
      selectedNodeId: id,
      selectedNodeIds: id ? [id] : [],
      makeAnchorRenderId,
      ...(selectedMedia ? { previewUrl: selectedMedia } : {}),
    });
  },

  setSelectedNodeIds: (selectedNodeIds) => {
    const nodes = get().nodes;
    const makeAnchorRenderId =
      selectedNodeIds.find((id) => {
        const n = nodes.find((node) => node.id === id);
        return (
          n &&
          (n.type === "render" || n.type === "detail") &&
          n.data.isDraft !== true
        );
      }) ?? null;
    const primary = selectedNodeIds[0]
      ? nodes.find((node) => node.id === selectedNodeIds[0])
      : undefined;
    const selectedMedia = getNodeMediaInfo(primary)?.url ?? null;
    set({
      selectedNodeIds,
      selectedNodeId: selectedNodeIds[0] ?? null,
      makeAnchorRenderId,
      ...(selectedMedia ? { previewUrl: selectedMedia } : {}),
    });
  },

  setSelectedEdgeIds: (selectedEdgeIds) => set({ selectedEdgeIds }),

  deleteSelectedEdges: () => {
    const { selectedEdgeIds, edges } = get();
    if (!selectedEdgeIds.length) return;
    get().pushHistory();
    const remove = new Set(selectedEdgeIds);
    set({
      edges: edges.filter((e) => !remove.has(e.id)),
      selectedEdgeIds: [],
      isDirty: true,
    });
  },

  createGroup: (options) => {
    const { nodes, selectedNodeIds } = get();
    const wrapNodeIds =
      options?.wrapNodeIds ??
      selectedNodeIds.filter((id) => {
        const n = nodes.find((node) => node.id === id);
        return n && n.type !== "group" && !n.parentId;
      });
    const position = options?.position ?? { x: 120, y: 120 };
    get().pushHistory();
    const result = createGroupOnCanvas(nodes, { position, wrapNodeIds });
    set({
      nodes: result.nodes,
      selectedNodeId: result.newGroupId,
      selectedNodeIds: [result.newGroupId],
      isDirty: true,
    });
  },

  groupSelection: () => {
    get().createGroup();
  },

  applyNodeGroupAfterDrag: (nodeId) => {
    const next = applyGroupMembershipAfterDrag(get().nodes, nodeId);
    if (next === get().nodes) return;
    set({ nodes: next, isDirty: true });
  },

  ungroupSelection: () => {
    const { nodes, selectedNodeId, selectedNodeIds } = get();
    const groupId =
      nodes.find((n) => n.id === selectedNodeId && n.type === "group")?.id ??
      selectedNodeIds.find((id) => nodes.find((n) => n.id === id)?.type === "group");
    if (!groupId) return;
    get().pushHistory();
    const next = ungroupNode(nodes, groupId);
    set({ nodes: next, selectedNodeId: null, selectedNodeIds: [], isDirty: true });
  },

  updateNodeData: (id, data, options) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...data } } : n
      ),
      ...(options?.silent ? {} : { isDirty: true }),
    });
  },

  setRenderingNodeId: (renderingNodeId) => set({ renderingNodeId }),

  setNodePosition: (id, position) => {
    const node = get().nodes.find((n) => n.id === id);
    if (!node) return;
    if (node.position.x === position.x && node.position.y === position.y) {
      return;
    }
    set({
      nodes: get().nodes.map((n) =>
        n.id === id ? { ...n, position } : n
      ),
      isDirty: true,
    });
  },

  addNode: (node) => {
    get().pushHistory();
    set({ nodes: [...get().nodes, node], isDirty: true });
  },

  spawnGeneration: (node, newEdges) => {
    get().pushHistory();
    const nodes = get().nodes;
    const edges = normalizeMultiInputEdges([...get().edges, ...newEdges], [
      ...nodes,
      node,
    ]);
    set({
      nodes: [...nodes, node],
      edges,
      selectedNodeId: node.data.isDraft ? get().selectedNodeId : node.id,
      isDirty: true,
    });
    return node.id;
  },

  commitDraftPreview: (draftId, data) => {
    const { nodes, edges } = get();
    const draft = nodes.find((n) => n.id === draftId);
    if (!draft || draft.data.isDraft !== true) return draftId;

    get().pushHistory();

    const sourceId =
      (draft.data.sourceIds as string[] | undefined)?.[0] ??
      edges.find((e) => e.target === draftId)?.source;
    const genIndex = sourceId
      ? countCommittedGenerationsFromSource(sourceId, nodes, edges) + 1
      : 1;
    const newId = `render-${Date.now()}-${genIndex}`;

    const nextNodes = nodes.map((n) =>
      n.id === draftId
        ? {
            ...n,
            id: newId,
            data: {
              ...n.data,
              ...data,
              isDraft: false,
              badge: String(genIndex),
              generationIndex: genIndex,
            },
          }
        : n
    );
    const nextEdges = edges.map((e) =>
      e.target === draftId
        ? { ...e, id: e.id.replace(draftId, newId), target: newId }
        : e
    );

    const keepSourceSelected = Boolean(sourceId);

    set({
      nodes: nextNodes,
      edges: nextEdges,
      selectedNodeId: keepSourceSelected ? sourceId! : newId,
      selectedNodeIds: keepSourceSelected ? [sourceId!] : [newId],
      draftSyncVersion: get().draftSyncVersion + 1,
      isDirty: true,
    });
    return newId;
  },

  bumpDraftSync: () =>
    set((s) => ({ draftSyncVersion: s.draftSyncVersion + 1 })),

  duplicateSelected: () => {
    const { selectedNodeId, nodes } = get();
    if (!selectedNodeId) return;
    const source = nodes.find((n) => n.id === selectedNodeId);
    if (!source) return;
    get().pushHistory();
    const copy: EditorNode = {
      ...source,
      id: `${source.type}-${Date.now()}`,
      position: { x: source.position.x + 40, y: source.position.y + 40 },
      selected: false,
    };
    set({ nodes: [...nodes, copy], isDirty: true });
  },

  deleteSelected: () => {
    const { selectedNodeId, selectedNodeIds, nodes, edges } = get();
    const ids = selectedNodeIds.length
      ? selectedNodeIds
      : selectedNodeId
        ? [selectedNodeId]
        : [];
    if (!ids.length) return;
    get().pushHistory();
    const remove = new Set(ids);
    const draftIds = new Set(
      ids.map((id) => `draft-preview-${id}`)
    );
    set({
      nodes: nodes.filter((n) => !remove.has(n.id) && !draftIds.has(n.id)),
      edges: edges.filter(
        (e) => !remove.has(e.source) && !remove.has(e.target)
      ),
      selectedNodeId: null,
      selectedNodeIds: [],
      isDirty: true,
    });
  },

  setDirty: (isDirty) => set({ isDirty }),
  setSaving: (isSaving) => set({ isSaving }),
  setLastSavedAt: (lastSavedAt) => set({ lastSavedAt }),
  setPreviewUrl: (previewUrl) => set({ previewUrl }),
  setActiveRenderTask: (activeRenderTaskId) => set({ activeRenderTaskId }),

  pushHistory: () => {
    const { nodes, edges, history, historyIndex } = get();
    const trimmed = history.slice(0, historyIndex + 1);
    const entry = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    };
    const next = [...trimmed, entry].slice(-MAX_HISTORY);
    set({ history: next, historyIndex: next.length - 1 });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex <= 0) return;
    const prev = history[historyIndex - 1];
    set({
      nodes: prev.nodes,
      edges: prev.edges,
      historyIndex: historyIndex - 1,
      isDirty: true,
    });
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return;
    const next = history[historyIndex + 1];
    set({
      nodes: next.nodes,
      edges: next.edges,
      historyIndex: historyIndex + 1,
      isDirty: true,
    });
  },

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,
}));
