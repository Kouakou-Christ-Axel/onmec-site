"use client";

import { useMutation } from "@tanstack/react-query";
import { patchJson } from "@/lib/fetch-json";
import type { ChangerEtatInput } from "@/features/membres-admin/schemas/changer-etat-schema";

interface Input extends ChangerEtatInput {
  membreId: string;
}

interface UpdatedUserStatutDto {
  id: string;
  statut: "ACTIF" | "SUSPENDU" | "BANNI";
}

export function useChangerEtatMembre() {
  return useMutation({
    mutationFn: ({ membreId, ...body }: Input) =>
      patchJson<UpdatedUserStatutDto>(`/api/admin/membres/${membreId}/etat`, body),
  });
}
