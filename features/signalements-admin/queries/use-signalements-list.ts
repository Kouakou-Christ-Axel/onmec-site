"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getJson } from "@/lib/fetch-json";
import type {
  SignalementListResponse,
  SignalementStatutApi,
} from "@/features/signalements-admin/types/signalement-admin";

interface UseSignalementsListParams {
  statut: SignalementStatutApi | "";
  categorieId: string;
  page: number;
  initialData: SignalementListResponse;
}

export function useSignalementsList({
  statut,
  categorieId,
  page,
  initialData,
}: UseSignalementsListParams) {
  return useQuery({
    queryKey: ["signalements-list", statut, categorieId, page],
    queryFn: () => {
      const params = new URLSearchParams();
      if (statut) params.set("statut", statut);
      if (categorieId) params.set("categorieId", categorieId);
      params.set("page", String(page));
      return getJson<SignalementListResponse>(`/api/admin/signalements?${params}`);
    },
    initialData: statut || categorieId || page !== 1 ? undefined : initialData,
    placeholderData: keepPreviousData,
  });
}
