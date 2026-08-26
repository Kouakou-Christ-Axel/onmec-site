"use client";

import { useMutation } from "@tanstack/react-query";
import { sendFormData } from "@/lib/fetch-json";
import type { ActualiteAdmin } from "@/features/actualites-admin/types/actualite-admin";

export function useCreateActualite() {
  return useMutation({
    mutationFn: (formData: FormData) =>
      sendFormData<ActualiteAdmin>("/api/admin/actualites", "POST", formData),
  });
}
