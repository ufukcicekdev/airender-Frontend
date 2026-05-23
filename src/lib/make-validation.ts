import type { Edge } from "@xyflow/react";
import { useEditorStore, type EditorNode } from "@/store/editor-store";
import {
  collectImagesForRenderTarget,
  nodeToModelInputImage,
} from "@/lib/canvas-input-images";
import {
  isRenderNodeType,
  resolveMakeAction,
  sourceNodesFromIds,
  type MakeAction,
} from "@/lib/generation-nodes";
import { effectiveMakePrompt } from "@/lib/effective-prompt";
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

  if (action.branchFromRenderId) {
    const branch = nodes.find((n) => n.id === action.branchFromRenderId);
    if (branch && isRenderNodeType(branch.type)) {
      const fromOutput = nodeToModelInputImage(branch);
      if (fromOutput) return [fromOutput];
    }
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

  if (!effectiveMakePrompt(bottomPrompt, selectedModel)) {
    return {
      ...empty,
      canMake: false,
      reason: "no_prompt",
      title: "Enter a prompt",
      description:
        "Type a prompt in the bar below, or pick a model with a default prompt.",
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

  const rules = getModelInputRules(selectedModel, categorySlug);
  const action = resolveMakeAction(nodes, edges, selectedNodeId, {
    allowNoSource: !rules.requiresImages,
    makeAnchorRenderId: useEditorStore.getState().makeAnchorRenderId,
  });

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

  let inputImages = collectMakeInputImages(nodes, edges, action);
  if (
    !inputImages.length &&
    action.mode === "rerun" &&
    rules.requiresImages &&
    selectedNodeId
  ) {
    const target = nodes.find((n) => n.id === selectedNodeId);
    const stored = target?.data?.inputImages;
    if (Array.isArray(stored) && stored.length) {
      inputImages = stored as ModelInputImage[];
    }
  }
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
