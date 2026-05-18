"use client";

import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/store/ui-store";
import { useEditorStore } from "@/store/editor-store";
import { createPaletteNode } from "@/lib/create-palette-node";

export function CommandPalette() {
  const router = useRouter();
  const open = useUIStore((s) => s.commandPaletteOpen);
  const setOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const addNode = useEditorStore((s) => s.addNode);
  const setSelectedNodeIds = useEditorStore((s) => s.setSelectedNodeIds);
  const nodeCount = useEditorStore((s) => s.nodes.length);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-[20vh] backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <Command
        className="w-full max-w-lg overflow-hidden rounded-xl border border-border/50 bg-card shadow-glass"
        onClick={(e) => e.stopPropagation()}
      >
        <Command.Input
          placeholder="Type a command…"
          className="w-full border-b border-border/50 bg-transparent px-4 py-3 text-sm outline-none"
        />
        <Command.List className="max-h-72 overflow-y-auto p-2">
          <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
            No results.
          </Command.Empty>
          <Command.Group heading="Canvas">
            <Command.Item
              className="cursor-pointer rounded-lg px-3 py-2 text-sm aria-selected:bg-white/10"
              onSelect={() => {
                const node = createPaletteNode("source", "Source Image", nodeCount);
                addNode(node);
                setSelectedNodeIds([node.id]);
                setOpen(false);
              }}
            >
              Add source image
            </Command.Item>
          </Command.Group>
          <Command.Group heading="Actions">
            <Command.Item
              className="cursor-pointer rounded-lg px-3 py-2 text-sm aria-selected:bg-white/10"
              onSelect={() => {
                undo();
                setOpen(false);
              }}
            >
              Undo
            </Command.Item>
            <Command.Item
              className="cursor-pointer rounded-lg px-3 py-2 text-sm aria-selected:bg-white/10"
              onSelect={() => {
                redo();
                setOpen(false);
              }}
            >
              Redo
            </Command.Item>
            <Command.Item
              className="cursor-pointer rounded-lg px-3 py-2 text-sm aria-selected:bg-white/10"
              onSelect={() => {
                router.push("/dashboard");
                setOpen(false);
              }}
            >
              Go to Projects
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}
