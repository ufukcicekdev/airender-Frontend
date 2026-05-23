"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  CreditCard,
  FolderOpen,
  Home,
  LogOut,
  Menu,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCredits } from "@/lib/utils";
import { APP_NAME } from "@/lib/brand";
import { SHOW_CREDITS_UI } from "@/lib/feature-flags";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

const NAV = [
  { href: "/", label: "Home", icon: Home, match: (p: string) => p === "/" },
  {
    href: "/dashboard",
    label: "Projects",
    icon: FolderOpen,
    match: (p: string) => p.startsWith("/dashboard"),
  },
  ...(SHOW_CREDITS_UI
    ? [
        {
          href: "/account",
          label: "Account",
          icon: CreditCard,
          match: (p: string) => p.startsWith("/account"),
        },
      ]
    : []),
] as const;

type AppShellProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
};

export function AppShell({ children, title, subtitle, actions }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    setMobileOpen(false);
    await logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[hsl(220,20%,6%)]">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-[hsl(220,20%,6%)]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--viz-cyan))] text-sm font-bold text-[hsl(220,25%,6%)]">
              F
            </span>
            <span className="hidden font-semibold tracking-tight sm:inline">{APP_NAME}</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => {
              const active = item.match(pathname);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-[hsl(var(--viz-cyan)/0.12)] text-[hsl(var(--viz-cyan))]"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {SHOW_CREDITS_UI && user != null && (
              <div className="flex items-center gap-1.5 rounded-full border border-border/50 bg-white/5 px-3 py-1 text-xs text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>{formatCredits(user.credits ?? 0)} credits</span>
              </div>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground"
              onClick={() => void handleLogout()}
            >
              <LogOut className="h-4 w-4" />
              Log out
            </Button>
          </div>

          <button
            type="button"
            className="rounded-lg p-2 text-muted-foreground hover:bg-white/5 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-border/50 px-4 pb-4 md:hidden">
            <nav className="flex flex-col gap-0.5 pt-2">
              {NAV.map((item) => {
                const active = item.match(pathname);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium",
                      active
                        ? "bg-[hsl(var(--viz-cyan)/0.12)] text-[hsl(var(--viz-cyan))]"
                        : "text-muted-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            {user != null && (
              <p className="mt-3 px-3 text-xs text-muted-foreground">
                {user.username}
                {SHOW_CREDITS_UI ? ` · ${formatCredits(user.credits ?? 0)} credits` : ""}
              </p>
            )}
            <Button
              type="button"
              variant="outline"
              className="mt-3 w-full gap-2"
              onClick={() => void handleLogout()}
            >
              <LogOut className="h-4 w-4" />
              Log out
            </Button>
          </div>
        )}
      </header>

      {(title || actions) && (
        <div className="border-b border-border/40 bg-[hsl(220,18%,8%)]">
          <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-4 px-4 py-6 sm:px-6">
            <div>
              {title && <h1 className="text-2xl font-bold tracking-tight">{title}</h1>}
              {subtitle && (
                <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
          </div>
        </div>
      )}

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>

      <footer className="border-t border-border/40 py-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 text-xs text-muted-foreground sm:px-6">
          <span>© {APP_NAME}</span>
          <div className="flex flex-wrap gap-4">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <Link href="/dashboard" className="hover:text-foreground">
              Projects
            </Link>
            {SHOW_CREDITS_UI ? (
              <Link href="/account" className="hover:text-foreground">
                Account
              </Link>
            ) : null}
          </div>
        </div>
      </footer>
    </div>
  );
}
