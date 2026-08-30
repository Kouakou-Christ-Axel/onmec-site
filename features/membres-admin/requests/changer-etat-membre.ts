import { apiFetch } from "@/lib/api-client";
import type { ChangerEtatInput } from "@/features/membres-admin/schemas/changer-etat-schema";

interface UpdatedUserStatutDto {
  id: string;
  statut: "ACTIF" | "SUSPENDU" | "BANNI";
}

export function changerEtatMembre(id: string, input: ChangerEtatInput) {
  return apiFetch<UpdatedUserStatutDto>(`/users/${id}/statut`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
