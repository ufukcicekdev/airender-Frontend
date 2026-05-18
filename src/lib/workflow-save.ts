import { useEditorStore } from "@/store/editor-store";
import { workflowService } from "@/services/workflow.service";

export type SaveWorkflowResult =
  | { ok: true }
  | { ok: false; error: string };

/** Persist current canvas graph to the API. */
export async function saveWorkflowNow(): Promise<SaveWorkflowResult> {
  const { workflowId, getCanvasGraph } = useEditorStore.getState();
  if (!workflowId) {
    return { ok: false, error: "No workflow loaded" };
  }

  try {
    const graph = getCanvasGraph();
    await workflowService.save(workflowId, graph);
    useEditorStore.getState().setDirty(false);
    useEditorStore.getState().setLastSavedAt(Date.now());
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not save workflow" };
  }
}
