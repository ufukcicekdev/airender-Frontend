"use client";

import {
  Clock,
  LayoutGrid,
  PanelRight,
  Settings,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore, type SidebarSection } from "@/store/ui-store";

const items: {
  id: SidebarSection | "panel";
  icon: typeof LayoutGrid;
  label: string;
}[] = [
  { id: "editor", icon: LayoutGrid, label: "Canvas" },
  { id: "panel", icon: PanelRight, label: "Panel" },
  { id: "history", icon: Clock, label: "History" },
  { id: "account", icon: Users, label: "Account" },
  { id: "settings", icon: Settings, label: "Settings" },
];

export function EditorMobileNav() {
  const sidebarSection = useUIStore((s) => s.sidebarSection);
  const mobileRightPanelOpen = useUIStore((s) => s.mobileRightPanelOpen);
  const setSidebarSection = useUIStore((s) => s.setSidebarSection);
  const setMobileRightPanelOpen = useUIStore((s) => s.setMobileRightPanelOpen);

  const activeId =
    sidebarSection !== "editor" ? sidebarSection : undefined;

  const handleTap = (id: SidebarSection | "panel") => {
    if (id === "panel") {
      setSidebarSection("editor");
      setMobileRightPanelOpen(true);
      return;
    }
    setMobileRightPanelOpen(false);
    setSidebarSection(id);
  };

  return (
    <nav
      className={cn(
        "relative z-[60] flex shrink-0 items-stretch justify-around border-t border-border/60",
        "bg-[hsl(220,20%,7%)] pb-[env(safe-area-inset-bottom)] lg:hidden"
      )}
      aria-label="Editor navigation"
    >
      {items.map(({ id, icon: Icon, label }) => {
        const isPanel = id === "panel";
        const isActive = isPanel
          ? sidebarSection === "editor" && mobileRightPanelOpen
          : activeId === id;

        return (
          <button
            key={id}
            type="button"
            onClick={() => handleTap(id)}
            className={cn(
              "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
              isActive
                ? "text-[hsl(var(--viz-cyan))]"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-5 w-5" strokeWidth={1.75} />
            <span className="truncate px-1">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
