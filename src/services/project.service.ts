import type { Project } from "@/types";
import type { PaginatedResponse } from "@/lib/api-utils";
import { unwrapList } from "@/lib/api-utils";
import { api } from "./api";

/** DRF router with trailing_slash=False */
const P = "/projects";

export const projectService = {
  list: async () => {
    const { data } = await api.get<Project[] | PaginatedResponse<Project>>(P);
    return { data: unwrapList(data) };
  },

  get: (id: string) => api.get<Project>(`${P}/${id}`),

  create: (data: { name: string; description?: string }) =>
    api.post<Project>(P, data),

  update: (id: string, data: Partial<Project>) =>
    api.patch<Project>(`${P}/${id}`, data),

  delete: (id: string) => api.delete(`${P}/${id}`),

  duplicate: (id: string) => api.post<Project>(`${P}/${id}/duplicate`),

  templates: () => api.get<Project[]>(`${P}/templates`),

  recent: () => api.get<Project[]>(`${P}/recent`),
};
