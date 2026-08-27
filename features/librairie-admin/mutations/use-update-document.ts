"use client";

import { useMutation } from "@tanstack/react-query";
import { patchJson } from "@/lib/fetch-json";
import type { AdminLibrairieDocument } from "@/features/librairie/types/document";
import type { UpdateLibrairiePayload } from "@/features/librairie-admin/requests/update-librairie-admin";

interface UpdateDocumentInput extends UpdateLibrairiePayload {
  id: string;
}

export function useUpdateDocument() {
  return useMutation({
    mutationFn: ({ id, ...payload }: UpdateDocumentInput) =>
      patchJson<AdminLibrairieDocument>(`/api/admin/librairie/${id}`, payload),
  });
}
