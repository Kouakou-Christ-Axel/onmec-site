"use client";

import { useMutation } from "@tanstack/react-query";
import { patchJson } from "@/lib/fetch-json";
import type { ActualiteAdmin } from "@/features/actualites-admin/types/actualite-admin";

export function useDepublierActualite() {
  return useMutation({
    mutationFn: (id: string) => patchJson<ActualiteAdmin>(`/api/admin/actualites/${id}/depublier`, {}),
  });
}
