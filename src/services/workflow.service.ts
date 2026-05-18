import type { FlowData } from "@/types/flow-graph";
import type { Workflow, WorkflowGraph } from "@/types";
import { api } from "./api";

export const workflowService = {
  getByProject: (projectId: string) =>
    api.get<Workflow>(`/workflow/project/${projectId}`),

  get: (workflowId: string) => api.get<Workflow>(`/workflow/${workflowId}`),

  save: (
    workflowId: string,
    graph: WorkflowGraph | FlowData | Record<string, unknown>,
    name?: string
  ) => api.put<Workflow>(`/workflow/${workflowId}`, { graph, flow_data: graph, name }),

  duplicate: (workflowId: string) =>
    api.post<Workflow>(`/workflow/${workflowId}/duplicate`),

  export: (workflowId: string) =>
    api.get<{ graph: WorkflowGraph; version: number; name: string }>(
      `/workflow/${workflowId}/export`
    ),

  import: (workflowId: string, graph: WorkflowGraph) =>
    api.post<Workflow>(`/workflow/${workflowId}/import`, { graph }),
};
