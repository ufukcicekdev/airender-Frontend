export type UpscaleScale = "2" | "3" | "4" | "8";
export type UpscaleMaxOutput = "auto" | "2k" | "4k" | "8k";

export const UPSCALE_SCALE_OPTIONS: { value: UpscaleScale; label: string }[] = [
  { value: "2", label: "2×" },
  { value: "3", label: "3×" },
  { value: "4", label: "4×" },
  { value: "8", label: "8×" },
];

export const UPSCALE_MAX_OUTPUT_OPTIONS: {
  value: UpscaleMaxOutput;
  label: string;
}[] = [
  { value: "auto", label: "Auto (from scale)" },
  { value: "2k", label: "Cap at 2K" },
  { value: "4k", label: "Cap at 4K" },
  { value: "8k", label: "Cap at 8K" },
];

export function upscaleSettingsPayload(
  scale: UpscaleScale,
  maxOutput: UpscaleMaxOutput
) {
  return {
    upscale_scale: `${scale}x`,
    upscale_factor: Number(scale),
    max_output: maxOutput,
  };
}

export function parseUpscaleScale(value: unknown): UpscaleScale | null {
  const s = String(value ?? "").replace(/x$/i, "");
  if (s === "2" || s === "3" || s === "4" || s === "8") return s;
  return null;
}

export function parseUpscaleMaxOutput(value: unknown): UpscaleMaxOutput | null {
  const s = String(value ?? "").toLowerCase();
  if (s === "auto" || s === "2k" || s === "4k" || s === "8k") return s;
  return null;
}
