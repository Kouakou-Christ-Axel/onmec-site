import { apiFetch } from "@/lib/api-client";

export function uploadActualiteImage(formData: FormData): Promise<{ url: string }> {
  return apiFetch<{ url: string }>("/actualites/upload-image", {
    method: "POST",
    body: formData,
  });
}
