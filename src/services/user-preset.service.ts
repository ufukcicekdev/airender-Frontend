import { api } from "./api";
import type { UserPromptPreset, UserPromptPresetInput } from "@/types";

export const userPresetService = {
  list: (categorySlug: string) =>
    api.get<UserPromptPreset[]>(`/catalog/my-presets`, {
      params: { category: categorySlug },
    }),

  create: (data: UserPromptPresetInput) =>
    api.post<UserPromptPreset>(`/catalog/my-presets`, data),

  update: (id: string, data: Partial<UserPromptPresetInput>) =>
    api.patch<UserPromptPreset>(`/catalog/my-presets/${id}`, data),

  delete: (id: string) => api.delete(`/catalog/my-presets/${id}`),
};
