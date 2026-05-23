"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_EXPORT_PREFIX } from "@/lib/brand";
import {
  defaultDownloadFilename,
  downloadMedia,
  isDownloadableMediaUrl,
  type MediaKind,
} from "@/lib/download-media";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type DownloadMediaButtonProps = {
  url: string | null | undefined;
  kind?: MediaKind;
  filename?: string;
  label?: string;
  className?: string;
  size?: "sm" | "icon";
  variant?: "outline" | "ghost" | "secondary";
};

export function DownloadMediaButton({
  url,
  kind = "image",
  filename,
  label = "Download",
  className,
  size = "sm",
  variant = "outline",
}: DownloadMediaButtonProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  if (!isDownloadableMediaUrl(url)) return null;

  const handleClick = async () => {
    setLoading(true);
    try {
      const name =
        filename ?? defaultDownloadFilename(APP_EXPORT_PREFIX, kind, undefined, url);
      await downloadMedia(url, { filename: name, kind });
      toast({ title: "Download started", description: name });
    } catch {
      toast({
        title: "Download failed",
        description: "Try right-clicking the image and saving it.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (size === "icon") {
    return (
      <Button
        type="button"
        size="icon"
        variant={variant}
        className={cn("h-8 w-8", className)}
        disabled={loading}
        onClick={() => void handleClick()}
        title={label}
        aria-label={label}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
      </Button>
    );
  }

  return (
    <Button
      type="button"
      size="sm"
      variant={variant}
      className={cn("gap-1.5", className)}
      disabled={loading}
      onClick={() => void handleClick()}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Download className="h-3.5 w-3.5" />
      )}
      {label}
    </Button>
  );
}
