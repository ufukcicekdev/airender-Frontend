import type { RenderTask } from "@/types";
import type { RenderUpdatePayload } from "@/services/websocket.service";

/** Map REST poll response to the same shape as WebSocket updates. */
export function taskToRenderPayload(task: RenderTask): RenderUpdatePayload {
  const gen = task.images?.[0];
  const meta = (gen?.metadata || {}) as Record<string, unknown>;
  const outputType =
    (meta.output_type as "image" | "video" | undefined) || "image";

  const flow = task.flow_data;

  return {
    task_id: task.id,
    status: task.status,
    progress: task.progress ?? 0,
    current_stage: task.current_stage ?? "",
    node_statuses: task.node_statuses ?? {},
    error_message: task.error_message || undefined,
    output_url: gen?.image_url || undefined,
    output_type: outputType,
    flow_data: flow?.nodes?.length
      ? (flow as RenderUpdatePayload["flow_data"])
      : undefined,
  };
}
