import { apiFetch } from "@/lib/api-client";
import type { AdminLibrairieDocument } from "@/features/librairie/types/document";

export interface CreateLibrairiePayload {
  title: string;
  description?: string;
  categorie?: string;
  fichierKey: string;
  coverKey?: string;
}

export function createLibrairieAdmin(
  payload: CreateLibrairiePayload,
): Promise<AdminLibrairieDocument> {
  return apiFetch<AdminLibrairieDocument>("/librairie", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
