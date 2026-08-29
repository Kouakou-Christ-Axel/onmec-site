import { apiFetch } from "@/lib/api-client";
import type {
  SignalementListResponse,
  SignalementStatutApi,
} from "@/features/signalements-admin/types/signalement-admin";

export interface ListSignalementsParams {
  statut?: SignalementStatutApi;
  categorieId?: string;
  page?: number;
  limit?: number;
}

export async function listSignalements(
  params: ListSignalementsParams = {},
): Promise<SignalementListResponse> {
  const query = new URLSearchParams();
  if (params.statut) query.set("statut", params.statut);
  if (params.categorieId) query.set("categorieId", params.categorieId);
  query.set("page", String(params.page ?? 1));
  query.set("limit", String(params.limit ?? 20));
  return apiFetch<SignalementListResponse>(`/signalement-citoyen?${query}`);
}
