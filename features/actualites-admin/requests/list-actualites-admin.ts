import { apiFetch } from "@/lib/api-client";
import type { ActualiteAdminListResponse } from "@/features/actualites-admin/types/actualite-admin";

export function listActualitesAdmin(): Promise<ActualiteAdminListResponse> {
  return apiFetch<ActualiteAdminListResponse>("/actualites/admin?limit=50");
}
