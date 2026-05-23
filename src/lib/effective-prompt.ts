import type { CatalogModel } from "@/types";

/** Prompt for Make — uses bar text or model default (placeholder is not enough). */
export function effectiveMakePrompt(
  bottomPrompt: string,
  model?: CatalogModel | null
): string {
  return bottomPrompt.trim() || model?.default_positive?.trim() || "";
}
