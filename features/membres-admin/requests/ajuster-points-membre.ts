import { apiFetch } from "@/lib/api-client";
import type { AjusterPointsInput } from "@/features/membres-admin/schemas/ajuster-points-schema";

export interface GamificationStateDto {
  points: number;
  niveau: number;
}

export function ajusterPointsMembre(userId: string, input: AjusterPointsInput) {
  return apiFetch<GamificationStateDto>("/gamification/points", {
    method: "POST",
    body: JSON.stringify({ userId, points: input.delta, raison: input.raison }),
  });
}
