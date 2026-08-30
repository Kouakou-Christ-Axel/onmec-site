"use client";

import { useQuery } from "@tanstack/react-query";
import { getJson } from "@/lib/fetch-json";
import type { SignalementListResponse } from "@/features/signalements-admin/types/signalement-admin";

async function countByStatut(statut: "NOUVEAU" | "EN_COURS"): Promise<number> {
  const { meta } = await getJson<SignalementListResponse>(
    `/api/admin/signalements?statut=${statut}&limit=1`,
  );
  return meta.total;
}

/** Total des signalements "En validation" (NOUVEAU) + "En cours" — badge de la nav admin. */
export function useSignalementsOuvertsCount() {
  return useQuery({
    queryKey: ["signalements-ouverts-count"],
    queryFn: async () => {
      const [nouveau, enCours] = await Promise.all([
        countByStatut("NOUVEAU"),
        countByStatut("EN_COURS"),
      ]);
      return nouveau + enCours;
    },
  });
}
