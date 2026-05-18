"use client";

import { Handle, Position, type HandleProps } from "@xyflow/react";
import { cn } from "@/lib/utils";

type FlowArrowHandleProps = Omit<HandleProps, "className"> & {
  className?: string;
  connected?: boolean;
  /** Output = arrow points right (out of node). Input = arrow points into node from left. */
  variant?: "out" | "in";
};

/**
 * VizMaker-style port: circle with directional chevron (not a plain dot).
 */
export function FlowArrowHandle({
  className,
  connected,
  variant = "out",
  ...props
}: FlowArrowHandleProps) {
  return (
    <Handle
      {...props}
      className={cn(
        "viz-arrow-handle",
        variant === "out" ? "viz-arrow-handle--out" : "viz-arrow-handle--in",
        connected && "viz-arrow-handle--connected",
        className
      )}
    />
  );
}

export function SourceOutputHandle() {
  return (
    <FlowArrowHandle
      type="source"
      position={Position.Right}
      variant="out"
      className="!-right-2 !top-1/2"
    />
  );
}

export function RenderInputHandle({
  id,
  top,
  connected,
}: {
  id: string;
  top: string;
  connected?: boolean;
}) {
  return (
    <FlowArrowHandle
      id={id}
      type="target"
      position={Position.Left}
      variant="in"
      connected={connected}
      style={{ top }}
      className="!-left-2"
    />
  );
}

export function RenderOutputHandle({ connected }: { connected?: boolean }) {
  return (
    <FlowArrowHandle
      type="source"
      position={Position.Right}
      variant="out"
      connected={connected}
      className="!-right-2 !top-1/2"
    />
  );
}
