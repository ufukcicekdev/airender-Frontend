"use client";

import { useEffect, useRef } from "react";
import { subscribeRender } from "@/services/websocket.service";
import { renderService } from "@/services/render.service";
import { taskToRenderPayload } from "@/lib/render-payload";
import { useEditorStore } from "@/store/editor-store";
import { useUIStore } from "@/store/ui-store";
import { useAuthStore } from "@/store/auth-store";
import {
  isCanvasGraph,
  mergeCanvasGraphFromServer,
} from "@/lib/canvas-graph-io";
import type { RenderUpdatePayload } from "@/services/websocket.service";
import type { WorkflowGraph } from "@/types";
import { useToast } from "@/hooks/use-toast";

const TERMINAL = new Set(["completed", "failed", "cancelled"]);
const POLL_MS_ACTIVE = 2000;
const POLL_MS_QUEUED = 1500;

function applyRenderPayload(
  taskId: string,
  payload: RenderUpdatePayload,
  options: { mergeGraph: boolean }
) {
  const setRenderProgress = useUIStore.getState().setRenderProgress;
  const {
    updateNodeData,
    mergeCanvasGraph,
    applyFlowData,
    setPreviewUrl,
  } = useEditorStore.getState();

  setRenderProgress(payload.progress ?? 0);

  const targetRenderId =
    (payload.node_statuses?._target_render_id as string | undefined) || undefined;

  const resolveTargetRenderId = () => {
    if (targetRenderId) return targetRenderId;
    const { nodes } = useEditorStore.getState();
    const processing = nodes.find(
      (n) =>
        (n.type === "render" || n.type === "detail") &&
        (n.data.status === "processing" || n.data.status === "queued")
    );
    return processing?.id;
  };

  if (options.mergeGraph && payload.flow_data?.nodes) {
    if (isCanvasGraph(payload.flow_data)) {
      mergeCanvasGraph(payload.flow_data as WorkflowGraph);
    } else {
      applyFlowData(payload.flow_data);
    }
  }

  Object.entries(payload.node_statuses || {}).forEach(([nodeId, st]) => {
    if (nodeId.startsWith("_")) return;
    updateNodeData(nodeId, {
      status: st as "idle" | "queued" | "processing" | "completed" | "error",
      progress: payload.progress,
    });
  });

  const outputUrl = payload.output_url;
  const outputType = payload.output_type || "image";
  const renderNodeId = resolveTargetRenderId();

  if (outputUrl && renderNodeId) {
    if (outputType === "video") {
      updateNodeData(renderNodeId, {
        videoUrl: outputUrl,
        imageUrl: undefined,
        url: outputUrl,
        outputType: "video",
        status: payload.status === "completed" ? "completed" : "processing",
        progress: payload.progress,
      });
    } else {
      updateNodeData(renderNodeId, {
        imageUrl: outputUrl,
        videoUrl: undefined,
        url: outputUrl,
        outputType: "image",
        status: payload.status === "completed" ? "completed" : "processing",
        progress: payload.progress,
      });
    }
    setPreviewUrl(outputUrl);
  }

  if (payload.status === "completed") {
    if (!outputUrl) {
      const graph = payload.flow_data;
      const renderNode = graph?.nodes?.find(
        (n) =>
          n.id === renderNodeId || n.type === "render" || n.type === "detail"
      );
      const data = renderNode?.data as Record<string, unknown> | undefined;
      const url =
        (data?.videoUrl as string) ||
        (data?.imageUrl as string) ||
        (data?.url as string);
      if (url && typeof url === "string") {
        setPreviewUrl(url);
        if (renderNodeId) {
          updateNodeData(renderNodeId, {
            status: "completed",
            progress: 100,
            imageUrl: url,
            url,
          });
        }
      } else {
        setPreviewUrl(`/api/render/${taskId}/preview`);
      }
    }
    void useAuthStore.getState().fetchUser();
  }

  if (payload.status === "failed" && renderNodeId) {
    updateNodeData(renderNodeId, {
      status: "error",
      error: payload.error_message,
    });
  }
}

function finishTask(taskId: string | null) {
  if (taskId) {
    useEditorStore.getState().setActiveRenderTask(null);
  }
  useUIStore.getState().setRenderProgress(0);
}

/**
 * Track one active render: HTTP poll (2s) + optional WebSocket. Stops when done.
 */
export function useRenderWebSocket(taskId: string | null) {
  const { toast } = useToast();
  const toastRef = useRef(toast);
  toastRef.current = toast;

  useEffect(() => {
    if (!taskId) return;

    let cancelled = false;
    let pollTimer: ReturnType<typeof setTimeout> | null = null;
    let pollAttempts = 0;
    let queuedWarned = false;
    const startedAt = Date.now();
    const trackedTaskId = taskId;

    const handleTerminal = (status: string, errorMessage?: string) => {
      finishTask(trackedTaskId);
      if (status === "failed" && errorMessage) {
        toastRef.current({
          title: "Generation failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    };

    const onPayload = (payload: RenderUpdatePayload) => {
      if (cancelled || payload.task_id !== trackedTaskId) return;

      const terminal = TERMINAL.has(payload.status);
      applyRenderPayload(trackedTaskId, payload, {
        mergeGraph: terminal,
      });

      if (terminal) {
        handleTerminal(payload.status, payload.error_message);
        return true;
      }
      return false;
    };

    const schedulePoll = (delayMs: number) => {
      if (cancelled) return;
      pollTimer = setTimeout(() => void pollOnce(), delayMs);
    };

    const pollOnce = async () => {
      if (cancelled) return;
      pollAttempts += 1;
      try {
        const { data } = await renderService.status(trackedTaskId);
        const payload = taskToRenderPayload(data);
        if (onPayload(payload)) return;

        if (
          data.status === "queued" &&
          !queuedWarned &&
          Date.now() - startedAt > 12000
        ) {
          queuedWarned = true;
          toastRef.current({
            title: "Still waiting for worker",
            description:
              "Start Redis and Celery, or restart Django with DEBUG=1 (render runs in-process).",
            variant: "destructive",
          });
        }

        schedulePoll(data.status === "queued" ? POLL_MS_QUEUED : POLL_MS_ACTIVE);
      } catch {
        if (pollAttempts >= 3) {
          toastRef.current({
            title: "Could not load render status",
            description: "Sign in again or check that the backend is running.",
            variant: "destructive",
          });
          finishTask(trackedTaskId);
          return;
        }
        schedulePoll(POLL_MS_ACTIVE);
      }
    };

    pollOnce();

    const unsubWs = subscribeRender(trackedTaskId, (payload) => {
      if (onPayload(payload) && pollTimer) {
        clearTimeout(pollTimer);
        pollTimer = null;
      }
    });

    return () => {
      cancelled = true;
      if (pollTimer) clearTimeout(pollTimer);
      unsubWs();
    };
  }, [taskId]);
}
