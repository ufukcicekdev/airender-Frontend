"use client";

import { cn } from "@/lib/utils";
import { getModelBadges } from "@/lib/image-edit-settings";

interface ModelCapabilityBadgesProps {
  config?: Record<string, unknown>;
  className?: string;
  size?: "xs" | "sm";
}

export function ModelCapabilityBadges({
  config,
  className,
  size = "xs",
}: ModelCapabilityBadgesProps) {
  const badges = getModelBadges(config);
  if (!badges.length) return null;

  return (
    <span className={cn("inline-flex flex-wrap items-center gap-1", className)}>
      {badges.map((badge) => (
        <span
          key={badge}
          className={cn(
            "rounded border border-border/50 bg-[hsl(220,16%,14%)] font-medium text-muted-foreground",
            size === "xs" && "px-2 py-0.5 text-[11px] leading-none",
            size === "sm" && "px-2 py-1 text-xs leading-none"
          )}
        >
          {badge}
        </span>
      ))}
    </span>
  );
}
