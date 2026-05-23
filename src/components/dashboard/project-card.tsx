"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { FolderOpen, Pencil, Trash2, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { formatRelativeTime } from "@/lib/format-relative-time";
import type { Project } from "@/types";

type Props = {
  project: Project;
  onRename: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export function ProjectCard({ project, onRename, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(project.name);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(project.name);
  }, [project.name]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commitRename = async () => {
    const trimmed = name.trim() || "Untitled";
    setEditing(false);
    if (trimmed === project.name) return;
    setSaving(true);
    try {
      await onRename(project.id, trimmed);
    } finally {
      setSaving(false);
    }
  };

  const openDeleteDialog = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(project.id);
      setDeleteOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  const activity =
    project.last_activity_label || project.last_activity_summary || "Project created";
  const when = formatRelativeTime(project.updated_at);
  const preview = project.preview_url;

  const cardBody = (
    <>
      <div className="relative mb-3 aspect-video overflow-hidden rounded-lg bg-muted/40">
        {preview ? (
          <img src={preview} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <FolderOpen className="h-10 w-10 text-primary/60" />
          </div>
        )}
        <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="h-8 w-8"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setEditing(true);
            }}
            aria-label="Rename project"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={openDeleteDialog}
            aria-label="Delete project"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {editing ? (
        <Input
          ref={inputRef}
          value={name}
          disabled={saving}
          className="h-8 text-sm font-semibold"
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => void commitRename()}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === "Enter") void commitRename();
            if (e.key === "Escape") {
              setName(project.name);
              setEditing(false);
            }
          }}
        />
      ) : (
        <h3 className="truncate font-semibold group-hover:text-primary">{project.name}</h3>
      )}

      <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{activity}</p>
      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground/80">
        {when && <span>{when}</span>}
        {(project.node_count ?? 0) > 0 && (
          <>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1">
              <Layers className="h-3 w-3" />
              {project.node_count} nodes
            </span>
          </>
        )}
      </div>
    </>
  );

  const deleteDialog = (
    <ConfirmDialog
      open={deleteOpen}
      onOpenChange={(open) => {
        if (!deleting) setDeleteOpen(open);
      }}
      title={`Delete "${project.name}"?`}
      description="This cannot be undone. All nodes and renders in this project will be removed."
      confirmLabel="Delete project"
      cancelLabel="Cancel"
      variant="destructive"
      loading={deleting}
      onConfirm={confirmDelete}
    />
  );

  if (editing) {
    return (
      <>
        <div className="group rounded-xl border border-primary/40 bg-card/50 p-5 shadow-node">
          {cardBody}
        </div>
        {deleteDialog}
      </>
    );
  }

  return (
    <>
      <Link
        href={`/editor/${project.id}`}
        className="group block rounded-xl border border-border/50 bg-card/50 p-5 transition-all hover:border-primary/40 hover:shadow-node"
      >
        {cardBody}
      </Link>
      {deleteDialog}
    </>
  );
}
