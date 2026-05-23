"use client";

import Link from "next/link";
import { useEffect } from "react";
import { LogOut, Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#workflow", label: "Workflow" },
];

export function LandingHeader() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated, isLoading, fetchUser, logout } = useAuthStore();

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    router.push("/login");
  };

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--viz-cyan))] text-sm font-bold text-[hsl(220,25%,6%)]">
            V
          </span>
          <span className="text-lg font-semibold tracking-tight">Vizmake</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {!isLoading && isAuthenticated ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  Projects
                </Button>
              </Link>
              <Link href="/account">
                <Button variant="ghost" size="sm">
                  Account
                </Button>
              </Link>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => void handleLogout()}
              >
                <LogOut className="h-3.5 w-3.5" />
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Get started</Button>
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-muted-foreground hover:bg-white/5 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div
        className={cn(
          "border-t border-border/40 bg-background/95 px-4 pb-4 md:hidden",
          open ? "block" : "hidden"
        )}
      >
        {NAV.map((item) => (
          <a
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className="block py-2.5 text-sm text-muted-foreground hover:text-foreground"
          >
            {item.label}
          </a>
        ))}
        <div className="mt-3 flex flex-col gap-2 border-t border-border/40 pt-3">
          {!isLoading && isAuthenticated ? (
            <>
              <Link href="/dashboard" onClick={() => setOpen(false)}>
                <Button variant="outline" className="w-full">
                  Projects
                </Button>
              </Link>
              <Link href="/account" onClick={() => setOpen(false)}>
                <Button variant="outline" className="w-full">
                  Account
                </Button>
              </Link>
              <Button
                type="button"
                variant="ghost"
                className="w-full gap-2"
                onClick={() => void handleLogout()}
              >
                <LogOut className="h-4 w-4" />
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setOpen(false)}>
                <Button variant="outline" className="w-full">
                  Log in
                </Button>
              </Link>
              <Link href="/signup" onClick={() => setOpen(false)}>
                <Button className="w-full">Get started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
