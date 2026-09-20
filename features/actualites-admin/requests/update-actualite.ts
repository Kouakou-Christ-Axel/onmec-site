import { apiFetch } from "@/lib/api-client";
import type {
  ActualiteAdmin,
  ActualiteAdminPayload,
} from "@/features/actualites-admin/types/actualite-admin";

export function updateActualiteAdmin(
  id: string,
  payload: Partial<ActualiteAdminPayload>,
): Promise<ActualiteAdmin> {
  return apiFetch<ActualiteAdmin>(`/actualites/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
