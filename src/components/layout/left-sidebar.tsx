"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Clock,
  HelpCircle,
  LayoutGrid,
  PlayCircle,
  Settings,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore, type SidebarSection } from "@/store/ui-store";

const topNav: { id: SidebarSection; icon: typeof LayoutGrid; label: string; href?: string }[] = [
  { id: "editor", icon: LayoutGrid, label: "Editor" },
  { id: "history", icon: Clock, label: "History" },
  { id: "account", icon: Users, label: "Account" },
  { id: "tutorial", icon: PlayCircle, label: "Tutorial" },
];

const bottomNav: { id: SidebarSection; icon: typeof Settings; label: string }[] = [
  { id: "support", icon: HelpCircle, label: "Support" },
  { id: "settings", icon: Settings, label: "Settings" },
];

export function LeftSidebar() {
  const { sidebarSection, setSidebarSection } = useUIStore();

  const NavBtn = ({
    id,
    icon: Icon,
    label,
  }: {
    id: SidebarSection;
    icon: typeof LayoutGrid;
    label: string;
  }) => (
    <button
      type="button"
      onClick={() => setSidebarSection(id)}
      title={label}
      className={cn(
        "group relative flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground transition-colors",
        sidebarSection === id
          ? "bg-white/5 text-[hsl(var(--viz-cyan))]"
          : "hover:bg-white/5 hover:text-foreground"
      )}
    >
      <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
      {sidebarSection === id && (
        <motion.div
          layoutId="nav-active"
          className="absolute left-0 top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-r-full bg-[hsl(var(--viz-cyan))]"
        />
      )}
    </button>
  );

  return (
    <aside className="hidden w-[52px] shrink-0 flex-col items-center border-r border-border/60 bg-[hsl(220,20%,7%)] py-3 lg:flex">
      <Link
        href="/dashboard"
        className="mb-5 flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--viz-cyan))] text-xs font-bold text-[hsl(220,25%,6%)]"
      >
        V
      </Link>

      <nav className="flex flex-col gap-1">
        {topNav.map((item) => (
          <NavBtn key={item.id} {...item} />
        ))}
      </nav>

      <nav className="mt-auto flex flex-col gap-1">
        {bottomNav.map((item) => (
          <NavBtn key={item.id} {...item} />
        ))}
      </nav>
    </aside>
  );
}
