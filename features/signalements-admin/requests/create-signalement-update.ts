import { apiFetch } from "@/lib/api-client";
import type { SignalementUpdate } from "@/features/signalements-admin/types/signalement-admin";

export function createSignalementUpdate(id: string, texte: string): Promise<SignalementUpdate> {
  return apiFetch<SignalementUpdate>(`/signalement-citoyen/${id}/updates`, {
    method: "POST",
    body: JSON.stringify({ texte }),
  });
}
