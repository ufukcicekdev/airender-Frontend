import type { EditorNode } from "@/store/editor-store";
import type { FlowNodeType } from "@/types/flow-graph";

export function createPaletteNode(
  type: string,
  label: string,
  index: number
): EditorNode {
  const col = index % 4;
  const row = Math.floor(index / 4);
  const id = `${type}-${Date.now()}`;
  const position = { x: 80 + col * 260, y: 80 + row * 200 };

  const base = { id, type, position, data: { label, status: "idle" as const } };

  if (type === "text_prompt") {
    return {
      ...base,
      data: {
        label: "Text Prompt",
        status: "idle",
        text: "Modern architectural villa, concrete and glass, sunset lighting",
      },
    };
  }
  if (type === "ai_model") {
    return {
      ...base,
      data: {
        label: "AI Model",
        status: "idle",
        model_name: "Flux v1.1",
        aspect_ratio: "16:9",
        steps: 30,
      },
    };
  }
  if (type === "image_output") {
    return {
      ...base,
      data: { label: "Image Output", status: "idle", url: null },
    };
  }

  return base as EditorNode;
}

export function isFlowPaletteType(type: string): type is FlowNodeType {
  return type === "text_prompt" || type === "ai_model" || type === "image_output";
}
