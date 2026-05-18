"use client";

import { cn } from "@/lib/utils";
import { modelTagLabel, normalizeModelTag } from "@/lib/model-tags";

const TAG_STYLES = {
  free: "border-emerald-500/40 bg-emerald-500/15 text-emerald-300",
  pro: "border-amber-500/40 bg-amber-500/15 text-amber-200",
  new: "border-[hsl(var(--viz-cyan)/0.45)] bg-[hsl(var(--viz-cyan)/0.12)] text-[hsl(var(--viz-cyan))]",
  beta: "border-violet-500/40 bg-violet-500/15 text-violet-200",
} as const;

interface ModelTagBadgeProps {
  tag?: string | null;
  className?: string;
  size?: "xs" | "sm";
}

export function ModelTagBadge({ tag, className, size = "xs" }: ModelTagBadgeProps) {
  const normalized = normalizeModelTag(tag);
  const label = modelTagLabel(tag);
  if (!normalized || !label) return null;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded border font-semibold uppercase tracking-wide",
        size === "xs" && "px-1.5 py-0.5 text-[10px] leading-none",
        size === "sm" && "px-2 py-0.5 text-[11px] leading-none",
        TAG_STYLES[normalized],
        className
      )}
    >
      {label}
    </span>
  );
}
