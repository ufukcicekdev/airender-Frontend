const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";
const WS_TOKEN_KEY = "vizmake_ws_access";

import type { FlowData } from "@/types/flow-graph";

/** Short-lived access token for WebSocket (HttpOnly cookie is not sent to :8000 from :3000). */
export function setWsAccessToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) sessionStorage.setItem(WS_TOKEN_KEY, token);
  else sessionStorage.removeItem(WS_TOKEN_KEY);
}

function wsRenderUrl(taskId: string): string {
  const base = `${WS_URL}/ws/render/${taskId}/`;
  if (typeof window === "undefined") return base;
  const token = sessionStorage.getItem(WS_TOKEN_KEY);
  if (!token) return base;
  return `${base}?token=${encodeURIComponent(token)}`;
}

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

export type RenderWsCallbacks = {
  onOpen?: () => void;
  onError?: (error: Event) => void;
};

export function subscribeRender(
  taskId: string,
  onMessage: (payload: RenderUpdatePayload) => void,
  callbacks?: RenderWsCallbacks
): () => void {
  const ws = new WebSocket(wsRenderUrl(taskId));

  ws.onopen = () => callbacks?.onOpen?.();

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.task_id) onMessage(data);
    } catch {
      // ignore parse errors
    }
  };

  ws.onerror = (e) => callbacks?.onError?.(e);

  return () => {
    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
      ws.close();
    }
  };
}
