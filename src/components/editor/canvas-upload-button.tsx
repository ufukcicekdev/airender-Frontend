"use client";

import { useRef } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPaletteNode } from "@/lib/create-palette-node";
import { useAssetUpload } from "@/hooks/use-asset-upload";
import { useEditorStore } from "@/store/editor-store";

export function CanvasUploadButton() {
  const inputRef = useRef<HTMLInputElement>(null);
  const addNode = useEditorStore((s) => s.addNode);
  const setSelectedNode = useEditorStore((s) => s.setSelectedNode);
  const nodeCount = useEditorStore((s) => s.nodes.length);
  const { uploadFile, uploading } = useAssetUpload();

  const onPick = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    const result = await uploadFile(file);
    if (!result) return;
    const node = createPaletteNode("source", "Source", nodeCount);
    node.position = { x: 120 + nodeCount * 24, y: 120 + nodeCount * 24 };
    node.data = {
      ...node.data,
      imageUrl: result.imageUrl,
      thumbnailUrl: result.thumbnailUrl,
    };
    addNode(node);
    setSelectedNode(node.id);
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          onPick(e.target.files);
          e.target.value = "";
        }}
      />
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-7 gap-1.5 border-border/60 text-xs"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="h-3.5 w-3.5" />
        {uploading ? "Uploading…" : "Upload"}
      </Button>
    </>
  );
}
