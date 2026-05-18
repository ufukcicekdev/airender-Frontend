"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

function EngineOption({ model, active }: { model: CatalogModel; active?: boolean }) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      {active ? (
        <span className="h-6 w-0.5 shrink-0 rounded-full bg-[hsl(var(--viz-cyan))]" />
      ) : (
        <span className="w-0.5 shrink-0" />
      )}
      <ModelBrandIcon
        brand={model.brand_icon}
        name={model.name}
        className="h-12 w-12 text-xl [&_svg]:h-7 [&_svg]:w-7"
      />
      <div className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-foreground">
          {model.name}
        </span>
        <ModelCapabilityBadges config={model.config} className="mt-1.5" size="sm" />
      </div>
    </div>
  );
}

export function EngineSelect({
  models,
  selectedSlug,
  onSelect,
  className,
}: EngineSelectProps) {
  const selected = models.find((m) => m.slug === selectedSlug) ?? models[0];

  if (!models.length) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">No engines available.</p>
    );
  }

  return (
    <div className={cn("px-4 pb-3", className)}>
      <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Engine
      </p>
      <Select
        value={selected?.slug ?? models[0].slug}
        onValueChange={(slug) => {
          const model = models.find((m) => m.slug === slug);
          if (model) onSelect(model);
        }}
      >
        <SelectTrigger className="h-auto min-h-[64px] border-border/50 bg-[hsl(220,16%,11%)] px-3 py-3">
          <SelectValue asChild>
            {selected ? (
              <EngineOption model={selected} active />
            ) : (
              <span className="text-sm text-muted-foreground">Select engine</span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-[min(360px,60vh)] border-border/60 bg-[hsl(220,16%,10%)] text-sm">
          {models.map((model) => (
            <SelectItem
              key={model.id}
              value={model.slug}
              className="cursor-pointer py-3.5 pl-2 pr-3 focus:bg-[hsl(var(--viz-cyan)/0.08)]"
            >
              <EngineOption model={model} active={model.slug === selected?.slug} />
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
