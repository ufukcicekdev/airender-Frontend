const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";

import type { FlowData } from "@/types/flow-graph";

export type RenderUpdatePayload = {
  task_id: string;
  status: string;
  progress: number;
  current_stage: string;
  node_statuses: Record<string, string>;
  error_message?: string;
  flow_data?: FlowData;
  output_url?: string;
  output_type?: "image" | "video";
};

export function subscribeRender(
  taskId: string,
  onMessage: (payload: RenderUpdatePayload) => void,
  onError?: (error: Event) => void
): () => void {
  const ws = new WebSocket(`${WS_URL}/ws/render/${taskId}/`);

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.task_id) onMessage(data);
    } catch {
      // ignore parse errors
    }
  };

  ws.onerror = (e) => onError?.(e);

  return () => {
    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
      ws.close();
    }
  };
}
