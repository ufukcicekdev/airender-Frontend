"use client";

import { useCallback } from "react";
import { useParams } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { FlowCanvas } from "@/components/editor/flow-canvas";
import { MediaWorkspaceOverlay } from "@/components/editor/media-workspace-overlay";
import { PromptBar } from "@/components/editor/prompt-bar";
import { CommandPalette } from "@/components/editor/command-palette";
import { NodeToolbar } from "@/components/editor/node-toolbar";
import { EditorHeader } from "@/components/layout/editor-header";
import { EditorMobileNav } from "@/components/layout/editor-mobile-nav";
import { EditorMobilePanel } from "@/components/layout/editor-mobile-panel";
import { LeftSidebar } from "@/components/layout/left-sidebar";
import { RightPanel } from "@/components/layout/right-panel";
import { EditorSidebarPanel } from "@/components/sidebar/editor-sidebar-panel";
import { useEditorStore } from "@/store/editor-store";
import { useUIStore } from "@/store/ui-store";
import { useAutoSave } from "@/hooks/use-auto-save";
import { useEditorProjectLoad } from "@/hooks/use-editor-project-load";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useExecuteMake } from "@/hooks/use-execute-make";
import { usePersistPanelToNode } from "@/hooks/use-persist-panel-to-node";
import { useSyncDraftGenerationNode } from "@/hooks/use-sync-draft-generation";
import { useSyncPanelFromNode } from "@/hooks/use-sync-panel-from-node";
import { saveWorkflowNow } from "@/lib/workflow-save";
import { useRenderWebSocket } from "@/hooks/use-render-ws";
import { useToast } from "@/hooks/use-toast";

export default function EditorPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const { toast } = useToast();
  const sidebarSection = useUIStore((s) => s.sidebarSection);
  const setSidebarSection = useUIStore((s) => s.setSidebarSection);
  const showSidebarPanel = sidebarSection !== "editor";

  const { workflowId, setSaving, activeRenderTaskId } = useEditorStore();

  const { workflowLoadState } = useEditorProjectLoad(projectId);
  const { executeMake } = useExecuteMake();
  useSyncDraftGenerationNode();
  useSyncPanelFromNode();
  usePersistPanelToNode();

  useAutoSave();
  useRenderWebSocket(activeRenderTaskId);

  const handleSave = useCallback(async () => {
    if (!workflowId) return;
    setSaving(true);
    const result = await saveWorkflowNow();
    setSaving(false);
    if (!result.ok) {
      toast({ title: "Save failed", description: result.error, variant: "destructive" });
    }
  }, [workflowId, setSaving, toast]);

  useKeyboardShortcuts(handleSave, () => {
    void executeMake();
  });

  return (
    <ProtectedRoute>
      <div className="flex h-[100dvh] flex-col overflow-hidden bg-[hsl(220,20%,6%)]">
        <EditorHeader />
        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <LeftSidebar />
          {showSidebarPanel ? (
            <EditorSidebarPanel
              section={sidebarSection}
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
                <PromptBar workflowLoadState={workflowLoadState} />
              </div>
              <div className="hidden lg:flex">
                <RightPanel />
              </div>
            </>
          )}
        </div>
        <EditorMobileNav />
        <EditorMobilePanel />
        <CommandPalette />
      </div>
    </ProtectedRoute>
  );
}
