"use client";

import { useQuery } from "@tanstack/react-query";
import { catalogService, type CreditEstimateParams } from "@/services/catalog.service";

export function useEstimatedCredits(params: CreditEstimateParams | null) {
  const enabled =
    Boolean(params?.category_slug) && Boolean(params?.model_slug);

  return useQuery({
    queryKey: ["credit-estimate", params],
    queryFn: async () => {
      if (!params) return { credits: 0, fal_usd_estimate: null as number | null };
      const { data } = await catalogService.estimateCredits(params);
      return data;
    },
    enabled,
    staleTime: 30_000,
  });
}
