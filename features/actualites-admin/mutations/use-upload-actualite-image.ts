"use client";

import { useMutation } from "@tanstack/react-query";
import { uploadActualiteContentImage } from "@/features/actualites-admin/lib/upload-actualite-content-image";

export function useUploadActualiteImage() {
  return useMutation({
    mutationFn: (file: File) => uploadActualiteContentImage(file),
  });
}
