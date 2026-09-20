"use client";

import { useMutation } from "@tanstack/react-query";
import { postJson } from "@/lib/fetch-json";
import type {
  ActualiteAdmin,
  ActualiteAdminPayload,
} from "@/features/actualites-admin/types/actualite-admin";

export function useCreateActualite() {
  return useMutation({
    mutationFn: (payload: ActualiteAdminPayload) =>
      postJson<ActualiteAdmin>("/api/admin/actualites", payload),
  });
}
