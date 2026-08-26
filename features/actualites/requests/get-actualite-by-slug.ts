import { apiFetch } from "@/lib/api-client";
import { ApiError } from "@/lib/api-error";
import type { Article } from "@/features/actualites/types/article";

/**
 * Détail public par slug. Renvoie `null` sur 404 pour que l'appelant décide (`notFound()`),
 * plutôt que de laisser remonter une ApiError jusqu'à la frontière d'erreur.
 */
export async function getActualiteBySlug(slug: string): Promise<Article | null> {
  try {
    return await apiFetch<Article>(`/actualites/slug/${encodeURIComponent(slug)}`, { auth: false });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}
