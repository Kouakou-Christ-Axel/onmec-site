"use client";

import { useMutation } from "@tanstack/react-query";
import {
  createDocumentWithUpload,
  type CreateDocumentInput,
} from "@/features/librairie-admin/lib/create-document-with-upload";

export function useCreateDocument() {
  return useMutation({
    mutationFn: (input: CreateDocumentInput) => createDocumentWithUpload(input),
  });
}
