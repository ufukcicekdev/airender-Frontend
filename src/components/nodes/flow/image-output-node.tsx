"use client";

import type { NodeProps } from "@xyflow/react";
import { Loader2 } from "lucide-react";
import { FlowNodeShell } from "./flow-node-shell";
import { FLOW_HANDLES } from "@/types/flow-graph";
import type { FlowImageOutputData } from "@/types/flow-graph";
import { normalizeMediaUrl } from "@/lib/media-url";
import { cn } from "@/lib/utils";

const PLACEHOLDER =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="140" viewBox="0 0 200 140">
      <rect fill="#14171c" width="200" height="140"/>
      <text x="100" y="72" text-anchor="middle" fill="#6b7280" font-size="12">Awaiting input</text>
    </svg>`
  );

export function ImageOutputNode(props: NodeProps) {
  const data = props.data as unknown as FlowImageOutputData & {
    label?: string;
    status?: string;
  };
  const status = data.status || "idle";
  const isProcessing = status === "processing" || status === "queued";
  const imageUrl = normalizeMediaUrl(data.url) || PLACEHOLDER;

  return (
    <FlowNodeShell
      title={data.label || "Image Output"}
      subtitle="input → url"
      selected={props.selected}
      inputs={[{ id: FLOW_HANDLES.imageOutput.input, type: "target", label: "input" }]}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-[hsl(220,20%,8%)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt=""
          className={cn(
            "h-full w-full object-cover",
            isProcessing && "opacity-50 blur-[1px]"
          )}
        />
        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--viz-cyan))]" />
          </div>
        )}
      </div>
    </FlowNodeShell>
  );
}
