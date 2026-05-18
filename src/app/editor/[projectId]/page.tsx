"use client";

import { useCallback, useEffect } from "react";
import { useParams } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { FlowCanvas } from "@/components/editor/flow-canvas";
import { MediaWorkspaceOverlay } from "@/components/editor/media-workspace-overlay";
import { PromptBar } from "@/components/editor/prompt-bar";
import { CommandPalette } from "@/components/editor/command-palette";
import { NodeToolbar } from "@/components/editor/node-toolbar";
import { EditorHeader } from "@/components/layout/editor-header";
import { LeftSidebar } from "@/components/layout/left-sidebar";
import { RightPanel } from "@/components/layout/right-panel";
import { AccountPanel } from "@/components/account/account-panel";
import { useEditorStore } from "@/store/editor-store";
import { useUIStore } from "@/store/ui-store";
import { workflowService } from "@/services/workflow.service";
import { projectService } from "@/services/project.service";
import { renderService } from "@/services/render.service";
import { useAutoSave } from "@/hooks/use-auto-save";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useMakeGeneration } from "@/hooks/use-make-generation";
import { usePersistPanelToNode } from "@/hooks/use-persist-panel-to-node";
import { useSyncDraftGenerationNode } from "@/hooks/use-sync-draft-generation";
import { useSyncPanelFromNode } from "@/hooks/use-sync-panel-from-node";
import { saveWorkflowNow } from "@/lib/workflow-save";
import { useRenderWebSocket } from "@/hooks/use-render-ws";
import { useToast } from "@/hooks/use-toast";
import { createStarterWorkflow } from "@/lib/default-workflow";
import type { WorkflowGraph } from "@/types";

export default function EditorPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const { toast } = useToast();
  const setRenderProgress = useUIStore((s) => s.setRenderProgress);
  const sidebarSection = useUIStore((s) => s.sidebarSection);
  const setSidebarSection = useUIStore((s) => s.setSidebarSection);

  const {
    setProject,
    loadWorkflow,
    workflowId,
    nodes,
    edges,
    setSaving,
    setDirty,
    setActiveRenderTask,
    activeRenderTaskId,
    updateNodeData,
  } = useEditorStore();

  const { runMake } = useMakeGeneration();
  useSyncDraftGenerationNode();
  useSyncPanelFromNode();
  usePersistPanelToNode();

  useAutoSave();
  useRenderWebSocket(activeRenderTaskId);

  useEffect(() => {
    async function load() {
      try {
        const [{ data: project }, { data: workflow }] = await Promise.all([
          projectService.get(projectId),
          workflowService.getByProject(projectId),
        ]);
        setProject(projectId, workflow.id, project.name);
        if (!workflow.graph?.nodes?.length) {
          const starter = createStarterWorkflow();
          loadWorkflow({ ...workflow, graph: starter as WorkflowGraph });
        } else {
          loadWorkflow(workflow);
        }
      } catch {
        toast({ title: "Failed to load project", variant: "destructive" });
      }
    }
    load();
  }, [projectId, setProject, loadWorkflow, toast]);

  const handleSave = useCallback(async () => {
    if (!workflowId) return;
    setSaving(true);
    const result = await saveWorkflowNow();
    setSaving(false);
    if (!result.ok) {
      toast({ title: "Save failed", description: result.error, variant: "destructive" });
    }
  }, [workflowId, setSaving, toast]);

  const handleRender = useCallback(
    async (renderNodeId: string) => {
      if (!workflowId || !renderNodeId) return;
      updateNodeData(renderNodeId, { status: "processing" });
      setRenderProgress(12);
      try {
        const saved = await saveWorkflowNow();
        if (!saved.ok) {
          toast({ title: "Save failed", description: saved.error, variant: "destructive" });
          updateNodeData(renderNodeId, { status: "idle" });
          return;
        }
        const { data } = await renderService.start(workflowId, renderNodeId);
        setActiveRenderTask(data.id);
        setRenderProgress(data.progress || 12);
      } catch {
        toast({ title: "Render failed", variant: "destructive" });
        updateNodeData(renderNodeId, { status: "idle" });
      }
    },
    [workflowId, setActiveRenderTask, setRenderProgress, updateNodeData, toast]
  );

  useKeyboardShortcuts(handleSave, () => {
    const id = runMake();
    if (id) handleRender(id);
  });

  return (
    <ProtectedRoute>
      <div className="flex h-screen flex-col overflow-hidden bg-[hsl(220,20%,6%)]">
        <EditorHeader />
        <div className="flex min-h-0 flex-1">
          <LeftSidebar />
          {sidebarSection === "account" ? (
            <AccountPanel
              className="min-w-0 flex-1"
              onClose={() => setSidebarSection("editor")}
            />
          ) : (
            <>
              <NodeToolbar />
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="relative min-h-0 flex-1">
                  <FlowCanvas />
                  <MediaWorkspaceOverlay />
                </div>
                <PromptBar onMake={handleRender} />
              </div>
              <RightPanel />
            </>
          )}
        </div>
        <CommandPalette />
      </div>
    </ProtectedRoute>
  );
}
