"use client";

import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PricingContent } from "@/components/billing/pricing-content";
import { billingService } from "@/services/billing.service";
import { useAuthStore } from "@/store/auth-store";

interface AccountPanelProps {
  onClose?: () => void;
  className?: string;
}

export function AccountPanel({ onClose, className }: AccountPanelProps) {
  const user = useAuthStore((s) => s.user);

  const { data: subscription, isLoading: subLoading } = useQuery({
    queryKey: ["subscription"],
    queryFn: async () => {
      const { data } = await billingService.getSubscription();
      return data;
    },
  });

  return (
    <div
      className={cn(
        "flex h-full flex-col overflow-hidden bg-[hsl(220,18%,8%)]",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
        <div>
          <h2 className="text-lg font-semibold">Account & Billing</h2>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-white/5 hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-8 rounded-xl border border-[hsl(var(--viz-cyan)/0.3)] bg-[hsl(var(--viz-cyan)/0.08)] p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[hsl(var(--viz-cyan))]">
                Current plan
              </p>
              {subLoading ? (
                <p className="mt-1 text-muted-foreground">Loading…</p>
              ) : (
                <>
                  <p className="mt-1 text-2xl font-bold">{subscription?.plan.name ?? "—"}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {subscription?.plan.credits_monthly.toLocaleString()} credits / month ·{" "}
                    <span className="capitalize">{subscription?.billing_cycle}</span> billing
                  </p>
                </>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Available credits</p>
              <p className="text-xl font-semibold text-[hsl(var(--viz-cyan))]">
                {user?.credits?.toLocaleString() ?? 0}
              </p>
            </div>
          </div>
        </div>

        <PricingContent
          interactive
          currentPlanSlug={subscription?.plan.slug}
        />
      </div>
    </div>
  );
}
