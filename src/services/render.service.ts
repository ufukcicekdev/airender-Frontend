import type { RenderTask } from "@/types";
import { api } from "./api";

export const renderService = {
  start: (workflowId: string, nodeId?: string) =>
    api.post<RenderTask>("/render/start", { workflow_id: workflowId, node_id: nodeId }),

  status: (taskId: string) => api.get<RenderTask>(`/render/${taskId}`),

  cancel: (taskId: string) => api.post<RenderTask>(`/render/${taskId}/cancel`),

  history: () => api.get<RenderTask[]>("/render/history"),
};
