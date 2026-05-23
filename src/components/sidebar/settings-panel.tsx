"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  FolderOpen,
  Keyboard,
  LogOut,
  User,
} from "lucide-react";
import { SidebarPanelShell } from "@/components/sidebar/sidebar-panel-shell";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { useUIStore } from "@/store/ui-store";

const SHORTCUTS = [
  { keys: "⌘ S", action: "Save workflow" },
  { keys: "⌘ Enter", action: "Make / run generation" },
  { keys: "⌘ Z", action: "Undo" },
  { keys: "⌘ ⇧ Z", action: "Redo" },
  { keys: "⌘ D", action: "Duplicate selection" },
  { keys: "⌘ G", action: "Group selection" },
  { keys: "⌘ ⇧ G", action: "Ungroup" },
  { keys: "⌘ K", action: "Command palette" },
  { keys: "Delete", action: "Delete selection" },
];

interface SettingsPanelProps {
  onClose?: () => void;
  className?: string;
}

export function SettingsPanel({ onClose, className }: SettingsPanelProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const setSidebarSection = useUIStore((s) => s.setSidebarSection);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <SidebarPanelShell
      title="Settings"
      subtitle={user?.email}
      onClose={onClose}
      className={className}
    >
      <section className="mb-8">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <Keyboard className="h-4 w-4" />
          Keyboard shortcuts
        </h3>
        <ul className="rounded-xl border border-border/60 bg-card/30 divide-y divide-border/40">
          {SHORTCUTS.map((row) => (
            <li
              key={row.keys}
              className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm"
            >
              <span className="text-muted-foreground">{row.action}</span>
              <kbd className="rounded bg-white/10 px-2 py-0.5 font-mono text-xs">
                {row.keys}
              </kbd>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Account
        </h3>
        <button
          type="button"
          onClick={() => setSidebarSection("account")}
          className="flex w-full items-center gap-3 rounded-xl border border-border/60 bg-card/30 p-4 text-left transition-colors hover:border-[hsl(var(--viz-cyan)/0.4)]"
        >
          <CreditCard className="h-5 w-5 text-[hsl(var(--viz-cyan))]" />
          <div>
            <p className="font-medium">Credits & billing</p>
            <p className="text-sm text-muted-foreground">
              Balance: {user?.credits?.toLocaleString() ?? 0} credits
            </p>
          </div>
        </button>
        <Link
          href="/dashboard"
          className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/30 p-4 transition-colors hover:border-[hsl(var(--viz-cyan)/0.4)]"
        >
          <FolderOpen className="h-5 w-5 text-[hsl(var(--viz-cyan))]" />
          <div>
            <p className="font-medium">All projects</p>
            <p className="text-sm text-muted-foreground">Open project dashboard</p>
          </div>
        </Link>
        <Link
          href="/account"
          className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/30 p-4 transition-colors hover:border-[hsl(var(--viz-cyan)/0.4)]"
        >
          <User className="h-5 w-5 text-[hsl(var(--viz-cyan))]" />
          <div>
            <p className="font-medium">Full account page</p>
            <p className="text-sm text-muted-foreground">Billing in a dedicated view</p>
          </div>
        </Link>
      </section>

      <div className="mt-8 border-t border-border/40 pt-6">
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={() => void handleLogout()}
        >
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
      </div>
    </SidebarPanelShell>
  );
}
