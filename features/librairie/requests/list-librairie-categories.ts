import { apiFetch } from "@/lib/api-client";

export function listLibrairieCategories(): Promise<string[]> {
  return apiFetch<string[]>("/librairie/public/categories", { auth: false });
}
