"use client";

import { cn } from "@/lib/utils";
import { ModelBrandIcon } from "@/components/catalog/model-brand-icon";
import { ModelTagBadge } from "@/components/catalog/model-tag-badge";
import type { CatalogModel } from "@/types";

interface ModelPickerProps {
  models: CatalogModel[];
  selectedSlug?: string | null;
  onSelect: (model: CatalogModel) => void;
  className?: string;
}

export function ModelPicker({
  models,
  selectedSlug,
  onSelect,
  className,
}: ModelPickerProps) {
  if (!models.length) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        No models in this capability.
      </p>
    );
  }

  return (
    <div className={cn("grid grid-cols-2 gap-2", className)}>
      {models.map((model) => {
        const active = selectedSlug === model.slug;
        return (
          <button
            key={model.id}
            type="button"
            onClick={() => onSelect(model)}
            className={cn(
              "relative flex min-h-[108px] flex-col items-center justify-center gap-2.5 rounded-lg border p-3 text-center transition-colors",
              active
                ? "border-[hsl(var(--viz-cyan)/0.6)] bg-[hsl(var(--viz-cyan)/0.1)]"
                : "border-border/40 bg-[hsl(220,16%,11%)] hover:border-[hsl(var(--viz-cyan)/0.35)]"
            )}
          >
            {model.tag ? (
              <ModelTagBadge
                tag={model.tag}
                className="absolute right-1.5 top-1.5"
                size="sm"
              />
            ) : null}
            <ModelBrandIcon
              brand={model.brand_icon}
              name={model.name}
              className="h-12 w-12 text-xl [&_svg]:h-7 [&_svg]:w-7"
            />
            <span
              className={cn(
                "line-clamp-2 w-full text-sm font-medium leading-snug",
                active ? "text-foreground" : "text-foreground/80"
              )}
            >
              {model.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
