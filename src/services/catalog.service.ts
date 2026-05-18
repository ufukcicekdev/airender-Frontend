import { api } from "./api";
import type { CapabilityCategory } from "@/types";

export const catalogService = {
  list: () => api.get<CapabilityCategory[]>("/catalog"),
};
