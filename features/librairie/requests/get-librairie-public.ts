import { apiFetch } from "@/lib/api-client";
import { ApiError } from "@/lib/api-error";
import type { PublicLibrairieDocument } from "@/features/librairie/types/document";

/**
 * Detail public par id. Renvoie `null` sur 404 pour que l'appelant decide (`notFound()`), plutot
 * que de laisser remonter une ApiError jusqu'a la frontiere d'erreur — meme patron que
 * `get-actualite-by-slug.ts`.
 */
export async function getLibrairiePublic(id: string): Promise<PublicLibrairieDocument | null> {
  try {
    const document = await apiFetch<PublicLibrairieDocument>(`/librairie/public/${id}`, {
      auth: false,
    });
    return { ...document, pageCount: document.pageCount ?? null };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}
