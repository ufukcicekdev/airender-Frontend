export type ModelTag = "free" | "pro" | "new" | "beta" | "";

export const MODEL_TAG_LABELS: Record<Exclude<ModelTag, "">, string> = {
  free: "Free",
  pro: "Pro",
  new: "New",
  beta: "Beta",
};

export function normalizeModelTag(tag?: string | null): ModelTag {
  if (tag === "free" || tag === "pro" || tag === "new" || tag === "beta") return tag;
  return "";
}

export function modelTagLabel(tag?: string | null): string | null {
  const t = normalizeModelTag(tag);
  return t ? MODEL_TAG_LABELS[t] : null;
}
