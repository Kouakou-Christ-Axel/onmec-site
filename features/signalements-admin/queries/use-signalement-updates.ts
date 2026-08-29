"use client";

import { useQuery } from "@tanstack/react-query";
import { getJson } from "@/lib/fetch-json";
import type { SignalementUpdate } from "@/features/signalements-admin/types/signalement-admin";

export function useSignalementUpdates(id: string | null) {
  return useQuery({
    queryKey: ["signalement-updates", id],
    queryFn: () => getJson<SignalementUpdate[]>(`/api/admin/signalements/${id}/updates`),
    enabled: id !== null,
  });
}
