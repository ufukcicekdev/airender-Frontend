import type { NodeTypes } from "@xyflow/react";
import { SourceNode } from "./source-node";
import { PromptNode } from "./prompt-node";
import { RenderNode } from "./render-node";
import { DetailNode } from "./detail-node";
import { LightingNode } from "./lighting-node";
import { UpscaleNode } from "./upscale-node";
import { OutputNode } from "./output-node";
import { TextPromptNode } from "./flow/text-prompt-node";
import { AiModelNode } from "./flow/ai-model-node";
import { ImageOutputNode } from "./flow/image-output-node";
import { GroupNode } from "./group-node";

export const nodeTypes: NodeTypes = {
  group: GroupNode,
  source: SourceNode,
  prompt: PromptNode,
  render: RenderNode,
  detail: DetailNode,
  lighting: LightingNode,
  upscale: UpscaleNode,
  output: OutputNode,
  // Internal DAG types (not in toolbar — built server-side on Make)
  text_prompt: TextPromptNode,
  ai_model: AiModelNode,
  image_output: ImageOutputNode,
};

/** What users add from the toolbar (Vizmaker). */
export const CANVAS_NODE_PALETTE = [{ type: "source", label: "Source Image" }] as const;

/** @deprecated Use CANVAS_NODE_PALETTE — flow nodes are automatic. */
export const FLOW_NODE_PALETTE = [] as const;

export const NODE_PALETTE = [...CANVAS_NODE_PALETTE] as const;
