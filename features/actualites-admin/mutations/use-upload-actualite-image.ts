"use client";

import { useMutation } from "@tanstack/react-query";
import { sendFormData } from "@/lib/fetch-json";

export function useUploadActualiteImage() {
  return useMutation({
    mutationFn: (formData: FormData) =>
      sendFormData<{ url: string }>("/api/admin/actualites/upload-image", "POST", formData),
  });
}
