"use client";

import { Download, Play, Save, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { useEditorStore } from "@/store/editor-store";
import { formatCredits } from "@/lib/utils";

interface TopBarProps {
  onSave: () => void;
  onRender: () => void;
  onExport: () => void;
}

export function TopBar({ onSave, onRender, onExport }: TopBarProps) {
  const user = useAuthStore((s) => s.user);
  const projectName = useEditorStore((s) => s.projectName);
  const isSaving = useEditorStore((s) => s.isSaving);
  const isDirty = useEditorStore((s) => s.isDirty);

  return (
    <header className="flex h-12 items-center justify-between border-b border-border/50 bg-card/30 px-4 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
          ← Projects
        </Link>
        <span className="text-border">|</span>
        <h1 className="text-sm font-semibold">{projectName}</h1>
        {isDirty && <span className="text-xs text-muted-foreground">• unsaved</span>}
        {isSaving && <span className="text-xs text-primary animate-pulse">Saving…</span>}
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onSave}>
          <Save className="h-4 w-4" />
          Save
        </Button>
        <Button variant="ghost" size="sm" onClick={onExport}>
          <Download className="h-4 w-4" />
          Export
        </Button>
        <Button variant="glass" size="sm" onClick={onRender} className="gap-1.5">
          <Play className="h-4 w-4" />
          Render
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 rounded-full border border-border/50 bg-white/5 px-3 py-1 text-xs">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          <span>{formatCredits(user?.credits ?? 0)} credits</span>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-medium text-white">
          {user?.username?.[0]?.toUpperCase() ?? "U"}
        </div>
      </div>
    </header>
  );
}
