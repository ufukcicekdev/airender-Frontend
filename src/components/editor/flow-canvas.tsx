"use client";

import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  MarkerType,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useState } from "react";
import { Grid3x3, Group, ImagePlus } from "lucide-react";
import { nodeTypes } from "@/components/nodes";
import {
  CanvasNodeContextMenu,
  type CanvasContextMenuState,
} from "@/components/editor/canvas-node-context-menu";
import { createPaletteNode } from "@/lib/create-palette-node";
import { useAssetUpload } from "@/hooks/use-asset-upload";
import { useEditorStore } from "@/store/editor-store";
import { useUIStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";

function CanvasInner() {
  const nodes = useEditorStore((s) => s.nodes);
  const edges = useEditorStore((s) => s.edges);
  const onNodesChange = useEditorStore((s) => s.onNodesChange);
  const onEdgesChange = useEditorStore((s) => s.onEdgesChange);
  const onConnect = useEditorStore((s) => s.onConnect);
  const setSelectedNodeIds = useEditorStore((s) => s.setSelectedNodeIds);
  const setSelectedEdgeIds = useEditorStore((s) => s.setSelectedEdgeIds);
  const pushHistory = useEditorStore((s) => s.pushHistory);
  const addNode = useEditorStore((s) => s.addNode);
  const createGroup = useEditorStore((s) => s.createGroup);
  const applyNodeGroupAfterDrag = useEditorStore((s) => s.applyNodeGroupAfterDrag);
  const updateNodeData = useEditorStore((s) => s.updateNodeData);
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
  const showCanvasDots = useUIStore((s) => s.showCanvasDots);
  const toggleCanvasDots = useUIStore((s) => s.toggleCanvasDots);
  const groupCreateSignal = useUIStore((s) => s.groupCreateSignal);
  const { screenToFlowPosition } = useReactFlow();
  const { uploadFile, uploading } = useAssetUpload();
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [contextMenu, setContextMenu] = useState<CanvasContextMenuState>(null);

  const contextNode = contextMenu
    ? nodes.find((n) => n.id === contextMenu.nodeId)
    : undefined;

  const onSelectionChange = useCallback(
    ({
      nodes: selectedNodes,
      edges: selectedEdges,
    }: {
      nodes: { id: string }[];
      edges: { id: string }[];
    }) => {
      const nodeIds = selectedNodes.map((n) => n.id);
      const edgeIds = selectedEdges.map((e) => e.id);
      const { selectedNodeIds, selectedEdgeIds } = useEditorStore.getState();
      const sameNodes =
        nodeIds.length === selectedNodeIds.length &&
        nodeIds.every((id, i) => id === selectedNodeIds[i]);
      const sameEdges =
        edgeIds.length === selectedEdgeIds.length &&
        edgeIds.every((id, i) => id === selectedEdgeIds[i]);
      if (sameNodes && sameEdges) return;
      setSelectedNodeIds(nodeIds);
      setSelectedEdgeIds(edgeIds);
    },
    [setSelectedNodeIds, setSelectedEdgeIds]
  );

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: { id: string }) => {
      event.preventDefault();
      setContextMenu({ nodeId: node.id, x: event.clientX, y: event.clientY });
    },
    []
  );

  useEffect(() => {
    if (groupCreateSignal === 0) return;
    const pane = document.querySelector(".react-flow");
    const bounds = pane?.getBoundingClientRect();
    const position = bounds
      ? screenToFlowPosition({
          x: bounds.left + bounds.width / 2,
          y: bounds.top + bounds.height / 2,
        })
      : { x: 200, y: 200 };
    const wrapNodeIds = useEditorStore.getState().selectedNodeIds;
    createGroup({ position, wrapNodeIds });
  }, [groupCreateSignal, screenToFlowPosition, createGroup]);

  const onPaneClick = useCallback(() => {
    setContextMenu(null);
  }, []);

  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: { id: string; type?: string }) => {
      pushHistory();
      updateNodeData(node.id, { userPositioned: true });
      if (node.type !== "group") {
        applyNodeGroupAfterDrag(node.id);
      }
    },
    [pushHistory, updateNodeData, applyNodeGroupAfterDrag]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    if (e.dataTransfer.types.includes("Files")) {
      e.preventDefault();
      setIsDraggingFile(true);
    }
  }, []);

  const onDragLeave = useCallback(() => {
    setIsDraggingFile(false);
  }, []);

  const onDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDraggingFile(false);
      const file = e.dataTransfer.files?.[0];
      if (!file?.type.startsWith("image/")) return;

      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      const selected = nodes.find((n) => n.id === selectedNodeId);

      if (selected?.type === "source") {
        updateNodeData(selected.id, { status: "processing" });
        const result = await uploadFile(file);
        if (result) {
          updateNodeData(selected.id, {
            imageUrl: result.imageUrl,
            thumbnailUrl: result.thumbnailUrl,
            status: "idle",
          });
        }
        return;
      }

      const result = await uploadFile(file);
      if (!result) return;

      const node = createPaletteNode("source", "Source", nodes.length);
      node.position = position;
      node.data = {
        ...node.data,
        imageUrl: result.imageUrl,
        thumbnailUrl: result.thumbnailUrl,
      };
      addNode(node);
      setSelectedNodeIds([node.id]);
    },
    [
      nodes,
      selectedNodeId,
      screenToFlowPosition,
      uploadFile,
      addNode,
      updateNodeData,
      setSelectedNodeIds,
    ]
  );

  return (
    <div className="relative h-full w-full" onDragLeave={onDragLeave}>
      {isDraggingFile && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-[hsl(var(--viz-cyan)/0.08)] ring-2 ring-inset ring-[hsl(var(--viz-cyan)/0.4)]">
          <div className="flex flex-col items-center gap-2 rounded-xl bg-black/60 px-6 py-4 backdrop-blur-sm">
            <ImagePlus className="h-10 w-10 text-[hsl(var(--viz-cyan))]" />
            <p className="text-sm font-medium">Drop image to upload</p>
          </div>
        </div>
      )}
      {uploading && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-black/40">
          <p className="rounded-lg bg-black/70 px-4 py-2 text-sm">Uploading…</p>
        </div>
      )}

      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2">
        <button
          type="button"
          title="Add group area (⌘G)"
          onClick={() => useUIStore.getState().requestNewGroup()}
          className="flex h-9 items-center gap-1.5 rounded-lg border border-border/60 bg-[hsl(220,18%,10%)/0.9] px-2.5 text-xs font-medium text-muted-foreground shadow-md backdrop-blur-sm transition-colors hover:text-[hsl(var(--viz-cyan))]"
        >
          <Group className="h-4 w-4" />
          Group
        </button>
        <button
          type="button"
          title={showCanvasDots ? "Hide dot grid" : "Show dot grid"}
          onClick={toggleCanvasDots}
          className={cn(
            "flex h-9 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium shadow-md backdrop-blur-sm transition-colors",
            showCanvasDots
              ? "border-[hsl(var(--viz-cyan)/0.5)] bg-[hsl(var(--viz-cyan)/0.12)] text-[hsl(var(--viz-cyan))]"
              : "border-border/60 bg-[hsl(220,18%,10%)/0.9] text-muted-foreground hover:text-foreground"
          )}
        >
          <Grid3x3 className="h-4 w-4" />
          Dots
        </button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        connectionMode={ConnectionMode.Loose}
        connectionRadius={28}
        selectionOnDrag
        multiSelectionKeyCode="Shift"
        edgesFocusable
        elevateEdgesOnSelect
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        onNodeContextMenu={onNodeContextMenu}
        onPaneClick={onPaneClick}
        onNodeDragStop={onNodeDragStop}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.3}
        maxZoom={1.5}
        defaultEdgeOptions={{
          type: "smoothstep",
          animated: true,
          style: { stroke: "hsl(174 72% 46% / 0.55)", strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 18,
            height: 18,
            color: "hsl(174 72% 46% / 0.7)",
          },
        }}
        proOptions={{ hideAttribution: true }}
        className="bg-canvas"
      >
        {showCanvasDots && (
          <Background
            id="viz-canvas-dots"
            variant={BackgroundVariant.Dots}
            gap={20}
            size={2.5}
            color="hsl(var(--canvas-dots))"
          />
        )}
      </ReactFlow>

      <CanvasNodeContextMenu
        menu={contextMenu}
        node={contextNode}
        onClose={() => setContextMenu(null)}
      />
    </div>
  );
}

export function FlowCanvas() {
  return (
    <ReactFlowProvider>
      <div className="h-full w-full">
        <CanvasInner />
      </div>
    </ReactFlowProvider>
  );
}
