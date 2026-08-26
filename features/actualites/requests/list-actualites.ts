import { apiFetch } from "@/lib/api-client";
import type { ArticleListResponse } from "@/features/actualites/types/article";

export const ARTICLES_PAR_PAGE = 9;

interface ListActualitesParams {
  page?: number;
  categorie?: string;
  limit?: number;
}

/**
 * Liste publique : le backend n'expose que les actualités publiées aux visiteurs.
 *
 * `auth: false` volontairement — sans lui `apiFetch` appelle `cookies()`, ce qui rendrait la page
 * dynamique alors qu'elle est publique et cacheable.
 */
export function listActualites({
  page = 1,
  categorie,
  limit = ARTICLES_PAR_PAGE,
}: ListActualitesParams = {}): Promise<ArticleListResponse> {
  const query = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (categorie) query.set("categorie", categorie);
  return apiFetch<ArticleListResponse>(`/actualites?${query}`, { auth: false });
}
