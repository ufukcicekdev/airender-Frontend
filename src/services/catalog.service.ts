import { api } from "./api";
import type { CapabilityCategory } from "@/types";

export interface CreditEstimateParams {
  category_slug: string;
  model_slug: string;
  resolution?: string;
  duration_seconds?: string;
  video_duration?: string;
  generate_audio?: boolean;
  upscale_scale?: string | number;
}

export interface CreditEstimateResponse {
  credits: number;
  fal_usd_estimate: number | null;
  category_slug: string;
  model_slug: string;
}

export const catalogService = {
  /** Trailing slash required — Django APPEND_SLASH; proxy does not follow 301. */
  list: () => api.get<CapabilityCategory[]>("/catalog/"),
  estimateCredits: (params: CreditEstimateParams) =>
    api.get<CreditEstimateResponse>("/catalog/estimate-credits", { params }),
};
