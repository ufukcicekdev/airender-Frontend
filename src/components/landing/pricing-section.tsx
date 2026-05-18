"use client";

import { PricingContent } from "@/components/billing/pricing-content";

export function PricingSection() {
  return (
    <section id="pricing" className="scroll-mt-24 border-t border-border/40 py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <PricingContent interactive={false} />
      </div>
    </section>
  );
}
