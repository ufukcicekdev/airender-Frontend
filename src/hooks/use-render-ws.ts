"use client";

import { useEffect, useRef } from "react";
import { subscribeRender } from "@/services/websocket.service";
import { renderService } from "@/services/render.service";
import { taskToRenderPayload } from "@/lib/render-payload";
import { useEditorStore } from "@/store/editor-store";
import { useUIStore } from "@/store/ui-store";
import { useAuthStore } from "@/store/auth-store";
import { isCanvasGraph } from "@/lib/canvas-graph-io";
import type { RenderUpdatePayload } from "@/services/websocket.service";
import type { WorkflowGraph } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { saveWorkflowNow } from "@/lib/workflow-save";

const TERMINAL = new Set(["completed", "failed", "cancelled"]);
/** HTTP fallback only when WebSocket is quiet — keeps Network tab clean. */
const POLL_MS_QUEUED = 4000;
const POLL_MS_ACTIVE = 5000;
const WS_GRACE_MS = 3500;

function applyMediaToRenderNode(
  renderNodeId: string,
  url: string,
  outputType: string,
  payload: RenderUpdatePayload
) {
  const isVideo = outputType === "video";
  if (isVideo) {
    useEditorStore.getState().updateNodeData(
      renderNodeId,
      {
        videoUrl: url,
        imageUrl: undefined,
        url,
        outputType: "video",
        status: payload.status === "completed" ? "completed" : "processing",
        progress: payload.progress,
      },
      { silent: true }
    );
  } else {
    useEditorStore.getState().updateNodeData(
      renderNodeId,
      {
        imageUrl: url,
        videoUrl: undefined,
        url,
        outputType: "image",
        status: payload.status === "completed" ? "completed" : "processing",
        progress: payload.progress,
      },
      { silent: true }
    );
  }
}

function applyRenderPayload(
  taskId: string,
  payload: RenderUpdatePayload,
  options: { mergeGraph: boolean }
) {
  const ui = useUIStore.getState();
  ui.setRenderProgress(payload.progress ?? 0);
  if (payload.current_stage) {
    ui.setRenderStage(payload.current_stage);
  }
  const {
    updateNodeData,
    mergeCanvasGraph,
    applyFlowData,
    setPreviewUrl,
  } = useEditorStore.getState();

  const targetRenderId =
    (payload.node_statuses?._target_render_id as string | undefined) || undefined;

  const resolveTargetRenderId = () => {
    if (targetRenderId) return targetRenderId;
    const renderingId = useEditorStore.getState().renderingNodeId;
    if (renderingId) return renderingId;
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
      mergeCanvasGraph(payload.flow_data as WorkflowGraph, { silent: true });
    } else {
      applyFlowData(payload.flow_data);
    }
  }

  Object.entries(payload.node_statuses || {}).forEach(([nodeId, st]) => {
    if (nodeId.startsWith("_")) return;
    updateNodeData(
      nodeId,
      {
        status: st as "idle" | "queued" | "processing" | "completed" | "error",
        progress: payload.progress,
      },
      { silent: true }
    );
  });

  const outputUrl = payload.output_url;
  const outputType = payload.output_type || "image";
  const renderNodeId = resolveTargetRenderId();

  if (outputUrl && renderNodeId) {
    applyMediaToRenderNode(renderNodeId, outputUrl, outputType, payload);
    setPreviewUrl(outputUrl);
  }

  if (payload.status === "completed") {
    if (!outputUrl && renderNodeId) {
      const graph = payload.flow_data;
      const renderNode = graph?.nodes?.find(
        (n) =>
          n.id === renderNodeId || n.type === "render" || n.type === "detail"
      );
      const data = renderNode?.data as Record<string, unknown> | undefined;
      const videoUrl = data?.videoUrl as string | undefined;
      const imageUrl = data?.imageUrl as string | undefined;
      const url =
        videoUrl ||
        imageUrl ||
        (data?.url as string) ||
        `/api/render/${taskId}/preview`;
      const resolvedType = videoUrl ? "video" : payload.output_type || "image";
      applyMediaToRenderNode(renderNodeId, url, resolvedType, payload);
      setPreviewUrl(url);
    }
    void useAuthStore.getState().fetchUser();
  }

  if (payload.status === "failed" && renderNodeId) {
    updateNodeData(
      renderNodeId,
      {
        status: "error",
        error: payload.error_message,
      },
      { silent: true }
    );
  }
}

function finishTask(taskId: string | null) {
  if (taskId) {
    useEditorStore.getState().setActiveRenderTask(null);
    useEditorStore.getState().setRenderingNodeId(null);
  }
  const ui = useUIStore.getState();
  ui.setRenderProgress(0);
  ui.setRenderStage("");
}

/**
 * Track one active render: WebSocket first, rare HTTP fallback poll.
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
    let wsSeen = false;
    let pollScheduled = false;
    const startedAt = Date.now();
    const trackedTaskId = taskId;

    const clearPoll = () => {
      if (pollTimer) {
        clearTimeout(pollTimer);
        pollTimer = null;
      }
      pollScheduled = false;
    };

    const handleTerminal = (status: string, errorMessage?: string) => {
      finishTask(trackedTaskId);
      if (status === "failed" && errorMessage) {
        toastRef.current({
          title: "Generation failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
      if (status === "completed") {
        void saveWorkflowNow().then(() => {
          useEditorStore.getState().setDirty(false);
        });
      }
    };

    const onPayload = (payload: RenderUpdatePayload) => {
      if (cancelled || payload.task_id !== trackedTaskId) return false;

      wsSeen = true;
      clearPoll();

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
      if (cancelled || pollScheduled) return;
      pollScheduled = true;
      pollTimer = setTimeout(() => {
        pollScheduled = false;
        void pollOnce();
      }, delayMs);
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

    const unsubWs = subscribeRender(
      trackedTaskId,
      (payload) => {
        onPayload(payload);
      },
      {
        onOpen: () => clearPoll(),
        onError: () => {
          if (!wsSeen) schedulePoll(800);
        },
      }
    );

    schedulePoll(WS_GRACE_MS);

    return () => {
      cancelled = true;
      clearPoll();
      unsubWs();
    };
  }, [taskId]);
}
