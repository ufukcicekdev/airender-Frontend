"use client";

import { Box, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  isModel3dPreviewable,
  looksLikeImageUrl,
} from "@/lib/media-kind";
import { cn } from "@/lib/utils";

type Model3dViewerProps = {
  url: string;
  className?: string;
  /** panel = right preview; node = compact canvas card */
  variant?: "panel" | "node";
};

export function Model3dViewer({
  url,
  className,
  variant = "panel",
}: Model3dViewerProps) {
  const isNode = variant === "node";
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const previewable = isModel3dPreviewable(url);
  const imageFallback = !previewable && looksLikeImageUrl(url);

  useEffect(() => {
    if (!previewable) return;
    let cancelled = false;
    void import("@google/model-viewer").then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [previewable, url]);

  if (imageFallback) {
    return (
      <div
        className={cn(
          "relative h-full w-full bg-[#0d0f12]",
          !isNode && "min-h-[200px]",
          className
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt="3D preview thumbnail"
          className="h-full w-full object-contain"
        />
        {!isNode ? (
          <p className="absolute bottom-2 left-0 right-0 px-2 text-center text-[10px] text-muted-foreground">
            Preview image — GLB mesh will appear here when the provider returns one
          </p>
        ) : null}
      </div>
    );
  }

  if (!previewable || failed) {
    return (
      <ViewerPlaceholder
        compact={isNode}
        className={className}
        icon={
          <Box
            className={cn(
              "text-[hsl(var(--viz-cyan)/0.85)]",
              isNode ? "h-8 w-8" : "h-10 w-10"
            )}
          />
        }
        message={
          failed
            ? "Could not load 3D preview"
            : isNode
              ? "3D ready"
              : "3D mesh ready — download GLB/GLTF to open in an external viewer"
        }
      />
    );
  }

  if (!ready) {
    return (
      <ViewerPlaceholder
        compact={isNode}
        className={className}
        icon={
          <Loader2
            className={cn(
              "animate-spin text-[hsl(var(--viz-cyan))]",
              isNode ? "h-6 w-6" : "h-8 w-8"
            )}
          />
        }
        message={isNode ? undefined : "Loading 3D model…"}
      />
    );
  }

  return (
    <model-viewer
      key={url}
      src={url}
      camera-controls={isNode ? undefined : true}
      touch-action={isNode ? "none" : "pan-y"}
      interaction-prompt="none"
      shadow-intensity="0"
      exposure="1"
      className={cn(
        "block h-full w-full bg-[#0d0f12]",
        isNode && "pointer-events-none",
        className
      )}
      style={isNode ? undefined : { minHeight: "200px" }}
      onError={() => setFailed(true)}
    />
  );
}

function ViewerPlaceholder({
  compact = false,
  className,
  icon,
  message,
}: {
  compact?: boolean;
  className?: string;
  icon: React.ReactNode;
  message?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-full flex-col items-center justify-center bg-[hsl(220,20%,6%)] text-center",
        compact ? "gap-1 p-2" : "min-h-[200px] gap-3 p-6",
        className
      )}
    >
      {icon}
      {message ? (
        <p
          className={cn(
            "text-muted-foreground",
            compact ? "text-[9px] font-semibold uppercase tracking-wide" : "max-w-xs text-sm"
          )}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
