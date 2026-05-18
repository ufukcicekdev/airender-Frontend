"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useEditorStore } from "@/store/editor-store";
import { useUIStore } from "@/store/ui-store";
import { catalogService } from "@/services/catalog.service";
import { imageEditSettingsPayload } from "@/lib/image-edit-settings";
import { upscaleSettingsPayload } from "@/lib/upscale-settings";
import { videoCreatorSettingsPayload } from "@/lib/video-creator-settings";

/**
 * Write right-panel prompt / model settings into the selected render node
 * so autosave persists them (not only UI store).
 */
export function usePersistPanelToNode() {
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
  const nodes = useEditorStore((s) => s.nodes);
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
  } = useUIStore();

  const { data: categories = [] } = useQuery({
    queryKey: ["catalog"],
    queryFn: async () => {
      const { data } = await catalogService.list();
      return data;
    },
  });

  const lastKey = useRef<string | null>(null);

  useEffect(() => {
    if (!selectedNodeId) return;
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
    lastKey.current = key;

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
    nodes,
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
    updateNodeData,
  ]);
}
