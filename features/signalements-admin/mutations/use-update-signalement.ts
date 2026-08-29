"use client";

import { useMutation } from "@tanstack/react-query";
import { patchJson } from "@/lib/fetch-json";
import type {
  SignalementAdmin,
  SignalementStatutApi,
} from "@/features/signalements-admin/types/signalement-admin";

interface UpdateSignalementInput {
  id: string;
  statut?: SignalementStatutApi;
  validation?: boolean;
}

export function useUpdateSignalement() {
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateSignalementInput) =>
      patchJson<SignalementAdmin>(`/api/admin/signalements/${id}`, body),
  });
}
