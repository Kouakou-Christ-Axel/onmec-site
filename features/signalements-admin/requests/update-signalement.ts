import { apiFetch } from "@/lib/api-client";
import type {
  SignalementAdmin,
  SignalementStatutApi,
} from "@/features/signalements-admin/types/signalement-admin";

export interface UpdateSignalementInput {
  statut?: SignalementStatutApi;
  validation?: boolean;
}

export function updateSignalement(
  id: string,
  input: UpdateSignalementInput,
): Promise<SignalementAdmin> {
  return apiFetch<SignalementAdmin>(`/signalement-citoyen/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
