"use client";

import { useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Loader2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { normalizeMediaUrl } from "@/lib/media-url";
import { useAssetUpload } from "@/hooks/use-asset-upload";
import { useEditorStore } from "@/store/editor-store";
import { assetService } from "@/services/asset.service";
import { Button } from "@/components/ui/button";

interface SourceUploadPanelProps {
  nodeId: string;
}

export function SourceUploadPanel({ nodeId }: SourceUploadPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const updateNodeData = useEditorStore((s) => s.updateNodeData);
  const node = useEditorStore((s) => s.nodes.find((n) => n.id === nodeId));
  const { uploadFile, uploading } = useAssetUpload();
  const queryClient = useQueryClient();

  const { data: gallery = [], isLoading } = useQuery({
    queryKey: ["asset-gallery"],
    queryFn: async () => {
      const { data } = await assetService.gallery();
      return data;
    },
  });

  const applyImage = (imageUrl: string, thumbnailUrl?: string) => {
    updateNodeData(nodeId, {
      imageUrl,
      thumbnailUrl,
      status: "idle",
      error: undefined,
    });
  };

  const handleFiles = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    const result = await uploadFile(file);
    if (result) {
      applyImage(result.imageUrl, result.thumbnailUrl);
      queryClient.invalidateQueries({ queryKey: ["asset-gallery"] });
    }
  };

  const preview = normalizeMediaUrl(node?.data?.imageUrl as string | undefined);

  return (
    <details open className="group border-b border-border/60">
      <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2.5 text-xs font-medium text-foreground/90">
        Source image
        <Upload className="h-3.5 w-3.5 text-muted-foreground" />
      </summary>
      <div className="space-y-3 px-3 pb-3">
        <div
          className={cn(
            "relative overflow-hidden rounded-lg border border-dashed border-border/60 bg-[hsl(220,16%,10%)]",
            uploading && "opacity-70"
          )}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Source" className="aspect-video w-full object-cover" />
          ) : (
            <div className="flex aspect-video flex-col items-center justify-center gap-2 p-4 text-center">
              <ImagePlus className="h-8 w-8 text-muted-foreground" />
              <p className="text-[10px] text-muted-foreground">No image yet</p>
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--viz-cyan))]" />
            </div>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <Button
          type="button"
          size="sm"
          className="w-full gap-2 bg-[hsl(var(--viz-cyan))] text-[hsl(220,25%,6%)] hover:opacity-90"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="h-3.5 w-3.5" />
          {uploading ? "Uploading…" : "Upload image"}
        </Button>
        <p className="text-[10px] leading-relaxed text-muted-foreground">
          Or drag an image onto the canvas or directly onto a Source node.
        </p>

        <div>
          <p className="mb-2 text-[10px] font-medium text-muted-foreground">Your uploads</p>
          {isLoading ? (
            <p className="text-[10px] text-muted-foreground">Loading gallery…</p>
          ) : gallery.length === 0 ? (
            <p className="text-[10px] text-muted-foreground">No uploads yet.</p>
          ) : (
            <div className="grid grid-cols-3 gap-1.5">
              {gallery.map((asset) => {
                const thumb = normalizeMediaUrl(asset.thumbnail_url || asset.file_url);
                return (
                  <button
                    key={asset.id}
                    type="button"
                    title={asset.name}
                    onClick={() =>
                      applyImage(
                        normalizeMediaUrl(asset.file_url) ?? asset.file_url,
                        normalizeMediaUrl(asset.thumbnail_url) ?? undefined
                      )
                    }
                    className="overflow-hidden rounded border border-border/50 hover:border-[hsl(var(--viz-cyan)/0.5)]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={thumb} alt="" className="aspect-square w-full object-cover" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </details>
  );
}
