import type { SortKey } from "@/features/librairie/lib/sort-documents";

interface RessourcesHrefParams {
  categorie?: string;
  page?: number;
  q?: string;
  sort?: SortKey;
}

/**
 * Construit l'URL `/ressources` avec les paramètres de recherche actifs — mêmes conventions que
 * `href()` dans `news-list.tsx` : on n'ajoute que ce qui s'écarte du défaut, pour garder les liens
 * "propres" (pas de `?sort=recent` inutile).
 */
export function buildRessourcesHref({ categorie, page, q, sort }: RessourcesHrefParams): string {
  const query = new URLSearchParams();
  if (categorie) query.set("categorie", categorie);
  if (q) query.set("q", q);
  if (sort && sort !== "recent") query.set("sort", sort);
  if (page && page > 1) query.set("page", String(page));
  const suffixe = query.toString();
  return suffixe ? `/ressources?${suffixe}` : "/ressources";
}
