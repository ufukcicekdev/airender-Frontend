"use client";

import { EngineSelect } from "@/components/catalog/engine-select";
import { PanelSettingRow } from "@/components/catalog/panel-setting-row";
import { cn } from "@/lib/utils";
import {
  MODEL3D_POLYCOUNT_OPTIONS,
  MODEL3D_SYMMETRY_OPTIONS,
  MODEL3D_TOPOLOGY_OPTIONS,
  model3dInputHint,
  type Model3dPolycount,
  type Model3dSymmetry,
  type Model3dTopology,
} from "@/lib/model-3d-settings";
import { useUIStore } from "@/store/ui-store";
import type { CatalogModel } from "@/types";
import { SHOW_CREDITS_UI } from "@/lib/feature-flags";

interface Model3dControlsProps {
  models: CatalogModel[];
  selectedSlug?: string | null;
  onSelectModel: (model: CatalogModel) => void;
}

export function Model3dControls({
  models,
  selectedSlug,
  onSelectModel,
}: Model3dControlsProps) {
  const topology = useUIStore((s) => s.model3dTopology);
  const polycount = useUIStore((s) => s.model3dPolycount);
  const symmetry = useUIStore((s) => s.model3dSymmetry);
  const shouldRemesh = useUIStore((s) => s.model3dShouldRemesh);
  const shouldTexture = useUIStore((s) => s.model3dShouldTexture);
  const setTopology = useUIStore((s) => s.setModel3dTopology);
  const setPolycount = useUIStore((s) => s.setModel3dPolycount);
  const setSymmetry = useUIStore((s) => s.setModel3dSymmetry);
  const setShouldRemesh = useUIStore((s) => s.setModel3dShouldRemesh);
  const setShouldTexture = useUIStore((s) => s.setModel3dShouldTexture);

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
          {" · "}
          {model3dInputHint(selected)}
        </p>
      ) : null}
      <PanelSettingRow
        label="Topology"
        value={topology}
        onValueChange={(v) => setTopology(v as Model3dTopology)}
        options={[...MODEL3D_TOPOLOGY_OPTIONS]}
      />
      <PanelSettingRow
        label="Polygon count"
        value={polycount}
        onValueChange={(v) => setPolycount(v as Model3dPolycount)}
        options={[...MODEL3D_POLYCOUNT_OPTIONS]}
        hint="Target mesh density (Fal Meshy / Tripo)."
      />
      <PanelSettingRow
        label="Symmetry"
        value={symmetry}
        onValueChange={(v) => setSymmetry(v as Model3dSymmetry)}
        options={[...MODEL3D_SYMMETRY_OPTIONS]}
      />
      <label
        className={cn(
          "flex cursor-pointer items-center gap-3 border-b border-border/40 px-4 py-3",
          "text-sm font-medium text-foreground/85 hover:text-foreground"
        )}
      >
        <input
          type="checkbox"
          checked={shouldRemesh}
          onChange={(e) => setShouldRemesh(e.target.checked)}
          className="h-5 w-5 rounded border-border/60 bg-[hsl(220,16%,11%)] accent-[hsl(var(--viz-cyan))]"
        />
        Remesh (clean topology)
      </label>
      <label
        className={cn(
          "flex cursor-pointer items-center gap-3 border-b border-border/40 px-4 py-3",
          "text-sm font-medium text-foreground/85 hover:text-foreground"
        )}
      >
        <input
          type="checkbox"
          checked={shouldTexture}
          onChange={(e) => setShouldTexture(e.target.checked)}
          className="h-5 w-5 rounded border-border/60 bg-[hsl(220,16%,11%)] accent-[hsl(var(--viz-cyan))]"
        />
        Generate textures
      </label>
    </div>
  );
}
