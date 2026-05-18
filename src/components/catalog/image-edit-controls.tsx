"use client";

import { EngineSelect } from "@/components/catalog/engine-select";
import { PanelSettingRow } from "@/components/catalog/panel-setting-row";
import {
  IMAGE_EDIT_ASPECT_RATIO_OPTIONS,
  IMAGE_EDIT_PRIORITY_OPTIONS,
  IMAGE_EDIT_RESOLUTION_OPTIONS,
} from "@/lib/image-edit-settings";
import { useUIStore } from "@/store/ui-store";
import type { CatalogModel } from "@/types";

interface ImageEditControlsProps {
  models: CatalogModel[];
  selectedSlug?: string | null;
  onSelectModel: (model: CatalogModel) => void;
}

export function ImageEditControls({
  models,
  selectedSlug,
  onSelectModel,
}: ImageEditControlsProps) {
  const priority = useUIStore((s) => s.imageEditPriority);
  const resolution = useUIStore((s) => s.imageEditResolution);
  const aspectRatio = useUIStore((s) => s.imageEditAspectRatio);
  const setPriority = useUIStore((s) => s.setImageEditPriority);
  const setResolution = useUIStore((s) => s.setImageEditResolution);
  const setAspectRatio = useUIStore((s) => s.setImageEditAspectRatio);

  const selected = models.find((m) => m.slug === selectedSlug);

  return (
    <div className="border-b border-border/60">
      <EngineSelect models={models} selectedSlug={selectedSlug} onSelect={onSelectModel} />
      {selected ? (
        <p className="px-4 pb-2 text-sm leading-snug text-muted-foreground">
          <span className="text-[hsl(var(--viz-cyan))]">
            {selected.credit_cost} credits
          </span>
          {" · "}
          {selected.provider || "local"}
        </p>
      ) : null}
      <PanelSettingRow
        label="Priority"
        value={priority}
        onValueChange={(v) => setPriority(v as typeof priority)}
        options={IMAGE_EDIT_PRIORITY_OPTIONS}
      />
      <PanelSettingRow
        label="Resolution"
        value={resolution}
        onValueChange={(v) => setResolution(v as typeof resolution)}
        options={IMAGE_EDIT_RESOLUTION_OPTIONS}
        hint="Target output resolution."
      />
      <PanelSettingRow
        label="Aspect ratio"
        value={aspectRatio}
        onValueChange={(v) => setAspectRatio(v as typeof aspectRatio)}
        options={IMAGE_EDIT_ASPECT_RATIO_OPTIONS}
      />
    </div>
  );
}
