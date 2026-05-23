"use client";

import { useQuery } from "@tanstack/react-query";
import { Clock, ImageIcon, Loader2, Video } from "lucide-react";
import { SidebarPanelShell } from "@/components/sidebar/sidebar-panel-shell";
import { renderService } from "@/services/render.service";
import type { RenderTask } from "@/types";
import { cn } from "@/lib/utils";

interface HistoryPanelProps {
  onClose?: () => void;
  className?: string;
}

function taskMeta(task: RenderTask) {
  const nodes = task.flow_data?.nodes ?? [];
  const render = nodes.find(
    (n) => n.type === "render" || n.type === "detail"
  );
  const data = (render?.data ?? {}) as Record<string, unknown>;
  const model = String(data.modelName || data.modelSlug || "Generation");
  const category = String(data.categorySlug || "");
  return { model, category };
}

function statusStyle(status: RenderTask["status"]) {
  switch (status) {
    case "completed":
      return "text-emerald-400 bg-emerald-400/10";
    case "failed":
      return "text-red-400 bg-red-400/10";
    case "processing":
    case "queued":
      return "text-[hsl(var(--viz-cyan))] bg-[hsl(var(--viz-cyan)/0.12)]";
    default:
      return "text-muted-foreground bg-white/5";
  }
}

export function HistoryPanel({ onClose, className }: HistoryPanelProps) {
  const { data: tasks = [], isLoading, isError } = useQuery({
    queryKey: ["render-history"],
    queryFn: async () => {
      const { data } = await renderService.history();
      return data;
    },
  });

  return (
    <SidebarPanelShell
      title="Render history"
      subtitle="Your last 20 generations across all projects"
      onClose={onClose}
      className={className}
    >
      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading…
        </div>
      )}

      {isError && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          Could not load history. Check that the backend is running.
        </p>
      )}

      {!isLoading && !isError && tasks.length === 0 && (
        <div className="rounded-xl border border-dashed border-border/60 py-16 text-center">
          <Clock className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <p className="mt-4 font-medium">No renders yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Run Make on the canvas — completed jobs will appear here.
          </p>
        </div>
      )}

      <ul className="space-y-3">
        {tasks.map((task) => {
          const { model, category } = taskMeta(task);
          const thumb = task.images?.[0];
          const isVideo =
            thumb?.metadata?.output_type === "video" ||
            String(thumb?.image_url || "").includes(".mp4");

          return (
            <li
              key={task.id}
              className="flex gap-4 rounded-xl border border-border/60 bg-card/30 p-4"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-black/40">
                {thumb?.thumbnail_url || thumb?.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={thumb.thumbnail_url || thumb.image_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    {isVideo ? (
                      <Video className="h-6 w-6" />
                    ) : (
                      <ImageIcon className="h-6 w-6" />
                    )}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-medium">{model}</p>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                      statusStyle(task.status)
                    )}
                  >
                    {task.status}
                  </span>
                </div>
                {category && (
                  <p className="mt-0.5 text-xs text-muted-foreground capitalize">
                    {category.replace(/-/g, " ")}
                  </p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(task.created_at).toLocaleString()}
                  {task.status === "processing" && ` · ${task.progress}%`}
                </p>
                {task.error_message && task.status === "failed" && (
                  <p className="mt-2 line-clamp-2 text-xs text-red-300/90">
                    {task.error_message}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </SidebarPanelShell>
  );
}
