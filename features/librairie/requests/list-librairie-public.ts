import { apiFetch } from "@/lib/api-client";
import type { PublicLibrairieListResponse } from "@/features/librairie/types/document";

// ponytail: 100 par defaut recupere tout le catalogue en un appel plutot que de refaire la
// pagination serveur cote client (le catalogue reste petit) ; passer a une pagination server-side
// si le nombre de documents publies depasse ce seuil.
const CATALOG_LIMIT = 100;

interface ListLibrairiePublicParams {
  categorie?: string;
  limit?: number;
}

/**
 * Liste publique : le backend n'expose que les documents, sans donnees sensibles.
 *
 * `auth: false` volontairement — sans lui `apiFetch` appelle `cookies()`, ce qui rendrait la page
 * dynamique alors qu'elle est publique et cacheable (meme raison que `list-actualites.ts`).
 */
export async function listLibrairiePublic({
  categorie,
  limit = CATALOG_LIMIT,
}: ListLibrairiePublicParams = {}): Promise<PublicLibrairieListResponse> {
  const query = new URLSearchParams({ limit: String(limit) });
  if (categorie) query.set("categorie", categorie);
  const response = await apiFetch<PublicLibrairieListResponse>(`/librairie/public?${query}`, {
    auth: false,
  });
  // Normalisation defensive : le backend peut omettre pageCount plutot que de le poser a `null`
  // (champ pas encore livre au moment de l'implementation) — sans ce mapping, `undefined` passerait
  // le check `!== null` cote UI et s'afficherait litteralement comme "undefined p.".
  return {
    ...response,
    data: response.data.map((doc) => ({ ...doc, pageCount: doc.pageCount ?? null })),
  };
}
