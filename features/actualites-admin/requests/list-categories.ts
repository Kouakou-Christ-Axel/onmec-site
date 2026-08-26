import { apiFetch } from "@/lib/api-client";
import type { Categorie } from "@/features/actualites-admin/types/actualite-admin";

export function listCategoriesAdmin(): Promise<Categorie[]> {
  return apiFetch<Categorie[]>("/categorie-actualite");
}
