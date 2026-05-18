"use client";

import { EngineSelect } from "@/components/catalog/engine-select";
import { PanelSettingRow } from "@/components/catalog/panel-setting-row";
import {
  UPSCALE_MAX_OUTPUT_OPTIONS,
  UPSCALE_SCALE_OPTIONS,
  type UpscaleMaxOutput,
  type UpscaleScale,
} from "@/lib/upscale-settings";
import { useUIStore } from "@/store/ui-store";
import type { CatalogModel } from "@/types";

interface UpscaleControlsProps {
  models: CatalogModel[];
  selectedSlug?: string | null;
  onSelectModel: (model: CatalogModel) => void;
}

export function UpscaleControls({
  models,
  selectedSlug,
  onSelectModel,
}: UpscaleControlsProps) {
  const scale = useUIStore((s) => s.upscaleScale);
  const maxOutput = useUIStore((s) => s.upscaleMaxOutput);
  const setScale = useUIStore((s) => s.setUpscaleScale);
  const setMaxOutput = useUIStore((s) => s.setUpscaleMaxOutput);

  const selected = models.find((m) => m.slug === selectedSlug);

  return (
    <div className="border-b border-border/60">
      <EngineSelect models={models} selectedSlug={selectedSlug} onSelect={onSelectModel} />
      {selected ? (
        <p className="px-4 pb-2 text-sm leading-snug text-muted-foreground">
          <span className="font-medium text-[hsl(var(--viz-cyan))]">
            {selected.credit_cost} credits
          </span>
          {" · "}
          {selected.provider || "local"}
        </p>
      ) : null}
      <PanelSettingRow
        label="Upscale"
        value={scale}
        onValueChange={(v) => setScale(v as UpscaleScale)}
        options={[...UPSCALE_SCALE_OPTIONS]}
        hint="How much larger the output is vs. the source (e.g. 4× doubles width and height)."
      />
      <PanelSettingRow
        label="Max output"
        value={maxOutput}
        onValueChange={(v) => setMaxOutput(v as UpscaleMaxOutput)}
        options={[...UPSCALE_MAX_OUTPUT_OPTIONS]}
        hint="Optional cap on longest edge after upscaling."
      />
    </div>
  );
}
