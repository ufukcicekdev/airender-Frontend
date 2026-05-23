"use client";

import { CustomSelect } from "@/components/ui/custom-select";
import { ModelBrandIcon } from "@/components/catalog/model-brand-icon";
import { ModelCapabilityBadges } from "@/components/catalog/model-capability-badges";
import { cn } from "@/lib/utils";
import type { CatalogModel } from "@/types";

interface EngineSelectProps {
  models: CatalogModel[];
  selectedSlug?: string | null;
  onSelect: (model: CatalogModel) => void;
  className?: string;
}

/** Engine dropdown with brand icons (custom menu, not native select). */
export function EngineSelect({
  models,
  selectedSlug,
  onSelect,
  className,
}: EngineSelectProps) {
  if (!models.length) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">No engines available.</p>
    );
  }

  const resolvedSlug =
    models.find((m) => m.slug === selectedSlug)?.slug ?? models[0].slug;
  const selected = models.find((m) => m.slug === resolvedSlug) ?? models[0];

  return (
    <div className={cn("px-4 pb-3", className)}>
      <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Engine
      </p>
      <CustomSelect
        value={resolvedSlug}
        onValueChange={(slug) => {
          const model = models.find((m) => m.slug === slug);
          if (model && model.slug !== resolvedSlug) onSelect(model);
        }}
        options={models.map((m) => ({
          value: m.slug,
          label: m.name,
          icon: (
            <ModelBrandIcon
              brand={m.brand_icon}
              name={m.name}
              className="h-8 w-8 text-base [&_svg]:h-5 [&_svg]:w-5"
            />
          ),
        }))}
        size="panel"
        className="w-full"
        triggerClassName="min-h-10 py-2 border-border/50 bg-[hsl(220,16%,11%)] text-sm font-semibold leading-snug"
      />
      {selected ? (
        <ModelCapabilityBadges config={selected.config} className="mt-2" size="sm" />
      ) : null}
    </div>
  );
}
