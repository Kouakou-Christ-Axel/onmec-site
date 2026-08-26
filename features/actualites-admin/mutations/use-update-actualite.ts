"use client";

import { useMutation } from "@tanstack/react-query";
import { sendFormData } from "@/lib/fetch-json";
import type { ActualiteAdmin } from "@/features/actualites-admin/types/actualite-admin";

interface UpdateActualiteVariables {
  id: string;
  formData: FormData;
}

export function useUpdateActualite() {
  return useMutation({
    mutationFn: ({ id, formData }: UpdateActualiteVariables) =>
      sendFormData<ActualiteAdmin>(`/api/admin/actualites/${id}`, "PATCH", formData),
  });
}
