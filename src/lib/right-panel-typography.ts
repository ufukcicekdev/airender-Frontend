/** Shared class fragments for the editor right sidebar (readable at a glance). */
export const RP = {
  sectionSummary:
    "flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold text-foreground",
  sectionChevron: "h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180",
  body: "text-sm leading-relaxed text-muted-foreground",
  bodyStrong: "font-medium text-foreground/90",
  meta: "text-sm text-muted-foreground",
  metaAccent: "text-sm font-medium text-[hsl(var(--viz-cyan))]",
  empty: "py-4 text-center text-sm text-muted-foreground",
  pad: "px-4",
} as const;
