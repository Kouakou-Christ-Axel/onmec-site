import { apiFetch } from "@/lib/api-client";
import type { ActualiteAdmin } from "@/features/actualites-admin/types/actualite-admin";

export function createActualiteAdmin(formData: FormData): Promise<ActualiteAdmin> {
  return apiFetch<ActualiteAdmin>("/actualites", {
    method: "POST",
    body: formData,
  });
}
