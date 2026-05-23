"use client";

import { useQuery } from "@tanstack/react-query";
import { Check, Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format-price";
import { billingService } from "@/services/billing.service";
import { SHOW_CREDITS_UI } from "@/lib/feature-flags";

interface PricingContentProps {
  className?: string;
}

export function PricingContent({ className }: PricingContentProps) {
  if (!SHOW_CREDITS_UI) {
    return null;
  }
  const { data, isLoading } = useQuery({
    queryKey: ["pricing"],
    queryFn: async () => {
      const { data: overview } = await billingService.getPricing();
      return overview;
    },
  });

  const settings = data?.settings;
  const creditPacks = data?.credit_packs ?? [];

  if (isLoading) {
    return (
      <p className={cn("text-center text-muted-foreground py-12", className)}>
        Loading pricing…
      </p>
    );
  }

  const pricingLoadFailed = !isLoading && !data;

  return (
    <div className={className}>
      {pricingLoadFailed && (
        <p className="mb-6 text-center text-sm text-amber-200/90">
          Could not load pricing. Check that the backend is running and try refreshing.
        </p>
      )}

      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium uppercase tracking-wider text-[hsl(var(--viz-cyan))]">
          Pay as you go
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          {settings?.credits_section_title ?? "Credit packs"}
        </h2>
        <p className="mt-4 text-muted-foreground">
          {settings?.credits_section_description ??
            "Pay as you go — no subscription. Contact us to add credits to your account."}
        </p>
      </div>

      {creditPacks.length === 0 && !pricingLoadFailed && (
        <p className="mt-8 text-center text-sm text-muted-foreground">
          No credit packs available yet. Refresh the page — they load automatically when the
          backend connects.
        </p>
      )}

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
                {pack.slug === "credits-100" ? "Starter" : "Best value"}
              </span>
            )}
            <div className="mb-3 flex items-center gap-2">
              <Coins className="h-5 w-5 text-[hsl(var(--viz-cyan))]" />
              <h3 className="text-lg font-semibold">{pack.name}</h3>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">{pack.description}</p>
            <p className="text-3xl font-bold">{formatPrice(pack.price, pack.currency)}</p>
            <p className="mt-2 text-sm font-medium text-[hsl(var(--viz-cyan))]">
              {pack.total_credits.toLocaleString()} credits · one-time purchase
            </p>
            {pack.features.length > 0 && (
              <ul className="mt-4 flex-1 space-y-2">
                {pack.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[hsl(var(--viz-cyan))]" />
                    {f}
                  </li>
                ))}
              </ul>
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
  );
}
