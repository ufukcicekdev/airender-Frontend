"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useEditorStore } from "@/store/editor-store";
import { useUIStore } from "@/store/ui-store";
import { catalogService } from "@/services/catalog.service";
import { imageEditSettingsPayload } from "@/lib/image-edit-settings";
import { upscaleSettingsPayload } from "@/lib/upscale-settings";
import { model3dSettingsPayload } from "@/lib/model-3d-settings";
import { videoCreatorSettingsPayload } from "@/lib/video-creator-settings";
import { isPanelPersistSuppressed } from "@/lib/panel-sync-guard";

/**
 * Write right-panel prompt / model settings into the selected render node
 * so autosave persists them (not only UI store).
 */
export function usePersistPanelToNode() {
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
  const updateNodeData = useEditorStore((s) => s.updateNodeData);

  const {
    bottomPrompt,
    bottomNegativePrompt,
    selectedCategorySlug,
    selectedModelSlug,
    imageEditPriority,
    imageEditResolution,
    imageEditAspectRatio,
    videoDuration,
    videoResolution,
    videoAspectRatio,
    videoGenerateAudio,
    upscaleScale,
    upscaleMaxOutput,
    model3dTopology,
    model3dPolycount,
    model3dSymmetry,
    model3dShouldRemesh,
    model3dShouldTexture,
  } = useUIStore();

  const { data: categories = [] } = useQuery({
    queryKey: ["catalog"],
    queryFn: async () => {
      const { data } = await catalogService.list();
      return data;
    },
    staleTime: 60_000,
  });

  const lastKey = useRef<string | null>(null);
  const skipNextPersist = useRef(false);
  const prevNodeId = useRef<string | null>(null);

  useEffect(() => {
    if (selectedNodeId !== prevNodeId.current) {
      prevNodeId.current = selectedNodeId;
      lastKey.current = null;
      skipNextPersist.current = true;
    }
  }, [selectedNodeId]);

  useEffect(() => {
    if (!selectedNodeId) return;
    if (useUIStore.getState().isCanvasDragging) return;
    if (isPanelPersistSuppressed()) return;

    if (skipNextPersist.current) {
      skipNextPersist.current = false;
      return;
    }

    const nodes = useEditorStore.getState().nodes;
    const node = nodes.find((n) => n.id === selectedNodeId);
    if (!node || (node.type !== "render" && node.type !== "detail")) return;

    const category = categories.find((c) => c.slug === selectedCategorySlug);
    const model = category?.models.find((m) => m.slug === selectedModelSlug);

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
            : selectedCategorySlug === "3d-model"
              ? model3dSettingsPayload(
                  model3dTopology,
                  model3dPolycount,
                  model3dSymmetry,
                  model3dShouldRemesh,
                  model3dShouldTexture
                )
              : {};

    const key = JSON.stringify({
      id: selectedNodeId,
      bottomPrompt,
      bottomNegativePrompt,
      selectedCategorySlug,
      selectedModelSlug,
      categorySettings,
    });

    if (lastKey.current === key) return;

    const d = node.data;
    const nextModelSlug = model?.slug;
    const unchanged =
      (d.positive ?? "") === bottomPrompt &&
      (d.negative ?? "") === bottomNegativePrompt &&
      (!nextModelSlug || d.modelSlug === nextModelSlug) &&
      (!selectedCategorySlug || d.categorySlug === selectedCategorySlug) &&
      Object.entries(categorySettings).every(
        ([k, v]) => (d as Record<string, unknown>)[k] === v
      );

    lastKey.current = key;
    if (unchanged) return;

    updateNodeData(selectedNodeId, {
      positive: bottomPrompt,
      negative: bottomNegativePrompt,
      ...(model
        ? {
            label: model.name,
            model_name: model.name,
            modelSlug: model.slug,
            categorySlug: selectedCategorySlug ?? undefined,
          }
        : {}),
      ...categorySettings,
    });
  }, [
    selectedNodeId,
    categories,
    bottomPrompt,
    bottomNegativePrompt,
    selectedCategorySlug,
    selectedModelSlug,
    imageEditPriority,
    imageEditResolution,
    imageEditAspectRatio,
    videoDuration,
    videoResolution,
    videoAspectRatio,
    videoGenerateAudio,
    upscaleScale,
    upscaleMaxOutput,
    model3dTopology,
    model3dPolycount,
    model3dSymmetry,
    model3dShouldRemesh,
    model3dShouldTexture,
    updateNodeData,
  ]);
}
