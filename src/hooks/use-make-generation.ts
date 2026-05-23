"use client";

import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useUIStore } from "@/store/ui-store";
import { useEditorStore } from "@/store/editor-store";
import { catalogService } from "@/services/catalog.service";
import {
  collectMakeInputImages,
  evaluateMakeReadiness,
} from "@/lib/make-validation";
import { effectiveMakePrompt } from "@/lib/effective-prompt";
import { getModelInputRules } from "@/lib/model-input-rules";
import { isRenderNodeType } from "@/lib/generation-nodes";
import {
  buildGenerationEdges,
  buildGenerationRenderNode,
  countCommittedChildrenFromRender,
  countCommittedGenerationsFromSource,
  findDraftRenderForSource,
  resolveMakeAction,
  sourceNodesFromIds,
} from "@/lib/generation-nodes";
import { getNodeMaskDataUrl } from "@/lib/node-draw-mask";
import { imageEditSettingsPayload } from "@/lib/image-edit-settings";
import { upscaleSettingsPayload } from "@/lib/upscale-settings";
import { videoCreatorSettingsPayload } from "@/lib/video-creator-settings";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/auth-store";
import { useEstimatedCredits } from "@/hooks/use-estimated-credits";
import type { CreditEstimateParams } from "@/services/catalog.service";

