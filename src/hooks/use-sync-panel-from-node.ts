"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useEditorStore } from "@/store/editor-store";
import {
  parseUpscaleMaxOutput,
  parseUpscaleScale,
} from "@/lib/upscale-settings";
import { useUIStore } from "@/store/ui-store";
import { catalogService } from "@/services/catalog.service";
import { runWithPanelPersistSuppressed } from "@/lib/panel-sync-guard";

/** Stable key from selected render node data (excludes position — avoids loops while dragging). */
function useSelectedRenderPanelKey(): string {
  return useEditorStore((s) => {
    if (!s.selectedNodeId) return "";
    const node = s.nodes.find((n) => n.id === s.selectedNodeId);
    if (!node || (node.type !== "render" && node.type !== "detail")) return "";
    const d = node.data;
    return JSON.stringify({
      id: node.id,
      categorySlug: d.categorySlug,
      modelSlug: d.modelSlug,
      positive: d.positive,
      negative: d.negative,
      upscale_scale: d.upscale_scale ?? d.upscale_factor,
      max_output: d.max_output,
      status: d.status,
      imageUrl: d.imageUrl,
    });
  });
}

function resolveCatalogModelSlug(
  categories: { slug: string; models: { slug: string }[] }[],
  categorySlug: string,
  rawModelSlug: string
): string | null {
  const cat = categories.find((c) => c.slug === categorySlug);
  if (!cat?.models.length) return null;
  if (rawModelSlug && cat.models.some((m) => m.slug === rawModelSlug)) {
    return rawModelSlug;
  }
  return cat.models[0]?.slug ?? null;
}

/**
 * When a canvas node is selected, mirror its model/prompt into the right panel
 * (VizMaker: click generation node → see that node's engine settings).
 */
export function useSyncPanelFromNode() {
  const panelSyncKey = useSelectedRenderPanelKey();

  const { data: categories = [] } = useQuery({
    queryKey: ["catalog"],
    queryFn: async () => {
      const { data } = await catalogService.list();
      return data;
    },
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!panelSyncKey) return;
    if (useUIStore.getState().isCanvasDragging) return;

    const selectedNodeId = useEditorStore.getState().selectedNodeId;
    if (!selectedNodeId) return;
    const node = useEditorStore
      .getState()
      .nodes.find((n) => n.id === selectedNodeId);
    if (!node || (node.type !== "render" && node.type !== "detail")) return;

    const d = node.data;
    const ui = useUIStore.getState();

    const catSlug = d.categorySlug ? String(d.categorySlug) : "";
    const rawModel = d.modelSlug ? String(d.modelSlug) : "";
    const validModel =
      catSlug && categories.length
        ? resolveCatalogModelSlug(categories, catSlug, rawModel)
        : rawModel || null;

    const patch: Record<string, unknown> = {};

    if (catSlug && ui.selectedCategorySlug !== catSlug) {
      patch.selectedCategorySlug = catSlug;
      patch.selectedModelSlug = validModel;
    } else if (validModel && ui.selectedModelSlug !== validModel) {
      patch.selectedModelSlug = validModel;
    }

    if (typeof d.positive === "string" && d.positive && ui.bottomPrompt !== d.positive) {
      patch.bottomPrompt = d.positive;
    }
    if (typeof d.negative === "string" && ui.bottomNegativePrompt !== d.negative) {
      patch.bottomNegativePrompt = d.negative;
    }
    if (d.categorySlug === "upscale") {
      const scale = parseUpscaleScale(d.upscale_scale ?? d.upscale_factor);
      if (scale && ui.upscaleScale !== scale) patch.upscaleScale = scale;
      const maxOut = parseUpscaleMaxOutput(d.max_output);
      if (maxOut && ui.upscaleMaxOutput !== maxOut) patch.upscaleMaxOutput = maxOut;
    }

    if (Object.keys(patch).length > 0) {
      runWithPanelPersistSuppressed(() => {
        useUIStore.setState(patch);
      });
    }
  }, [panelSyncKey, categories]);
}
