"use client";

import { useEffect } from "react";
import { subscribeRender } from "@/services/websocket.service";
import { useEditorStore } from "@/store/editor-store";
import { useUIStore } from "@/store/ui-store";
import { useAuthStore } from "@/store/auth-store";
import {
  isCanvasGraph,
  mergeCanvasGraphFromServer,
} from "@/lib/canvas-graph-io";
import type { WorkflowGraph } from "@/types";

export function useRenderWebSocket(taskId: string | null) {
  const updateNodeData = useEditorStore((s) => s.updateNodeData);
  const mergeCanvasGraph = useEditorStore((s) => s.mergeCanvasGraph);
  const applyFlowData = useEditorStore((s) => s.applyFlowData);
  const setPreviewUrl = useEditorStore((s) => s.setPreviewUrl);
  const setRenderProgress = useUIStore((s) => s.setRenderProgress);
  const fetchUser = useAuthStore((s) => s.fetchUser);

  useEffect(() => {
    if (!taskId) return;

    return subscribeRender(taskId, (payload) => {
      setRenderProgress(payload.progress ?? 0);

      const targetRenderId =
        (payload.node_statuses?._target_render_id as string | undefined) ||
        undefined;

      if (payload.flow_data?.nodes) {
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

      if (outputUrl && targetRenderId) {
        if (outputType === "video") {
          updateNodeData(targetRenderId, {
            videoUrl: outputUrl,
            imageUrl: undefined,
            url: outputUrl,
            outputType: "video",
            status:
              payload.status === "completed" ? "completed" : "processing",
            progress: payload.progress,
          });
        } else {
          updateNodeData(targetRenderId, {
            imageUrl: outputUrl,
            videoUrl: undefined,
            url: outputUrl,
            outputType: "image",
            status:
              payload.status === "completed" ? "completed" : "processing",
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
              n.id === targetRenderId ||
              n.type === "render" ||
              n.type === "detail"
          );
          const data = renderNode?.data as Record<string, unknown> | undefined;
          const url =
            (data?.videoUrl as string) ||
            (data?.imageUrl as string) ||
            (data?.url as string);
          if (url && typeof url === "string") {
            setPreviewUrl(url);
            if (targetRenderId) {
              updateNodeData(targetRenderId, {
                status: "completed",
                progress: 100,
              });
            }
          } else {
            setPreviewUrl(`/api/render/${taskId}/preview`);
          }
        }
        void fetchUser();
      }

      if (payload.status === "failed" && targetRenderId) {
        updateNodeData(targetRenderId, {
          status: "error",
          error: payload.error_message,
        });
      }
    });
  }, [
    taskId,
    updateNodeData,
    mergeCanvasGraph,
    applyFlowData,
    setPreviewUrl,
    setRenderProgress,
    fetchUser,
  ]);
}
