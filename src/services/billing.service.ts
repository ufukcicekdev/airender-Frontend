import type { CreditPack, Plan, PricingOverview, UserSubscription } from "@/types";
import { api } from "./api";

export const billingService = {
  getPricing: () => api.get<PricingOverview>("/billing/pricing"),

  listPlans: () => api.get<Plan[]>("/billing/plans"),

  listCreditPacks: () => api.get<CreditPack[]>("/billing/credit-packs"),

  getSubscription: () => api.get<UserSubscription>("/billing/subscription"),

  subscribe: (plan_slug: string, billing_cycle: "monthly" | "yearly" = "monthly") =>
    api.post<UserSubscription>("/billing/subscribe", { plan_slug, billing_cycle }),

  purchaseCredits: (pack_slug: string) =>
    api.post<{ pack: CreditPack; credits_added: number; credits_balance: number }>(
      "/billing/purchase-credits",
      { pack_slug }
    ),
};
