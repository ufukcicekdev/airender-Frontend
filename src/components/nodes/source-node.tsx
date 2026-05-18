"use client";

import type { NodeProps } from "@xyflow/react";
import { useRef } from "react";
import { Upload } from "lucide-react";
import { VizNodeCard } from "./viz-node-card";
import { useEditorStore } from "@/store/editor-store";
import { useAssetUpload } from "@/hooks/use-asset-upload";
import { cn } from "@/lib/utils";
import type { NodeData } from "@/types";

export function SourceNode(props: NodeProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const updateNodeData = useEditorStore((s) => s.updateNodeData);
  const { uploadFile, uploading } = useAssetUpload();
  const data = props.data as NodeData;
  const hasImage = Boolean(data.imageUrl);

  const handleFile = async (file: File) => {
    updateNodeData(props.id, { status: "processing" });
    const result = await uploadFile(file);
    if (result) {
      updateNodeData(props.id, {
        imageUrl: result.imageUrl,
        thumbnailUrl: result.thumbnailUrl,
        status: "idle",
        error: undefined,
      });
    } else {
      updateNodeData(props.id, { status: "error", error: "Upload failed" });
    }
  };

  return (
    <div
      className="relative"
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const f = e.dataTransfer.files[0];
        if (f?.type.startsWith("image/")) handleFile(f);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <VizNodeCard
        data={data}
        selected={props.selected}
        inputs={0}
        outputs={1}
        subtitle="Source"
        variant="source"
      />
      <div
        className={cn(
          "nodrag nopan pointer-events-auto absolute bottom-10 left-1/2 z-10 -translate-x-1/2",
          "flex items-center gap-1 rounded-md border border-[hsl(var(--viz-cyan)/0.4)]",
          "bg-black/70 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm",
          uploading && "opacity-80"
        )}
      >
        <button
          type="button"
          className="flex items-center gap-1 hover:text-[hsl(var(--viz-cyan))]"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="h-3 w-3" />
          {uploading ? "…" : hasImage ? "Replace" : "Upload"}
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
