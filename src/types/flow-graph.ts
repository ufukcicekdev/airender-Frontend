/**
 * Canonical DAG format synced with Django Workflow.graph / flow_data.
 * @see backend/apps/workflow/graph_engine.py
 */

export type FlowNodeType = "text_prompt" | "ai_model" | "image_output";

export interface FlowTextPromptData {
  text: string;
  label?: string;
}

export interface FlowAiModelData {
  model_name: string;
  aspect_ratio: string;
  steps: number;
  prompt?: string;
  last_output_url?: string | null;
}

export interface FlowImageOutputData {
  url: string | null;
  label?: string;
}

export type FlowNodeData =
  | FlowTextPromptData
  | FlowAiModelData
  | FlowImageOutputData
  | Record<string, unknown>;

/** Node payload sent to Django (position optional for editor restore). */
export interface FlowGraphNode {
  id: string;
  type: FlowNodeType | string;
  position?: { x: number; y: number };
  data: FlowNodeData;
}

/** Edge payload — handle ids must match custom node Handles. */
export interface FlowGraphEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle: string;
  targetHandle: string;
}

export interface FlowData {
  nodes: FlowGraphNode[];
  edges: FlowGraphEdge[];
}

/** Handle id constants (single source of truth with React Flow nodes). */
export const FLOW_HANDLES = {
  textPrompt: { output: "output" },
  aiModel: { promptInput: "prompt_input", imageOutput: "image_output" },
  imageOutput: { input: "input" },
} as const;
