import { apiFetch } from "@/lib/api-client";
import type { SignalementUpdate } from "@/features/signalements-admin/types/signalement-admin";

export function listSignalementUpdates(id: string): Promise<SignalementUpdate[]> {
  return apiFetch<SignalementUpdate[]>(`/signalement-citoyen/${id}/updates`);
}
