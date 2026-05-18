"use client";

import { useEffect, useState } from "react";
import { Cloud, CloudOff, Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/ui-store";
import { useEditorStore } from "@/store/editor-store";
import { Button } from "@/components/ui/button";
import { CanvasUploadButton } from "@/components/editor/canvas-upload-button";

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
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);
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
    <header className="flex h-9 shrink-0 items-center justify-between border-b border-border/60 bg-[hsl(220,18%,8%)] px-4">
      <div className="flex items-center gap-3 text-sm">
        <span className="font-semibold tracking-tight text-foreground">Vizmake</span>
        <span className="text-muted-foreground">|</span>
        <span className="flex items-center gap-1.5 text-muted-foreground">
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
        <span className="text-muted-foreground">|</span>
        <span
          className={cn(
            "flex items-center gap-1.5 text-xs",
            isSaving && "text-[hsl(var(--viz-cyan))]",
            isDirty && !isSaving && "text-amber-400/90",
            !isDirty && !isSaving && "text-muted-foreground"
          )}
        >
          {isSaving && <Loader2 className="h-3 w-3 animate-spin" />}
          {saveLabel}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <CanvasUploadButton />
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-7 gap-1.5 border-border/60 text-xs"
          onClick={() => setCommandPaletteOpen(true)}
        >
          <Plus className="h-3.5 w-3.5" />
          Add node
          <kbd className="ml-1 hidden rounded bg-white/10 px-1 font-mono text-[10px] sm:inline">
            ⌘K
          </kbd>
        </Button>
      </div>
    </header>
  );
}
