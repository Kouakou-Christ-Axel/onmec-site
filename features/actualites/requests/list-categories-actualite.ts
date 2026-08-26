import { apiFetch } from "@/lib/api-client";
import type { CategorieActualite } from "@/features/actualites/types/article";

/** Route publique. Renvoie un tableau nu, sans enveloppe de pagination. */
export function listCategoriesActualite(): Promise<CategorieActualite[]> {
  return apiFetch<CategorieActualite[]>("/categorie-actualite", { auth: false });
}
