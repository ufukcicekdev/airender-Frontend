"use client";

import { EngineSelect } from "@/components/catalog/engine-select";
import type { CatalogModel } from "@/types";

interface ModelEnginePanelProps {
  models: CatalogModel[];
  selectedSlug?: string | null;
  onSelectModel: (model: CatalogModel) => void;
}

/** Shared engine dropdown + credit line for capability panels. */
export function ModelEnginePanel({
  models,
  selectedSlug,
  onSelectModel,
}: ModelEnginePanelProps) {
  const selected = models.find((m) => m.slug === selectedSlug);

  return (
    <div className="border-b border-border/60">
      <EngineSelect models={models} selectedSlug={selectedSlug} onSelect={onSelectModel} />
      {selected ? (
        <p className="px-4 pb-2 text-sm leading-snug text-muted-foreground">
          <span className="text-[hsl(var(--viz-cyan))]">{selected.credit_cost} credits</span>
          {" · "}
          {selected.provider || "local"}
        </p>
      ) : null}
    </div>
  );
}
