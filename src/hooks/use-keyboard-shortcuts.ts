"use client";

import { useEffect } from "react";
import { useEditorStore } from "@/store/editor-store";
import { useUIStore } from "@/store/ui-store";

export function useKeyboardShortcuts(onSave?: () => void, onRender?: () => void) {
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const duplicateSelected = useEditorStore((s) => s.duplicateSelected);
  const deleteSelected = useEditorStore((s) => s.deleteSelected);
  const deleteSelectedEdges = useEditorStore((s) => s.deleteSelectedEdges);
  const selectedEdgeIds = useEditorStore((s) => s.selectedEdgeIds);
  const requestNewGroup = useUIStore((s) => s.requestNewGroup);
  const ungroupSelection = useEditorStore((s) => s.ungroupSelection);
  const selectedNodeIds = useEditorStore((s) => s.selectedNodeIds);
  const nodes = useEditorStore((s) => s.nodes);
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;

      if (meta && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(true);
        return;
      }

      if (meta && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      if (meta && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        redo();
        return;
      }

      if (meta && e.key === "s") {
        e.preventDefault();
        onSave?.();
        return;
      }

      if (meta && e.key === "Enter") {
        e.preventDefault();
        onRender?.();
        return;
      }

      if (meta && e.key === "d") {
        e.preventDefault();
        duplicateSelected();
        return;
      }

      if (meta && e.key === "g" && !e.shiftKey) {
        e.preventDefault();
        requestNewGroup();
        return;
      }

      if (meta && e.key === "g" && e.shiftKey) {
        e.preventDefault();
        const hasGroup = selectedNodeIds.some(
          (id) => nodes.find((n) => n.id === id)?.type === "group"
        );
        if (hasGroup) ungroupSelection();
        return;
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
        e.preventDefault();
        if (selectedEdgeIds.length > 0) {
          deleteSelectedEdges();
          return;
        }
        deleteSelected();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [
    undo,
    redo,
    duplicateSelected,
    deleteSelected,
    deleteSelectedEdges,
    selectedEdgeIds,
    requestNewGroup,
    ungroupSelection,
    selectedNodeIds,
    nodes,
    setCommandPaletteOpen,
    onSave,
    onRender,
  ]);
}
