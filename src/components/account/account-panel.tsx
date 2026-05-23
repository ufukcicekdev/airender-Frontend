"use client";

import { SidebarPanelShell } from "@/components/sidebar/sidebar-panel-shell";
import { useAuthStore } from "@/store/auth-store";
import { SHOW_CREDITS_UI } from "@/lib/feature-flags";

// import { PricingContent } from "@/components/billing/pricing-content";

interface AccountPanelProps {
  onClose?: () => void;
  className?: string;
}

export function AccountPanel({ onClose, className }: AccountPanelProps) {
  const user = useAuthStore((s) => s.user);

  return (
    <SidebarPanelShell
      title={SHOW_CREDITS_UI ? "Account & billing" : "Account"}
      subtitle={user?.email}
      onClose={onClose}
      className={className}
    >
      {SHOW_CREDITS_UI ? (
        <>
          <div className="mb-8 rounded-xl border border-[hsl(var(--viz-cyan)/0.3)] bg-[hsl(var(--viz-cyan)/0.08)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[hsl(var(--viz-cyan))]">
                  Account
                </p>
                <p className="mt-1 text-2xl font-bold">Pay as you go</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Credits are added manually by our team. Contact us when you need a top-up.
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Available credits</p>
                <p className="text-xl font-semibold text-[hsl(var(--viz-cyan))]">
                  {user?.credits?.toLocaleString() ?? 0}
                </p>
              </div>
            </div>
          </div>
          {/* <PricingContent /> */}
        </>
      ) : (
        <div className="rounded-xl border border-border/60 bg-card/30 p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Signed in as
          </p>
          <p className="mt-2 text-lg font-semibold">{user?.username}</p>
          <p className="mt-1 text-sm text-muted-foreground">{user?.email}</p>
        </div>
      )}
    </SidebarPanelShell>
  );
}
