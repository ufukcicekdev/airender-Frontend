import type { Edge } from "@xyflow/react";
import type { EditorNode } from "@/store/editor-store";
import {
  collectImagesForRenderTarget,
  nodeToModelInputImage,
} from "@/lib/canvas-input-images";
import {
  resolveMakeAction,
  sourceNodesFromIds,
  type MakeAction,
} from "@/lib/generation-nodes";
import { getModelInputRules } from "@/lib/model-input-rules";
import type { CatalogModel, ModelInputImage } from "@/types";

export type MakeBlockReason =
  | "no_prompt"
  | "no_model"
  | "no_credits"
  | "no_source"
  | "select_source"
  | "missing_inputs";

export interface MakeReadiness {
  canMake: boolean;
  reason?: MakeBlockReason;
  title?: string;
  description?: string;
  inputCount: number;
  requiredMin: number;
}

/** Input images for the upcoming Make (mirrors runMake collection). */
export function collectMakeInputImages(
  nodes: EditorNode[],
  edges: Edge[],
  action: MakeAction
): ModelInputImage[] {
  if (action.mode === "invalid") return [];

  if (action.mode === "rerun") {
    let inputImages = collectImagesForRenderTarget(
      action.renderNodeId,
      nodes,
      edges
    );
    if (!inputImages.length) {
      inputImages = sourceNodesFromIds(nodes, action.sourceIds)
        .map((s) => nodeToModelInputImage(s))
        .filter((img): img is ModelInputImage => img !== null);
    }
    return inputImages;
  }

  return sourceNodesFromIds(nodes, action.sourceIds)
    .map((s) => nodeToModelInputImage(s))
    .filter((img): img is ModelInputImage => img !== null);
}

export function evaluateMakeReadiness(options: {
  bottomPrompt: string;
  selectedModel?: CatalogModel | null;
  categorySlug?: string | null;
  canAfford: boolean;
  creditCost: number;
  userCredits: number;
  nodes: EditorNode[];
  edges: Edge[];
  selectedNodeId: string | null;
}): MakeReadiness {
  const {
    bottomPrompt,
    selectedModel,
    categorySlug,
    canAfford,
    creditCost,
    userCredits,
    nodes,
    edges,
    selectedNodeId,
  } = options;

  const empty = { inputCount: 0, requiredMin: 0 };

  if (!bottomPrompt.trim()) {
    return {
      ...empty,
      canMake: false,
      reason: "no_prompt",
      title: "Enter a prompt",
      description: "Write a prompt before running Make.",
    };
  }

  if (!selectedModel) {
    return {
      ...empty,
      canMake: false,
      reason: "no_model",
      title: "Select a model",
      description: "Choose a capability and model in the right panel.",
    };
  }

  if (!canAfford) {
    return {
      ...empty,
      canMake: false,
      reason: "no_credits",
      title: "Insufficient credits",
      description:
        userCredits === 0
          ? `This run requires ${creditCost} credits. Your balance is empty.`
          : `This run requires ${creditCost} credits. Your balance: ${userCredits}.`,
    };
  }

  const action = resolveMakeAction(nodes, edges, selectedNodeId);

  if (action.mode === "invalid") {
    return {
      ...empty,
      canMake: false,
      reason: action.reason === "no_source" ? "no_source" : "select_source",
      title:
        action.reason === "no_source"
          ? "Add a source image"
          : "Select a source",
      description:
        action.reason === "no_source"
          ? "Upload a Source image on the canvas (left toolbar), then press Make."
          : "Multiple sources on canvas — click the source you want to use.",
    };
  }

  const inputImages = collectMakeInputImages(nodes, edges, action);
  const rules = getModelInputRules(selectedModel, categorySlug);
  const requiredMin = rules.requiresImages
    ? Math.max(rules.min, 1)
    : rules.min;

  if (!rules.isValid(inputImages.length)) {
    return {
      canMake: false,
      reason: "missing_inputs",
      title: "Source image required",
      description:
        rules.help ||
        (requiredMin === 1
          ? "This model needs at least one Source image on the canvas."
          : `This model needs at least ${requiredMin} images.`),
      inputCount: inputImages.length,
      requiredMin,
    };
  }

  return {
    canMake: true,
    inputCount: inputImages.length,
    requiredMin,
  };
}
