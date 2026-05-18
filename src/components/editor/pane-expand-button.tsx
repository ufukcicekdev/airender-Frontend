"use client";

import { Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/ui-store";

type PaneExpandButtonProps = {
  className?: string;
  title?: string;
};

export function PaneExpandButton({
  className,
  title = "Expand to workspace",
}: PaneExpandButtonProps) {
  const setMediaWorkspaceExpanded = useUIStore(
    (s) => s.setMediaWorkspaceExpanded
  );

  return (
    <button
      type="button"
      title={title}
      onClick={() => setMediaWorkspaceExpanded(true)}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors",
        "hover:bg-white/10 hover:text-[hsl(var(--viz-cyan))]",
        className
      )}
    >
      <Maximize2 className="h-4 w-4" />
    </button>
  );
}
