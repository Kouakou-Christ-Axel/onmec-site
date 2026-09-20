"use client";

import { useMutation } from "@tanstack/react-query";
import { patchJson } from "@/lib/fetch-json";
import type {
  ActualiteAdmin,
  ActualiteAdminPayload,
} from "@/features/actualites-admin/types/actualite-admin";

interface UpdateActualiteVariables {
  id: string;
  payload: Partial<ActualiteAdminPayload>;
}

export function useUpdateActualite() {
  return useMutation({
    mutationFn: ({ id, payload }: UpdateActualiteVariables) =>
      patchJson<ActualiteAdmin>(`/api/admin/actualites/${id}`, payload),
  });
}
