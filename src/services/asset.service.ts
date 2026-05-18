import type { Asset } from "@/types";
import { api } from "./api";

export const assetService = {
  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post<Asset>("/assets/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  gallery: () => api.get<Asset[]>("/assets/gallery"),

  delete: (id: string) => api.delete(`/assets/${id}`),
};
