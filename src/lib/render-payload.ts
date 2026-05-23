import type { RenderTask } from "@/types";
import type { RenderUpdatePayload } from "@/services/websocket.service";

/** Map REST poll response to the same shape as WebSocket updates. */
export function taskToRenderPayload(task: RenderTask): RenderUpdatePayload {
  const gen = task.images?.[0];
  const meta = (gen?.metadata || {}) as Record<string, unknown>;
  const imageUrl = gen?.image_url || undefined;
  let outputType =
    (meta.output_type as "image" | "video" | undefined) || "image";

  const rid = (task.node_statuses || {})._target_render_id as string | undefined;
  const flow = task.flow_data;
  const renderNode = rid
    ? flow?.nodes?.find((n) => n.id === rid)
    : flow?.nodes?.find((n) => n.type === "render" || n.type === "detail");
  const nodeData = renderNode?.data as Record<string, unknown> | undefined;

  if (nodeData?.categorySlug === "image-to-video") {
    outputType = "video";
  } else if (String(nodeData?.outputType || "").toLowerCase() === "video") {
    outputType = "video";
  } else if (imageUrl && /\.(mp4|webm|mov)(\?|$)/i.test(imageUrl)) {
    outputType = "video";
  }

  return {
    task_id: task.id,
    status: task.status,
    progress: task.progress ?? 0,
    current_stage: task.current_stage ?? "",
    node_statuses: task.node_statuses ?? {},
    error_message: task.error_message || undefined,
    output_url: imageUrl,
    output_type: outputType,
    flow_data: flow?.nodes?.length
      ? (flow as RenderUpdatePayload["flow_data"])
      : undefined,
  };
}
