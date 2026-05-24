import type { CatalogModel } from "@/types";

export type Model3dTopology = "triangle" | "quad";
export type Model3dSymmetry = "auto" | "on" | "off";
export type Model3dPolycount = "low" | "medium" | "high" | "ultra";

export const MODEL3D_TOPOLOGY_OPTIONS = [
  { value: "triangle", label: "Triangle (detail)" },
  { value: "quad", label: "Quad (smooth)" },
] as const;

export const MODEL3D_SYMMETRY_OPTIONS = [
  { value: "auto", label: "Auto" },
  { value: "on", label: "On" },
  { value: "off", label: "Off" },
] as const;

export const MODEL3D_POLYCOUNT_OPTIONS = [
  { value: "low", label: "Low (~10k)" },
  { value: "medium", label: "Medium (~30k)" },
  { value: "high", label: "High (~80k)" },
  { value: "ultra", label: "Ultra (~150k)" },
] as const;

const POLYCOUNT_VALUES: Record<Model3dPolycount, number> = {
  low: 10_000,
  medium: 30_000,
  high: 80_000,
  ultra: 150_000,
};

export function model3dTargetPolycount(preset: Model3dPolycount): number {
  return POLYCOUNT_VALUES[preset];
}

export function model3dSettingsPayload(
  topology: Model3dTopology,
  polycount: Model3dPolycount,
  symmetry: Model3dSymmetry,
  shouldRemesh: boolean,
  shouldTexture: boolean
) {
  return {
    topology,
    target_polycount: model3dTargetPolycount(polycount),
    symmetry_mode: symmetry,
    should_remesh: shouldRemesh,
    should_texture: shouldTexture,
  };
}

/** Short hint for 3D model input mode in the right panel. */
export function model3dInputHint(model?: CatalogModel | null): string {
  if (!model) return "";
  if (model.requires_images) {
    return "Photo required — image-to-3D only (upload Source, then Make)";
  }
  return "Text or photo — write a prompt below; Source is optional";
}

/** User-facing error when a photo-only 3D model has no image. */
export function model3dMissingImageMessage(model?: CatalogModel | null): {
  title: string;
  description: string;
} {
  if (model?.requires_images) {
    return {
      title: `${model.name} needs a photo`,
      description:
        "This model is image-to-3D only. Upload a Source image on the canvas, then Make. For text-only 3D, switch to Meshy Lite or Meshy AI.",
    };
  }
  return {
    title: "Source image required",
    description: "This model needs at least one Source image on the canvas.",
  };
}

/** Models that support prompt-only 3D (no Source required). */
export const TEXT_TO_3D_MODEL_SLUGS = ["meshy-lite-3d", "meshy-3d", "tripo3d"] as const;
