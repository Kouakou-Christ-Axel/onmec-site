"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getJson } from "@/lib/fetch-json";
import type { MembreListResponse } from "@/features/membres-admin/types/membre-admin";

interface UseMembresListParams {
  search: string;
  etat: string;
  page: number;
  initialData: MembreListResponse;
}

export function useMembresList({ search, etat, page, initialData }: UseMembresListParams) {
  return useQuery({
    queryKey: ["membres-list", search, etat, page],
    queryFn: () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (etat) params.set("statut", etat);
      params.set("page", String(page));
      return getJson<MembreListResponse>(`/api/admin/membres?${params}`);
    },
    initialData: search || etat || page !== 1 ? undefined : initialData,
    placeholderData: keepPreviousData,
  });
}
