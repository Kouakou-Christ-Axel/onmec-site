import { apiFetch } from "@/lib/api-client";
import type { AdminStatistics } from "@/features/statistiques-admin/types/admin-statistics";

/**
 * GET /admin/statistics — endpoint pas encore livré côté onmec_backend (gap
 * documenté dans docs/superpowers/specs/2026-08-30-statistiques-admin-design.md).
 * Lève une ApiError tant que le backend ne l'expose pas ; l'appelant doit
 * traiter ce cas comme un état "à venir", pas comme une erreur bloquante.
 */
export function getAdminStatistics(): Promise<AdminStatistics> {
  return apiFetch<AdminStatistics>("/admin/statistics");
}
