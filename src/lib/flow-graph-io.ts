import type { Edge } from "@xyflow/react";
import type { EditorNode } from "@/store/editor-store";
import type {
  FlowAiModelData,
  FlowData,
  FlowGraphEdge,
  FlowGraphNode,
  FlowImageOutputData,
  FlowTextPromptData,
} from "@/types/flow-graph";
import { FLOW_HANDLES } from "@/types/flow-graph";

const FLOW_TYPES = new Set(["text_prompt", "ai_model", "image_output"]);

export function isFlowNodeType(type?: string): boolean {
  return Boolean(type && FLOW_TYPES.has(type));
}

/** React Flow state → Django flow_data JSON. */
export function toFlowData(nodes: EditorNode[], edges: Edge[]): FlowData {
  return {
    nodes: nodes.map((n) => toFlowNode(n)),
    edges: edges.map((e) => toFlowEdge(e)),
  };
}

export function toFlowNode(node: EditorNode): FlowGraphNode {
  const base: FlowGraphNode = {
    id: node.id,
    type: node.type ?? "text_prompt",
    position: { x: node.position.x, y: node.position.y },
    data: { ...node.data } as FlowGraphNode["data"],
  };

  if (node.type === "text_prompt") {
    const data = node.data as unknown as FlowTextPromptData & Record<string, unknown>;
    base.data = {
      text: String(data.text ?? data.label ?? ""),
      label: data.label ? String(data.label) : "Prompt",
    };
  } else if (node.type === "ai_model") {
    const data = node.data as unknown as FlowAiModelData & Record<string, unknown>;
    base.data = {
      model_name: String(data.model_name ?? "Flux v1.1"),
      aspect_ratio: String(data.aspect_ratio ?? "16:9"),
      steps: Number(data.steps ?? 30),
      last_output_url: data.last_output_url ?? null,
    };
  } else if (node.type === "image_output") {
    const data = node.data as unknown as FlowImageOutputData & Record<string, unknown>;
    base.data = {
      url: data.url ? String(data.url) : null,
      label: data.label ? String(data.label) : "Output",
    };
  }

  return base;
}

export function toFlowEdge(edge: Edge): FlowGraphEdge {
  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle ?? FLOW_HANDLES.textPrompt.output,
    targetHandle: edge.targetHandle ?? FLOW_HANDLES.imageOutput.input,
  };
}

/** Django flow_data → React Flow nodes/edges (adds positions if missing). */
export function fromFlowData(flow: FlowData): { nodes: EditorNode[]; edges: Edge[] } {
  const nodes: EditorNode[] = flow.nodes.map((n, index) => {
    const col = index % 3;
    const row = Math.floor(index / 3);
    const position = n.position ?? { x: 80 + col * 280, y: 80 + row * 180 };

    return {
      id: n.id,
      type: n.type,
      position,
      data: {
        label: defaultLabel(n),
        status: "idle",
        ...n.data,
      },
    } as EditorNode;
  });

  const edges: Edge[] = flow.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    sourceHandle: e.sourceHandle,
    targetHandle: e.targetHandle,
    type: "smoothstep",
    animated: true,
    style: { stroke: "hsl(174 72% 46% / 0.6)", strokeWidth: 2 },
  }));

  return { nodes, edges };
}

function defaultLabel(n: FlowGraphNode): string {
  if (n.type === "text_prompt") return "Text Prompt";
  if (n.type === "ai_model") return "AI Model";
  if (n.type === "image_output") return "Image Output";
  return String(n.type);
}

export function createExampleFlowGraph(): FlowData {
  return {
    nodes: [
      {
        id: "node_prompt_1",
        type: "text_prompt",
        position: { x: 40, y: 120 },
        data: {
          text: "Modern architectural villa, concrete and glass, sunset lighting",
          label: "Prompt",
        },
      },
      {
        id: "node_model_1",
        type: "ai_model",
        position: { x: 360, y: 100 },
        data: {
          model_name: "Flux v1.1",
          aspect_ratio: "16:9",
          steps: 30,
        },
      },
      {
        id: "node_output_1",
        type: "image_output",
        position: { x: 680, y: 120 },
        data: { url: null, label: "Output" },
      },
    ],
    edges: [
      {
        id: "edge_1",
        source: "node_prompt_1",
        sourceHandle: FLOW_HANDLES.textPrompt.output,
        target: "node_model_1",
        targetHandle: FLOW_HANDLES.aiModel.promptInput,
      },
      {
        id: "edge_2",
        source: "node_model_1",
        sourceHandle: FLOW_HANDLES.aiModel.imageOutput,
        target: "node_output_1",
        targetHandle: FLOW_HANDLES.imageOutput.input,
      },
    ],
  };
}
