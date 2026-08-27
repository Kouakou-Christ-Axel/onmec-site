import { apiFetch } from "@/lib/api-client";
import type { AdminLibrairieDocument, LibrairieListMeta } from "@/features/librairie/types/document";

export interface LibrairieAdminListResponse {
  data: AdminLibrairieDocument[];
  meta: LibrairieListMeta;
}

// ponytail: limit=50 recupere toute la liste admin en un appel, comme list-actualites-admin.ts —
// pas de pagination serveur cote UI admin tant que le nombre de documents reste modeste.
export function listLibrairieAdmin(): Promise<LibrairieAdminListResponse> {
  return apiFetch<LibrairieAdminListResponse>("/librairie?limit=50");
}
