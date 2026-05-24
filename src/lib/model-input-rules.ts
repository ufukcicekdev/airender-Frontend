import type { CatalogModel } from "@/types";

/** Categories that always need at least one source image on canvas. */
export const CATEGORIES_REQUIRING_SOURCE = new Set([
  "image-to-video",
  "upscale",
  "image-edit",
]);

export interface ModelInputRules {
  showPanel: boolean;
  requiresImages: boolean;
  min: number;
  max: number;
  unlimited: boolean;
  label: string;
  help: string;
  canAdd: (currentCount: number) => boolean;
  isValid: (currentCount: number) => boolean;
}

export function getModelInputRules(
  model?: CatalogModel | null,
  categorySlug?: string | null
): ModelInputRules {
  if (!model) {
    return {
      showPanel: false,
      requiresImages: false,
      min: 0,
      max: 0,
      unlimited: false,
      label: "Input images",
      help: "",
      canAdd: () => false,
      isValid: () => true,
    };
  }

  let min = model.min_input_images ?? 0;
  let max = model.max_input_images ?? 0;
  let requiresImages = model.requires_images ?? false;

  if (
    categorySlug &&
    CATEGORIES_REQUIRING_SOURCE.has(categorySlug) &&
    !requiresImages &&
    min < 1
  ) {
    requiresImages = true;
    min = 1;
  }

  if (requiresImages && min < 1) {
    min = 1;
  }

  const unlimited = max === 0;
  const showPanel = requiresImages || min > 0 || max > 0;
  const effectiveMin = requiresImages ? Math.max(min, 1) : min;

  return {
    showPanel,
    requiresImages,
    min,
    max,
    unlimited,
    label: model.input_images_label || "Input images",
    help:
      model.input_images_help ||
      (!requiresImages && (max > 0 || categorySlug === "3d-model" || categorySlug === "image-generate")
        ? "Optional — connect a Source for image-guided output, or use the prompt bar for text-only."
        : requiresImages && effectiveMin === 1
        ? "Upload a Source image on the canvas, then press Make."
        : unlimited
          ? "Add as many reference images as you need."
          : max === 1
            ? "Upload one image for this model."
            : `Add ${min > 0 ? `${min}–` : "up to "}${max} images.`),
    canAdd: (count) => unlimited || count < max,
    isValid: (count) => {
      if (requiresImages && count < 1) return false;
      if (count < min) return false;
      if (!unlimited && max > 0 && count > max) return false;
      return true;
    },
  };
}
