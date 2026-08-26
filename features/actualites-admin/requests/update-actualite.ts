import { apiFetch } from "@/lib/api-client";
import type { ActualiteAdmin } from "@/features/actualites-admin/types/actualite-admin";

export function updateActualiteAdmin(id: string, formData: FormData): Promise<ActualiteAdmin> {
  return apiFetch<ActualiteAdmin>(`/actualites/${id}`, {
    method: "PATCH",
    body: formData,
  });
}
