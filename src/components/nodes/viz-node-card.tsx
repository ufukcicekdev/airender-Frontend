"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { normalizeMediaUrl } from "@/lib/media-url";
import { inputPortTopPercent, type InputPortInfo } from "@/lib/dynamic-input-handles";
import {
  RenderInputHandle,
  RenderOutputHandle,
  SourceOutputHandle,
} from "./flow-arrow-handle";
import type { NodeData } from "@/types";

const PLACEHOLDER_SKETCH =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="140" viewBox="0 0 200 140">
      <rect fill="#1a1d24" width="200" height="140"/>
      <path d="M20 100 L60 50 L100 70 L140 40 L180 90 L180 100 Z" fill="none" stroke="#6b7280" stroke-width="1.5"/>
      <rect x="70" y="55" width="30" height="25" fill="none" stroke="#6b7280" stroke-width="1"/>
    </svg>`
  );

interface VizNodeCardProps {
  data: NodeData;
  selected?: boolean;
  inputs?: number;
  outputs?: number;
  badge?: string;
  subtitle?: string;
  previewUrl?: string;
  showHandles?: boolean;
  dynamicInputs?: boolean;
  inputPorts?: InputPortInfo[];
  connectedCount?: number;
  /** Source-only card uses single right arrow */
  variant?: "source" | "generation";
}

export function VizNodeCard({
  data,
  selected,
  inputs = 1,
  outputs = 1,
  badge,
  subtitle,
  previewUrl,
  showHandles = true,
  dynamicInputs = false,
  inputPorts = [],
  connectedCount = 0,
  variant = "generation",
}: VizNodeCardProps) {
  const status = data.status || "idle";
  const isDraft = data.isDraft === true;
  const isProcessing = status === "processing" || status === "queued";
  const isCompleted = status === "completed";
  const hasRenderedOutput =
    isCompleted && Boolean(data.imageUrl || data.videoUrl) && !isDraft;
  const videoUrl = normalizeMediaUrl(data.videoUrl as string | undefined);
  const imageUrl =
    normalizeMediaUrl((data.imageUrl as string) || previewUrl) || PLACEHOLDER_SKETCH;
  const showVideo = Boolean(videoUrl);

  const ports = dynamicInputs ? inputPorts : [];
  const connectedThumbs = ports
    .filter((p) => p.connected && p.thumbnailUrl)
    .map((p) => normalizeMediaUrl(p.thumbnailUrl)!);

  const modelLabel = String(data.model_name || data.label || "Generation");

  return (
    <div
      className={cn(
        "relative w-[200px] overflow-visible rounded-lg border bg-[hsl(220,18%,11%)] shadow-lg transition-all",
        isDraft && "opacity-[0.52] saturate-[0.85]",
        selected
          ? "border-[hsl(var(--viz-cyan)/0.6)] ring-1 ring-[hsl(var(--viz-cyan)/0.3)]"
          : isDraft
            ? "border-dashed border-[hsl(var(--viz-cyan)/0.35)]"
            : "border-[hsl(220,14%,20%)]"
      )}
    >
      {variant === "source" && showHandles && outputs > 0 && <SourceOutputHandle />}

      {variant === "generation" && showHandles && dynamicInputs &&
        ports.map((port) => (
          <RenderInputHandle
            key={port.id}
            id={port.id}
            top={`${inputPortTopPercent(port.index, ports.length)}%`}
            connected={port.connected}
          />
        ))}

      {variant === "generation" && showHandles && inputs > 0 && !dynamicInputs && (
        <RenderInputHandle id="default" top="50%" connected={connectedCount > 0} />
      )}

      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-lg bg-[hsl(220,20%,8%)]">
        {isDraft && (
          <div className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center bg-[hsl(220,22%,6%)]/60">
            <span className="rounded-md border border-[hsl(var(--viz-cyan)/0.25)] bg-black/40 px-2 py-1 text-[10px] font-medium text-[hsl(var(--viz-cyan))]">
              Preview
            </span>
          </div>
        )}
        {Boolean(data.hasMask || data.maskDataUrl) && (
          <span className="pointer-events-none absolute left-1.5 top-1.5 z-[3] rounded bg-[hsl(var(--viz-cyan))] px-1 py-0.5 text-[8px] font-bold uppercase tracking-wide text-[hsl(220,20%,8%)]">
            Mask
          </span>
        )}
        {showVideo ? (
          <video
            src={videoUrl}
            className={cn(
              "h-full w-full object-cover",
              isProcessing && "scale-105 blur-[2px] brightness-75"
            )}
            muted
            playsInline
            loop
            autoPlay
          />
        ) : (
          <img
            src={imageUrl}
            alt=""
            referrerPolicy="no-referrer"
            className={cn(
              "h-full w-full object-cover",
              isProcessing && "scale-105 blur-[2px] brightness-75",
              isDraft && "opacity-40",
              dynamicInputs &&
                connectedCount > 0 &&
                !isDraft &&
                !hasRenderedOutput &&
                "opacity-35"
            )}
          />
        )}

        {dynamicInputs &&
          connectedThumbs.length > 0 &&
          !isDraft &&
          !hasRenderedOutput && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 p-4 pl-7">
            {connectedThumbs.map((url, i) => (
              <img
                key={`${url}-${i}`}
                src={url}
                alt=""
                className="h-14 w-14 rounded-md border border-[hsl(var(--viz-cyan)/0.45)] object-cover shadow-md"
              />
            ))}
          </div>
        )}

        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--viz-cyan))]" />
          </div>
        )}
        {badge && variant === "generation" && (
          <span
            className={cn(
              "absolute left-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium backdrop-blur-sm",
              isDraft ? "text-[hsl(var(--viz-cyan))]" : "text-white"
            )}
          >
            {badge}
          </span>
        )}
      </div>

      <div className="rounded-b-lg border-t border-[hsl(220,14%,18%)] bg-[hsl(220,18%,11%)] px-2.5 py-2">
        <p className="truncate text-[11px] font-semibold text-foreground/95">
          {variant === "generation" ? modelLabel : String(data.label || "Source")}
        </p>
        {subtitle && (
          <p
            className={cn(
              "mt-0.5 line-clamp-2 text-[10px] leading-snug",
              isDraft ? "text-[hsl(var(--viz-cyan)/0.7)]" : "text-muted-foreground"
            )}
          >
            {subtitle}
          </p>
        )}
      </div>

      {variant === "generation" && showHandles && outputs > 0 && (
        <RenderOutputHandle connected={!isDraft} />
      )}
    </div>
  );
}
