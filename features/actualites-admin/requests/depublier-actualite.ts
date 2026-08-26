import { apiFetch } from "@/lib/api-client";
import type { ActualiteAdmin } from "@/features/actualites-admin/types/actualite-admin";

export function depublierActualiteAdmin(id: string): Promise<ActualiteAdmin> {
  return apiFetch<ActualiteAdmin>(`/actualites/${id}/depublier`, { method: "PATCH" });
}
