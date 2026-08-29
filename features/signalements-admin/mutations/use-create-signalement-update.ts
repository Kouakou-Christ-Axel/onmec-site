"use client";

import { useMutation } from "@tanstack/react-query";
import { postJson } from "@/lib/fetch-json";
import type { SignalementUpdate } from "@/features/signalements-admin/types/signalement-admin";

interface CreateSignalementUpdateInput {
  id: string;
  texte: string;
}

export function useCreateSignalementUpdate() {
  return useMutation({
    mutationFn: ({ id, texte }: CreateSignalementUpdateInput) =>
      postJson<SignalementUpdate>(`/api/admin/signalements/${id}/updates`, { texte }),
  });
}
