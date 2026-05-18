"use client";

import { useEffect } from "react";
import { useEditorStore } from "@/store/editor-store";
import {
  parseUpscaleMaxOutput,
  parseUpscaleScale,
} from "@/lib/upscale-settings";
import { useUIStore } from "@/store/ui-store";

/**
 * When a canvas node is selected, mirror its model/prompt into the right panel
 * (VizMaker: click generation node → see that node's engine settings).
 */
export function useSyncPanelFromNode() {
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
  const nodes = useEditorStore((s) => s.nodes);

  const setSelectedCategory = useUIStore((s) => s.setSelectedCategory);
  const setSelectedModel = useUIStore((s) => s.setSelectedModel);
  const setBottomPrompt = useUIStore((s) => s.setBottomPrompt);
  const setBottomNegativePrompt = useUIStore((s) => s.setBottomNegativePrompt);
  const setUpscaleScale = useUIStore((s) => s.setUpscaleScale);
  const setUpscaleMaxOutput = useUIStore((s) => s.setUpscaleMaxOutput);

  useEffect(() => {
    if (!selectedNodeId) return;
    const node = nodes.find((n) => n.id === selectedNodeId);
    if (!node || (node.type !== "render" && node.type !== "detail")) return;

    const d = node.data;
    const ui = useUIStore.getState();

    if (d.categorySlug && ui.selectedCategorySlug !== String(d.categorySlug)) {
      setSelectedCategory(String(d.categorySlug));
    }
    if (d.modelSlug && ui.selectedModelSlug !== String(d.modelSlug)) {
      setSelectedModel(String(d.modelSlug));
    }
    if (typeof d.positive === "string" && d.positive && ui.bottomPrompt !== d.positive) {
      setBottomPrompt(d.positive);
    }
    if (typeof d.negative === "string" && ui.bottomNegativePrompt !== d.negative) {
      setBottomNegativePrompt(d.negative);
    }
    if (d.categorySlug === "upscale") {
      const scale = parseUpscaleScale(d.upscale_scale ?? d.upscale_factor);
      if (scale && ui.upscaleScale !== scale) setUpscaleScale(scale);
      const maxOut = parseUpscaleMaxOutput(d.max_output);
      if (maxOut && ui.upscaleMaxOutput !== maxOut) setUpscaleMaxOutput(maxOut);
    }
  }, [
    selectedNodeId,
    nodes,
    setSelectedCategory,
    setSelectedModel,
    setBottomPrompt,
    setBottomNegativePrompt,
    setUpscaleScale,
    setUpscaleMaxOutput,
  ]);
}
