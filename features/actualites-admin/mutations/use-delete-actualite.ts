"use client";

import { useMutation } from "@tanstack/react-query";
import { deleteJson } from "@/lib/fetch-json";
import type { ActualiteAdmin } from "@/features/actualites-admin/types/actualite-admin";

export function useDeleteActualite() {
  return useMutation({
    mutationFn: (id: string) => deleteJson<ActualiteAdmin>(`/api/admin/actualites/${id}`),
  });
}
