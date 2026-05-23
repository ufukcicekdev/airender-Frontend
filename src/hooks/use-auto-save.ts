"use client";

import { useCallback, useEffect, useRef } from "react";
import { useEditorStore } from "@/store/editor-store";
import { saveWorkflowNow } from "@/lib/workflow-save";
import { useToast } from "@/hooks/use-toast";

const DEBOUNCE_MS = 900;

export function useAutoSave() {
  const { toast } = useToast();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savingRef = useRef(false);
  const workflowId = useEditorStore((s) => s.workflowId);
  const nodes = useEditorStore((s) => s.nodes);
  const edges = useEditorStore((s) => s.edges);
  const isDirty = useEditorStore((s) => s.isDirty);
  const setSaving = useEditorStore((s) => s.setSaving);

  const flushSave = useCallback(async () => {
    const state = useEditorStore.getState();
    if (!workflowId || !state.isDirty) return;
    if (state.activeRenderTaskId) return;
    if (savingRef.current) return;

    savingRef.current = true;
    setSaving(true);
    try {
      const result = await saveWorkflowNow();
      if (!result.ok) {
        toast({
          title: "Auto-save failed",
          description: result.error,
          variant: "destructive",
        });
      }
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }, [workflowId, setSaving, toast]);

  useEffect(() => {
    if (!workflowId || !isDirty) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      void flushSave();
    }, DEBOUNCE_MS);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [workflowId, nodes, edges, isDirty, flushSave]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        void flushSave();
      }
    };

    const onPageHide = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      void flushSave();
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [flushSave]);

  return { flushSave };
}
