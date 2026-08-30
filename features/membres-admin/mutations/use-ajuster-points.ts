"use client";

import { useMutation } from "@tanstack/react-query";
import { postJson } from "@/lib/fetch-json";
import type { AjusterPointsInput } from "@/features/membres-admin/schemas/ajuster-points-schema";
import type { GamificationStateDto } from "@/features/membres-admin/requests/ajuster-points-membre";

interface Input extends AjusterPointsInput {
  membreId: string;
}

export function useAjusterPoints() {
  return useMutation({
    mutationFn: ({ membreId, ...body }: Input) =>
      postJson<GamificationStateDto>(`/api/admin/membres/${membreId}/points`, body),
  });
}
