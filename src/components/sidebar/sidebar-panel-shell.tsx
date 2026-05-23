"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarPanelShellProps {
  title: string;
  subtitle?: string;
  onClose?: () => void;
  className?: string;
  children: React.ReactNode;
}

export function SidebarPanelShell({
  title,
  subtitle,
  onClose,
  className,
  children,
}: SidebarPanelShellProps) {
  return (
    <div
      className={cn(
        "flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-[hsl(220,18%,8%)]",
        className
      )}
    >
      <div className="flex shrink-0 items-center justify-between border-b border-border/60 px-6 py-4">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          {subtitle && (
            <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-white/5 hover:text-foreground"
            aria-label="Back to editor"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-6">{children}</div>
    </div>
  );
}
