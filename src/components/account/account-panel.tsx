"use client";

import { PricingContent } from "@/components/billing/pricing-content";
import { SidebarPanelShell } from "@/components/sidebar/sidebar-panel-shell";
import { useAuthStore } from "@/store/auth-store";

interface AccountPanelProps {
  onClose?: () => void;
  className?: string;
}

export function AccountPanel({ onClose, className }: AccountPanelProps) {
  const user = useAuthStore((s) => s.user);

  return (
    <SidebarPanelShell
      title="Account & billing"
      subtitle={user?.email}
      onClose={onClose}
      className={className}
    >
        <div className="mb-8 rounded-xl border border-[hsl(var(--viz-cyan)/0.3)] bg-[hsl(var(--viz-cyan)/0.08)] p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[hsl(var(--viz-cyan))]">
                Account
              </p>
              <p className="mt-1 text-2xl font-bold">Pay as you go</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Trial credits on signup · buy more below when you run out (from $4.99 / 100
                credits). No subscription.
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

      <PricingContent interactive />
    </SidebarPanelShell>
  );
}
