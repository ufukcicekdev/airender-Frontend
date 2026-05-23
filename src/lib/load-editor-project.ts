import { useEditorStore } from "@/store/editor-store";
import { projectService } from "@/services/project.service";
import { workflowService } from "@/services/workflow.service";
import { createStarterWorkflow } from "@/lib/default-workflow";
import { getApiErrorMessage } from "@/lib/api-errors";
import type { Workflow, WorkflowGraph } from "@/types";

export type LoadEditorProjectResult =
  | { ok: true; workflowId: string }
  | { ok: false; error: string };

/** Fetch project + workflow and hydrate the editor store. */
export async function loadEditorProject(
  projectId: string
): Promise<LoadEditorProjectResult> {
  const store = useEditorStore.getState();
  store.setWorkflowLoadState("loading");

  try {
    const { data: workflow } = await workflowService.getByProject(projectId);
    const workflowId = workflow?.id ?? null;
    if (!workflowId) {
      store.setWorkflowLoadState("error");
      return { ok: false, error: "No workflow found for this project." };
    }

    let projectName = "Untitled";
    try {
      const { data: project } = await projectService.get(projectId);
      projectName = project.name;
    } catch {
      /* workflow response is enough to open editor */
    }

    store.setProject(projectId, workflowId, projectName);

    if (!workflow.graph?.nodes?.length) {
      const starter = createStarterWorkflow();
      store.loadWorkflow({
        ...workflow,
        id: workflowId,
        graph: starter as WorkflowGraph,
      });
    } else {
      store.loadWorkflow({ ...workflow, id: workflowId });
    }

    store.setWorkflowLoadState("ready");
    return { ok: true, workflowId };
  } catch (err) {
    store.setWorkflowLoadState("error");
    return {
      ok: false,
      error: getApiErrorMessage(err, "Could not load project. Try signing in again."),
    };
  }
}
