"use client";

import { useCallback } from "react";
import { useEditorStore } from "@/store/editor-store";
import { useUIStore } from "@/store/ui-store";
import { effectiveMakePrompt } from "@/lib/effective-prompt";
import { saveWorkflowNow } from "@/lib/workflow-save";
import { getApiErrorMessage } from "@/lib/api-errors";
import { renderService } from "@/services/render.service";
import { useToast } from "@/hooks/use-toast";
import { useMakeGeneration } from "@/hooks/use-make-generation";
import { loadEditorProject } from "@/lib/load-editor-project";

/**
 * Single Make pipeline: canvas node → save workflow → POST /api/render/start.
 * Surfaces a toast on every failure (no silent return).
 */
export function useExecuteMake() {
  const { toast } = useToast();
  const make = useMakeGeneration();
  const { runMake, readiness, selectedModel } = make;

  const executeMake = useCallback(async () => {
    let workflowId = useEditorStore.getState().workflowId;
    if (!workflowId) {
      const projectId = useEditorStore.getState().projectId;
      if (projectId) {
        const loaded = await loadEditorProject(projectId);
        if (loaded.ok) workflowId = loaded.workflowId;
      }
    }
    if (!workflowId) {
      const loadState = useEditorStore.getState().workflowLoadState;
      toast({
        title: "Project not ready",
        description:
          loadState === "loading"
            ? "Still loading the project from the server — wait a moment."
            : loadState === "error"
              ? "Project failed to load. Refresh the page or sign in again."
              : "Could not find a workflow for this project.",
        variant: "destructive",
      });
      return;
    }

    if (!readiness.canMake) {
      toast({
        title: readiness.title ?? "Cannot run Make",
        description: readiness.description,
        variant: "destructive",
      });
      return;
    }

    const ui = useUIStore.getState();
    const prompt = effectiveMakePrompt(ui.bottomPrompt, selectedModel);
    if (!ui.bottomPrompt.trim() && prompt) {
      ui.setBottomPrompt(prompt);
    }

    const renderNodeId = runMake();

    if (!renderNodeId) {
      toast({
        title: "Could not start generation",
        description:
          "No generation node was created. Add a Source image (Image Edit) or try again.",
        variant: "destructive",
      });
      return;
    }

    const categorySlug = ui.selectedCategorySlug;
    const modelSlug = ui.selectedModelSlug;

    useEditorStore.getState().updateNodeData(renderNodeId, {
      status: "processing",
      positive: prompt,
      negative: ui.bottomNegativePrompt,
      categorySlug: categorySlug ?? undefined,
      modelSlug: modelSlug ?? undefined,
    });
    ui.setRenderProgress(12);

    const saved = await saveWorkflowNow();
    if (!saved.ok) {
      toast({
        title: "Save failed",
        description: saved.error,
        variant: "destructive",
      });
      useEditorStore.getState().updateNodeData(renderNodeId, { status: "idle" });
      return;
    }

    try {
      const { data } = await renderService.start(workflowId, renderNodeId, {
        categorySlug,
        modelSlug,
      });
      useEditorStore.getState().setActiveRenderTask(data.id);
      ui.setRenderProgress(data.progress || 12);
    } catch (err) {
      toast({
        title: "Render failed",
        description: getApiErrorMessage(err, "Could not start render."),
        variant: "destructive",
      });
      useEditorStore.getState().updateNodeData(renderNodeId, { status: "idle" });
    }
  }, [runMake, readiness, selectedModel, toast]);

  return { executeMake, ...make };
}
