import { apiFetch } from "@/lib/api-client";
import type { ActualiteAdmin } from "@/features/actualites-admin/types/actualite-admin";

export function deleteActualiteAdmin(id: string): Promise<ActualiteAdmin> {
  return apiFetch<ActualiteAdmin>(`/actualites/${id}`, { method: "DELETE" });
}
