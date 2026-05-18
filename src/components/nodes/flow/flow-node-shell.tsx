"use client";

import { Handle, Position } from "@xyflow/react";
import { cn } from "@/lib/utils";

export interface FlowHandleSpec {
  id: string;
  type: "source" | "target";
  label?: string;
}

interface FlowNodeShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  inputs?: FlowHandleSpec[];
  outputs?: FlowHandleSpec[];
  selected?: boolean;
  className?: string;
}

function FlowHandle({
  spec,
  position,
}: {
  spec: FlowHandleSpec;
  position: Position;
}) {
  const side =
    position === Position.Left
      ? "left-0 -translate-x-1/2"
      : "right-0 translate-x-1/2";

  return (
    <div
      className={cn(
        "absolute top-1/2 z-10 flex -translate-y-1/2 flex-col items-center gap-0.5",
        position === Position.Left ? "left-0" : "right-0"
      )}
      style={{ top: "50%" }}
    >
      <Handle
        id={spec.id}
        type={spec.type}
        position={position}
        className={cn(
          "!relative !top-auto !h-3 !w-3 !transform-none !border-2 !border-[hsl(var(--viz-cyan))] !bg-[hsl(220,22%,8%)]",
          side
        )}
      />
      {spec.label && (
        <span className="pointer-events-none whitespace-nowrap text-[8px] text-muted-foreground">
          {spec.label}
        </span>
      )}
    </div>
  );
}

export function FlowNodeShell({
  title,
  subtitle,
  children,
  inputs = [],
  outputs = [],
  selected,
  className,
}: FlowNodeShellProps) {
  return (
    <div
      className={cn(
        "relative min-w-[200px] overflow-visible rounded-lg border bg-[hsl(220,18%,11%)] shadow-lg",
        selected
          ? "border-[hsl(var(--viz-cyan)/0.6)] ring-1 ring-[hsl(var(--viz-cyan)/0.3)]"
          : "border-[hsl(220,14%,20%)]",
        className
      )}
    >
      {inputs.map((h) => (
        <FlowHandle key={h.id} spec={h} position={Position.Left} />
      ))}
      {outputs.map((h) => (
        <FlowHandle key={h.id} spec={h} position={Position.Right} />
      ))}

      <div className="border-b border-[hsl(220,14%,18%)] px-3 py-2">
        <p className="text-[11px] font-semibold text-foreground/90">{title}</p>
        {subtitle && (
          <p className="mt-0.5 text-[10px] text-muted-foreground">{subtitle}</p>
        )}
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}
