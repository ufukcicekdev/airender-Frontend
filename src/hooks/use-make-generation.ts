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
import {
  buildGenerationEdges,
  buildGenerationRenderNode,
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

  const creditCost = selectedModel?.credit_cost ?? 0;
  const userCredits = user?.credits ?? 0;
  const canAfford = creditCost > 0 && userCredits >= creditCost;

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
    if (!readiness.canMake) {
      toast({
        title: readiness.title ?? "Cannot run Make",
        description: readiness.description,
        variant: "destructive",
      });
      return null;
    }

    const action = resolveMakeAction(nodes, edges, selectedNodeId);
    if (action.mode === "invalid") return null;

    const inputImages = collectMakeInputImages(nodes, edges, action);

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
      positive: bottomPrompt,
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

    const sourceNodes = sourceNodesFromIds(nodes, action.sourceIds);

    const draft = findDraftRenderForSource(
      action.anchorSourceId,
      nodes,
      edges
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

    const genIndex = countCommittedGenerationsFromSource(
      action.anchorSourceId,
      nodes,
      edges
    );
    const node = buildGenerationRenderNode({
      sourceNodes,
      generationIndex: genIndex,
      inputImages,
      isDraft: false,
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
