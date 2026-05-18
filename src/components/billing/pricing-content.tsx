"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Coins, Crown, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format-price";
import { billingService } from "@/services/billing.service";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { useToast } from "@/hooks/use-toast";
import type { CreditPack, Plan } from "@/types";

interface PricingContentProps {
  /** Show subscribe / purchase actions (account). If false, CTAs link to signup/login. */
  interactive?: boolean;
  currentPlanSlug?: string;
  className?: string;
}

export function PricingContent({
  interactive = false,
  currentPlanSlug,
  className,
}: PricingContentProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const fetchUser = useAuthStore((s) => s.fetchUser);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [loadingPlanSlug, setLoadingPlanSlug] = useState<string | null>(null);
  const [loadingPackSlug, setLoadingPackSlug] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["pricing"],
    queryFn: async () => {
      const { data: overview } = await billingService.getPricing();
      return overview;
    },
  });

  const settings = data?.settings;
  const plans = data?.plans ?? [];
  const creditPacks = data?.credit_packs ?? [];

  const cycleDescription =
    billingCycle === "monthly" ? settings?.monthly_description : settings?.yearly_description;

  const handleSelectPlan = async (plan: Plan) => {
    if (!interactive || plan.slug === currentPlanSlug) return;
    setLoadingPlanSlug(plan.slug);
    try {
      await billingService.subscribe(plan.slug, billingCycle);
      await queryClient.invalidateQueries({ queryKey: ["subscription"] });
      await fetchUser();
      toast({ title: "Plan updated", description: `You are now on ${plan.name}.` });
    } catch {
      toast({ title: "Could not change plan", variant: "destructive" });
    } finally {
      setLoadingPlanSlug(null);
    }
  };

  const handlePurchasePack = async (pack: CreditPack) => {
    if (!interactive) return;
    setLoadingPackSlug(pack.slug);
    try {
      const { data: result } = await billingService.purchaseCredits(pack.slug);
      await fetchUser();
      toast({
        title: "Credits added",
        description: `+${result.credits_added.toLocaleString()} credits. Balance: ${result.credits_balance.toLocaleString()}`,
      });
    } catch {
      toast({ title: "Purchase failed", variant: "destructive" });
    } finally {
      setLoadingPackSlug(null);
    }
  };

  if (isLoading) {
    return <p className={cn("text-center text-muted-foreground py-12", className)}>Loading pricing…</p>;
  }

  return (
    <div className={className}>
      {/* Subscription plans */}
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium uppercase tracking-wider text-[hsl(var(--viz-cyan))]">
          Subscriptions
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          {settings?.plans_section_title ?? "Subscription plans"}
        </h2>
        <p className="mt-4 text-muted-foreground">
          {settings?.plans_section_description}
        </p>
      </div>

      <div className="mb-4 mt-10 flex flex-col items-center gap-3">
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setBillingCycle("monthly")}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              billingCycle === "monthly"
                ? "bg-[hsl(var(--viz-cyan))] text-[hsl(220,25%,6%)]"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {settings?.monthly_toggle_label ?? "Monthly"}
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle("yearly")}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              billingCycle === "yearly"
                ? "bg-[hsl(var(--viz-cyan))] text-[hsl(220,25%,6%)]"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {settings?.yearly_toggle_label ?? "Yearly"}
            {settings?.yearly_discount_note && (
              <span className="ml-1 text-xs opacity-80">({settings.yearly_discount_note})</span>
            )}
          </button>
        </div>
        {cycleDescription && (
          <p className="max-w-xl text-center text-sm text-muted-foreground">{cycleDescription}</p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const price = billingCycle === "yearly" ? plan.price_yearly : plan.price_monthly;
          const billingNote =
            billingCycle === "yearly" ? plan.yearly_description : plan.monthly_description;
          const Icon = plan.slug === "studio" ? Crown : plan.slug === "pro" ? Zap : Sparkles;
          const isCurrent = interactive && plan.slug === currentPlanSlug;

          return (
            <div
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-2xl border p-6 transition-all",
                plan.is_popular && "border-[hsl(var(--viz-cyan)/0.5)] bg-[hsl(var(--viz-cyan)/0.04)] shadow-node",
                isCurrent && "ring-1 ring-[hsl(var(--viz-cyan)/0.4)]",
                !plan.is_popular && !isCurrent && "border-border/60 bg-card/40 hover:border-border"
              )}
            >
              {plan.is_popular && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-[hsl(var(--viz-cyan))] px-3 py-0.5 text-[10px] font-semibold text-[hsl(220,25%,6%)]">
                  Most popular
                </span>
              )}
              <div className="mb-4 flex items-center gap-2">
                <Icon className="h-5 w-5 text-[hsl(var(--viz-cyan))]" />
                <h3 className="text-lg font-semibold">{plan.name}</h3>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">{plan.description}</p>
              <p className="text-4xl font-bold">
                {formatPrice(price, plan.currency)}
                {parseFloat(price) > 0 && (
                  <span className="text-base font-normal text-muted-foreground">
                    /{billingCycle === "yearly" ? "yr" : "mo"}
                  </span>
                )}
              </p>
              {billingNote && (
                <p className="mt-2 text-xs leading-relaxed text-[hsl(var(--viz-cyan)/0.85)]">
                  {billingNote}
                </p>
              )}
              <p className="mt-3 mb-6 text-sm text-muted-foreground">
                {plan.credits_monthly.toLocaleString()} credits included / month
              </p>
              <ul className="mb-8 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--viz-cyan))]" />
                    {f}
                  </li>
                ))}
              </ul>
              {interactive ? (
                <button
                  type="button"
                  disabled={isCurrent || loadingPlanSlug === plan.slug}
                  onClick={() => handleSelectPlan(plan)}
                  className={cn(
                    "w-full rounded-lg py-2.5 text-sm font-semibold transition-opacity",
                    isCurrent
                      ? "cursor-default bg-white/10 text-muted-foreground"
                      : "bg-[hsl(var(--viz-cyan))] text-[hsl(220,25%,6%)] hover:opacity-90 disabled:opacity-50"
                  )}
                >
                  {isCurrent
                    ? "Current plan"
                    : loadingPlanSlug === plan.slug
                      ? "Updating…"
                      : "Select plan"}
                </button>
              ) : isAuthenticated ? (
                <Link href="/account">
                  <Button className="w-full" variant={plan.is_popular ? "default" : "outline"}>
                    Manage plan
                  </Button>
                </Link>
              ) : (
                <Link href="/signup">
                  <Button className="w-full" variant={plan.is_popular ? "default" : "outline"}>
                    {plan.slug === "free" ? "Start free" : `Get ${plan.name}`}
                  </Button>
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* Credit packs */}
      <div className="mt-24 border-t border-border/40 pt-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-wider text-[hsl(var(--viz-cyan))]">
            Top-up
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            {settings?.credits_section_title ?? "Buy credits"}
          </h2>
          <p className="mt-4 text-muted-foreground">{settings?.credits_section_description}</p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {creditPacks.map((pack) => (
            <div
              key={pack.id}
              className={cn(
                "relative flex flex-col rounded-2xl border p-6",
                pack.is_popular
                  ? "border-[hsl(var(--viz-cyan)/0.5)] bg-[hsl(var(--viz-cyan)/0.04)]"
                  : "border-border/60 bg-card/40"
              )}
            >
              {pack.is_popular && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-[hsl(var(--viz-cyan))] px-3 py-0.5 text-[10px] font-semibold text-[hsl(220,25%,6%)]">
                  Best value
                </span>
              )}
              <div className="mb-3 flex items-center gap-2">
                <Coins className="h-5 w-5 text-[hsl(var(--viz-cyan))]" />
                <h3 className="text-lg font-semibold">{pack.name}</h3>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">{pack.description}</p>
              <p className="text-3xl font-bold">{formatPrice(pack.price, pack.currency)}</p>
              <p className="mt-2 text-sm font-medium text-[hsl(var(--viz-cyan))]">
                {pack.total_credits.toLocaleString()} credits
                {pack.bonus_credits > 0 && (
                  <span className="text-muted-foreground">
                    {" "}
                    ({pack.credits.toLocaleString()} + {pack.bonus_credits.toLocaleString()} bonus)
                  </span>
                )}
              </p>
              {pack.features.length > 0 && (
                <ul className="mt-4 mb-6 flex-1 space-y-2">
                  {pack.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[hsl(var(--viz-cyan))]" />
                      {f}
                    </li>
                  ))}
                </ul>
              )}
              {interactive && isAuthenticated ? (
                <button
                  type="button"
                  disabled={loadingPackSlug === pack.slug}
                  onClick={() => handlePurchasePack(pack)}
                  className="mt-auto w-full rounded-lg bg-[hsl(var(--viz-cyan))] py-2.5 text-sm font-semibold text-[hsl(220,25%,6%)] hover:opacity-90 disabled:opacity-50"
                >
                  {loadingPackSlug === pack.slug ? "Processing…" : "Buy credits"}
                </button>
              ) : (
                <Link href={isAuthenticated ? "/account" : "/signup"} className="mt-auto">
                  <Button variant="outline" className="w-full">
                    {isAuthenticated ? "Buy in account" : "Sign up to buy"}
                  </Button>
                </Link>
              )}
            </div>
          ))}
        </div>

        {settings?.credits_footer_note && (
          <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-muted-foreground">
            {settings.credits_footer_note}
          </p>
        )}
      </div>
    </div>
  );
}
