"use client";

import { useEffect, useState } from "react";
import { Cloud, CloudOff, Loader2 } from "lucide-react";
import { APP_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/ui-store";
import { useEditorStore } from "@/store/editor-store";

function formatSavedAgo(timestamp: number): string {
  const sec = Math.floor((Date.now() - timestamp) / 1000);
  if (sec < 8) return "Saved just now";
  if (sec < 60) return `Saved ${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `Saved ${min}m ago`;
  return "Saved";
}

export function EditorHeader() {
  const serverConnected = useUIStore((s) => s.serverConnected);
  const isDirty = useEditorStore((s) => s.isDirty);
  const isSaving = useEditorStore((s) => s.isSaving);
  const lastSavedAt = useEditorStore((s) => s.lastSavedAt);
  const [, tick] = useState(0);

  useEffect(() => {
    if (!lastSavedAt || isDirty || isSaving) return;
    const id = setInterval(() => tick((n) => n + 1), 15000);
    return () => clearInterval(id);
  }, [lastSavedAt, isDirty, isSaving]);

  const saveLabel = isSaving
    ? "Saving…"
    : isDirty
      ? "Unsaved changes"
      : lastSavedAt
        ? formatSavedAgo(lastSavedAt)
        : "Auto-save on";

  return (
    <header className="flex h-9 shrink-0 items-center border-b border-border/60 bg-[hsl(220,18%,8%)] px-3 sm:px-4">
      <div className="flex min-w-0 items-center gap-2 text-sm sm:gap-3">
        <span className="truncate font-semibold tracking-tight text-foreground">
          {APP_NAME}
        </span>
        <span className="hidden text-muted-foreground sm:inline">|</span>
        <span className="hidden items-center gap-1.5 text-muted-foreground sm:flex">
          {serverConnected ? (
            <Cloud className="h-3.5 w-3.5 text-[hsl(var(--viz-cyan))]" />
          ) : (
            <CloudOff className="h-3.5 w-3.5 text-destructive" />
          )}
          <span
            className={cn(
              "text-xs",
              serverConnected ? "text-[hsl(var(--viz-cyan))]" : "text-destructive"
            )}
          >
            {serverConnected ? "Connected" : "Disconnected"}
          </span>
        </span>
        <span className="hidden text-muted-foreground md:inline">|</span>
        <span
          className={cn(
            "hidden items-center gap-1.5 text-xs md:flex",
            isSaving && "text-[hsl(var(--viz-cyan))]",
            isDirty && !isSaving && "text-amber-400/90",
            !isDirty && !isSaving && "text-muted-foreground"
          )}
        >
          {isSaving && <Loader2 className="h-3 w-3 animate-spin" />}
          {saveLabel}
        </span>
        <span
          className={cn(
            "flex items-center sm:hidden",
            !serverConnected && "text-destructive",
            serverConnected && isDirty && !isSaving && "text-amber-400/90",
            serverConnected && !isDirty && !isSaving && "text-muted-foreground"
          )}
          aria-label={saveLabel}
        >
          {isSaving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-[hsl(var(--viz-cyan))]" />
          ) : serverConnected ? (
            <Cloud className="h-3.5 w-3.5 text-[hsl(var(--viz-cyan))]" />
          ) : (
            <CloudOff className="h-3.5 w-3.5" />
          )}
        </span>
      </div>
    </header>
  );
}
