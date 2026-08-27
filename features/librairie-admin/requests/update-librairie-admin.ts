import { apiFetch } from "@/lib/api-client";
import type { AdminLibrairieDocument } from "@/features/librairie/types/document";

export interface UpdateLibrairiePayload {
  title?: string;
  description?: string;
  categorie?: string;
}

export function updateLibrairieAdmin(
  id: string,
  payload: UpdateLibrairiePayload,
): Promise<AdminLibrairieDocument> {
  return apiFetch<AdminLibrairieDocument>(`/librairie/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
