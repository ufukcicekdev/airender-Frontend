"use client";

import { useCallback, useEffect } from "react";
import { useEditorStore } from "@/store/editor-store";
import { useAuthStore } from "@/store/auth-store";
import { loadEditorProject } from "@/lib/load-editor-project";
import { useToast } from "@/hooks/use-toast";

/** Load workflow for the current project once auth is ready. */
export function useEditorProjectLoad(projectId: string) {
  const { toast } = useToast();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authLoading = useAuthStore((s) => s.isLoading);
  const resetForProject = useEditorStore((s) => s.resetForProject);
  const workflowLoadState = useEditorStore((s) => s.workflowLoadState);

  const reload = useCallback(async () => {
    const result = await loadEditorProject(projectId);
    if (!result.ok) {
      toast({
        title: "Could not load project",
        description: result.error,
        variant: "destructive",
      });
    }
    return result;
  }, [projectId, toast]);

  useEffect(() => {
    if (!projectId || authLoading || !isAuthenticated) return;
    resetForProject(projectId);
    void reload();
  }, [projectId, authLoading, isAuthenticated, resetForProject, reload]);

  return { workflowLoadState, reload };
}
