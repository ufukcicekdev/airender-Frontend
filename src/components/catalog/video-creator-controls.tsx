"use client";

import { EngineSelect } from "@/components/catalog/engine-select";
import { PanelSettingRow } from "@/components/catalog/panel-setting-row";
import { cn } from "@/lib/utils";
import {
  VIDEO_ASPECT_RATIO_OPTIONS,
  VIDEO_DURATION_OPTIONS,
  VIDEO_RESOLUTION_OPTIONS,
  type VideoAspectRatio,
  type VideoDuration,
  type VideoResolution,
} from "@/lib/video-creator-settings";
import { useUIStore } from "@/store/ui-store";
import type { CatalogModel } from "@/types";
import { SHOW_CREDITS_UI } from "@/lib/feature-flags";

interface VideoCreatorControlsProps {
  models: CatalogModel[];
  selectedSlug?: string | null;
  onSelectModel: (model: CatalogModel) => void;
}

export function VideoCreatorControls({
  models,
  selectedSlug,
  onSelectModel,
}: VideoCreatorControlsProps) {
  const duration = useUIStore((s) => s.videoDuration);
  const resolution = useUIStore((s) => s.videoResolution);
  const aspectRatio = useUIStore((s) => s.videoAspectRatio);
  const generateAudio = useUIStore((s) => s.videoGenerateAudio);
  const setDuration = useUIStore((s) => s.setVideoDuration);
  const setResolution = useUIStore((s) => s.setVideoResolution);
  const setAspectRatio = useUIStore((s) => s.setVideoAspectRatio);
  const setGenerateAudio = useUIStore((s) => s.setVideoGenerateAudio);

  const selected = models.find((m) => m.slug === selectedSlug);

  return (
    <div className="border-b border-border/60">
      <EngineSelect models={models} selectedSlug={selectedSlug} onSelect={onSelectModel} />
      {selected ? (
        <p className="px-4 pb-2 text-sm leading-snug text-muted-foreground">
          {SHOW_CREDITS_UI ? (
            <>
              <span className="text-[hsl(var(--viz-cyan))]">{selected.credit_cost} credits</span>
              {" · "}
            </>
          ) : null}
          {selected.provider || "local"}
        </p>
      ) : null}
      <PanelSettingRow
        label="Video duration"
        value={duration}
        onValueChange={(v) => setDuration(v as VideoDuration)}
        options={[...VIDEO_DURATION_OPTIONS]}
      />
      <PanelSettingRow
        label="Aspect ratio"
        value={aspectRatio}
        onValueChange={(v) => setAspectRatio(v as VideoAspectRatio)}
        options={[...VIDEO_ASPECT_RATIO_OPTIONS]}
      />
      <PanelSettingRow
        label="Resolution"
        value={resolution}
        onValueChange={(v) => setResolution(v as VideoResolution)}
        options={[...VIDEO_RESOLUTION_OPTIONS]}
        hint="Target output resolution."
      />
      <label
        className={cn(
          "flex cursor-pointer items-center gap-3 border-b border-border/40 px-4 py-3",
          "text-sm font-medium text-foreground/85 hover:text-foreground"
        )}
      >
        <input
          type="checkbox"
          checked={generateAudio}
          onChange={(e) => setGenerateAudio(e.target.checked)}
          className="h-5 w-5 rounded border-border/60 bg-[hsl(220,16%,11%)] accent-[hsl(var(--viz-cyan))]"
        />
        Generate audio
      </label>
    </div>
  );
}
