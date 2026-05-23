"use client";

import { useCallback, useState } from "react";
import { assetService } from "@/services/asset.service";
import { useToast } from "@/hooks/use-toast";
import type { Asset } from "@/types";

export function useAssetUpload() {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const uploadFile = useCallback(
    async (file: File): Promise<{ imageUrl: string; thumbnailUrl?: string; asset: Asset } | null> => {
      if (!file.type.startsWith("image/")) {
        toast({ title: "Invalid file", description: "Please choose an image.", variant: "destructive" });
        return null;
      }
      setUploading(true);
      try {
        const { data: asset } = await assetService.upload(file);
        // Keep full HTTPS URL on the node so Fal/backend can fetch it (not /media proxy path).
        const imageUrl = asset.file_url;
        const thumbnailUrl = asset.thumbnail_url ?? undefined;
        return { imageUrl, thumbnailUrl, asset };
      } catch {
        toast({ title: "Upload failed", description: "Could not upload image.", variant: "destructive" });
        return null;
      } finally {
        setUploading(false);
      }
    },
    [toast]
  );

  return { uploadFile, uploading };
}
