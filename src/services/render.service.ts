import type { RenderTask } from "@/types";
import { api } from "./api";

export type StartRenderPayload = {
  workflow_id: string;
  node_id?: string;
  category_slug?: string;
  model_slug?: string;
};

export const renderService = {
  start: (
    workflowId: string,
    nodeId?: string,
    options?: { categorySlug?: string | null; modelSlug?: string | null }
  ) =>
    api.post<RenderTask>(
      "/render/start",
      {
        workflow_id: workflowId,
        node_id: nodeId,
        category_slug: options?.categorySlug || undefined,
        model_slug: options?.modelSlug || undefined,
      } satisfies StartRenderPayload,
      { timeout: 60_000 }
    ),

  status: (taskId: string) => api.get<RenderTask>(`/render/${taskId}`),

  cancel: (taskId: string) => api.post<RenderTask>(`/render/${taskId}/cancel`),

  history: () => api.get<RenderTask[]>("/render/history"),
};
