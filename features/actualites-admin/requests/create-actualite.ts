import { apiFetch } from "@/lib/api-client";
import type {
  ActualiteAdmin,
  ActualiteAdminPayload,
} from "@/features/actualites-admin/types/actualite-admin";

export function createActualiteAdmin(payload: ActualiteAdminPayload): Promise<ActualiteAdmin> {
  return apiFetch<ActualiteAdmin>("/actualites", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
