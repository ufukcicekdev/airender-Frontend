export type ImageEditPriority = "standard" | "priority" | "turbo";
export type ImageEditResolution = "1k" | "2k" | "4k";
export type ImageEditAspectRatio =
  | "original"
  | "1:1"
  | "3:2"
  | "2:3"
  | "3:4"
  | "4:3"
  | "4:5"
  | "5:4"
  | "9:16"
  | "16:9";

export const IMAGE_EDIT_PRIORITY_OPTIONS: {
  value: ImageEditPriority;
  label: string;
}[] = [
  { value: "standard", label: "Standard" },
  { value: "priority", label: "Priority" },
  { value: "turbo", label: "Turbo" },
];

export const IMAGE_EDIT_RESOLUTION_OPTIONS: {
  value: ImageEditResolution;
  label: string;
}[] = [
  { value: "1k", label: "1K" },
  { value: "2k", label: "2K" },
  { value: "4k", label: "4K" },
];

export const IMAGE_EDIT_ASPECT_RATIO_OPTIONS: {
  value: ImageEditAspectRatio;
  label: string;
}[] = [
  { value: "original", label: "Original" },
  { value: "1:1", label: "1:1" },
  { value: "3:2", label: "3:2" },
  { value: "2:3", label: "2:3" },
  { value: "3:4", label: "3:4" },
  { value: "4:3", label: "4:3" },
  { value: "4:5", label: "4:5" },
  { value: "5:4", label: "5:4" },
  { value: "9:16", label: "9:16" },
  { value: "16:9", label: "16:9" },
];

export function getModelBadges(config?: Record<string, unknown>): string[] {
  const badges = config?.badges;
  if (!Array.isArray(badges)) return [];
  return badges.filter((b): b is string => typeof b === "string");
}

export function imageEditSettingsPayload(
  priority: ImageEditPriority,
  resolution: ImageEditResolution,
  aspectRatio: ImageEditAspectRatio
) {
  return {
    priority,
    resolution,
    aspect_ratio: aspectRatio === "original" ? "original" : aspectRatio,
  };
}