/** Vizmaker-style Make: spawn or rerun a render node, return its id. */
export function useMakeGeneration() {
  const { toast } = useToast();
  const user = useAuthStore((s) => s.user);
  const {
    bottomPrompt,
    bottomNegativePrompt,
    selectedModelSlug,
    selectedCategorySlug,
    imageEditPriority,
    imageEditResolution,
    imageEditAspectRatio,
    videoDuration,
    videoResolution,
    videoAspectRatio,
    videoGenerateAudio,
    upscaleScale,
    upscaleMaxOutput,
  } = useUIStore();
  const { data: categories = [] } = useQuery({
    queryKey: ["catalog"],
    queryFn: async () => {
      const { data } = await catalogService.list();
      return data;
    },
  });
  const selectedCategory = categories.find((c) => c.slug === selectedCategorySlug);
  const selectedModel = selectedCategory?.models.find(
    (m) => m.slug === selectedModelSlug
  );

  const creditEstimateParams: CreditEstimateParams | null =
    selectedCategorySlug && selectedModelSlug
      ? {
          category_slug: selectedCategorySlug,
          model_slug: selectedModelSlug,
          ...(selectedCategorySlug === "image-edit" ||
          selectedCategorySlug === "image-generate"
            ? { resolution: imageEditResolution }
            : {}),
          ...(selectedCategorySlug === "image-to-video"
            ? {
                video_duration: `${videoDuration}s`,
                resolution: videoResolution,
                generate_audio: videoGenerateAudio,
              }
            : {}),
          ...(selectedCategorySlug === "upscale"
            ? { upscale_scale: upscaleScale }
            : {}),
        }
      : null;

  const { data: creditEstimate } = useEstimatedCredits(creditEstimateParams);

  const creditCost =
    creditEstimate?.credits ?? selectedModel?.credit_cost ?? 0;
  const userCredits = user?.credits ?? 0;
  const canAfford = creditCost <= 0 || userCredits >= creditCost;

  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
  const updateNodeData = useEditorStore((s) => s.updateNodeData);
  const commitDraftPreview = useEditorStore((s) => s.commitDraftPreview);
  const spawnGeneration = useEditorStore((s) => s.spawnGeneration);
  const nodes = useEditorStore((s) => s.nodes);
  const edges = useEditorStore((s) => s.edges);

  const readiness = useMemo(
    () =>
      evaluateMakeReadiness({
        bottomPrompt,
        selectedModel,
        categorySlug: selectedCategorySlug,
        canAfford,
        creditCost,
        userCredits,
        nodes,
        edges,
        selectedNodeId,
      }),
    [
      bottomPrompt,
      selectedModel,
      selectedCategorySlug,
      canAfford,
      creditCost,
      userCredits,
      nodes,
      edges,
      selectedNodeId,
    ]
  );

  const runMake = useCallback((): string | null => {
    const state = useEditorStore.getState();
    const nodes = state.nodes;
    const edges = state.edges;
    const selectedNodeId = state.selectedNodeId;
    const prompt = effectiveMakePrompt(bottomPrompt, selectedModel);

    if (!readiness.canMake) {
      toast({
        title: readiness.title ?? "Cannot run Make",
        description: readiness.description,
        variant: "destructive",
      });
      return null;
    }

    const rules = getModelInputRules(selectedModel, selectedCategorySlug);
    const action = resolveMakeAction(nodes, edges, selectedNodeId, {
      allowNoSource: !rules.requiresImages,
      makeAnchorRenderId: state.makeAnchorRenderId,
    });
    if (action.mode === "invalid") {
      toast({
        title:
          action.reason === "no_source"
            ? "Add a source image"
            : "Select a source",
        description:
          action.reason === "no_source"
            ? "Upload a Source node on the canvas (left toolbar), then Make."
            : "Several sources on canvas — click the one you want to use.",
        variant: "destructive",
      });
      return null;
    }

    let inputImages = collectMakeInputImages(nodes, edges, action);
    if (
      !inputImages.length &&
      action.mode === "rerun" &&
      rules.requiresImages
    ) {
      const target = nodes.find((n) => n.id === action.renderNodeId);
      const stored = target?.data?.inputImages;
      if (Array.isArray(stored) && stored.length) {
        inputImages = stored as typeof inputImages;
      }
    }

    const categorySettings =
      selectedCategorySlug === "image-edit"
        ? imageEditSettingsPayload(
            imageEditPriority,
            imageEditResolution,
            imageEditAspectRatio
          )
        : selectedCategorySlug === "image-to-video"
          ? videoCreatorSettingsPayload(
              videoDuration,
              videoResolution,
              videoAspectRatio,
              videoGenerateAudio
            )
          : selectedCategorySlug === "upscale"
            ? upscaleSettingsPayload(upscaleScale, upscaleMaxOutput)
            : {};

    const payload = {
      positive: prompt,
      negative: bottomNegativePrompt,
      modelSlug: selectedModelSlug,
      categorySlug: selectedCategorySlug,
      modelName: selectedModel?.name,
      ...categorySettings,
    };

    if (action.mode === "rerun") {
      const renderNode = nodes.find((n) => n.id === action.renderNodeId);
      const renderMask = getNodeMaskDataUrl(renderNode);

      updateNodeData(action.renderNodeId, {
        ...payload,
        inputImages,
        ...(renderMask ? { maskUrl: renderMask } : {}),
        isDraft: false,
        status: "queued",
      });
      return action.renderNodeId;
    }

    // Chain from selected render — must run before draft commit (draft is tied to source).
    if (action.branchFromRenderId) {
      const parent = nodes.find((n) => n.id === action.branchFromRenderId);
      if (!parent) return null;

      const childIndex = countCommittedChildrenFromRender(
        parent.id,
        nodes,
        edges
      );
      const node = buildGenerationRenderNode({
        anchorNode: parent,
        generationIndex: childIndex,
        inputImages,
        isDraft: false,
        chainFromRender: true,
        sourceIdsForData: action.anchorSourceId
          ? [action.anchorSourceId]
          : [],
        ...payload,
      });
      const newEdges = buildGenerationEdges([parent], node.id, false);
      const id = spawnGeneration(node, newEdges);
      useEditorStore.getState().bumpDraftSync();
      return id;
    }

    const sourceNodes = sourceNodesFromIds(nodes, action.sourceIds);

    const draft =
      action.anchorSourceId
        ? findDraftRenderForSource(action.anchorSourceId, nodes, edges)
        : nodes.find(
            (n) => isRenderNodeType(n.type) && n.data.isDraft === true
          );

    if (draft) {
      const renderMask = getNodeMaskDataUrl(draft);
      return commitDraftPreview(draft.id, {
        ...payload,
        inputImages,
        label: selectedModel?.name ?? draft.data.label,
        ...(renderMask ? { maskUrl: renderMask } : {}),
        status: "queued",
      });
    }

    const anchor = sourceNodes[0];
    if (!anchor) {
      toast({
        title: "Add a source image",
        description: "Upload a Source node on the canvas, then Make.",
        variant: "destructive",
      });
      return null;
    }

    const genIndex = countCommittedGenerationsFromSource(
      action.anchorSourceId,
      nodes,
      edges
    );
    const node = buildGenerationRenderNode({
      anchorNode: anchor,
      generationIndex: genIndex,
      inputImages,
      isDraft: false,
      sourceIdsForData: sourceNodes.map((s) => s.id),
      ...payload,
    });
    const newEdges = buildGenerationEdges(sourceNodes, node.id, false);
    const id = spawnGeneration(node, newEdges);
    useEditorStore.getState().bumpDraftSync();
    return id;
  }, [
    readiness,
    bottomPrompt,
    bottomNegativePrompt,
    selectedModelSlug,
    selectedCategorySlug,
    selectedModel,
    imageEditPriority,
    imageEditResolution,
    imageEditAspectRatio,
    videoDuration,
    videoResolution,
    videoAspectRatio,
    videoGenerateAudio,
    upscaleScale,
    upscaleMaxOutput,
    selectedNodeId,
    nodes,
    edges,
    updateNodeData,
    commitDraftPreview,
    spawnGeneration,
    toast,
  ]);

  return {
    runMake,
    readiness,
    creditCost,
    userCredits,
    canAfford,
    selectedModel,
    selectedCategory,
  };
}
