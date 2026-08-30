import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/config/env";
import { listActualites } from "@/features/actualites/requests/list-actualites";
import { listLibrairiePublic } from "@/features/librairie/requests/list-librairie-public";
import type { Article } from "@/features/actualites/types/article";
import type { PublicLibrairieDocument } from "@/features/librairie/types/document";

// Garde-fou sur le deuxième appel de fetchAllLibrairieDocuments (voir plus bas) : évite de
// demander un `limit` absurde au backend si le catalogue explosait un jour à un volume
// déraisonnable pour un sitemap.
const LIBRAIRIE_SITEMAP_MAX_LIMIT = 1000;
const ARTICLES_SITEMAP_PAGE_SIZE = 100;

const STATIC_ROUTES: MetadataRoute.Sitemap = [
  { url: "/", changeFrequency: "weekly", priority: 1 },
  { url: "/actualites", changeFrequency: "daily", priority: 0.9 },
  { url: "/ressources", changeFrequency: "weekly", priority: 0.7 },
  { url: "/rejoindre", changeFrequency: "yearly", priority: 0.6 },
  { url: "/apropos", changeFrequency: "yearly", priority: 0.5 },
  { url: "/contact", changeFrequency: "yearly", priority: 0.5 },
  // TODO(produit) : /actions est volontairement absente. La page est orpheline (aucun lien
  // entrant, cf. docs/seo-audit-2026-08-30.md §2.4) et son sort — la relier à la nav ou la
  // retirer du build — n'est pas tranché. Ne pas l'ajouter au sitemap avant cet arbitrage :
  // publier une page qu'aucun lien ne mène nulle part ailleurs serait pire que l'omettre.
  // /maintenance, /admin/** et /api/** ne sont jamais inclus (cf. robots.ts).
];

/**
 * Récupère tous les articles publiés en bouclant sur `listActualites`, qui pagine par `page`.
 * Un échec API ne doit pas faire planter tout le sitemap — un sitemap partiel (routes statiques
 * seules) vaut mieux qu'une 500.
 */
async function fetchAllArticles(): Promise<Article[]> {
  try {
    const first = await listActualites({ page: 1, limit: ARTICLES_SITEMAP_PAGE_SIZE });
    const articles = [...first.data];
    for (let page = 2; page <= first.meta.totalPages; page++) {
      const next = await listActualites({ page, limit: ARTICLES_SITEMAP_PAGE_SIZE });
      articles.push(...next.data);
    }
    return articles;
  } catch {
    return [];
  }
}

/**
 * `listLibrairiePublic` ne pagine que par `limit` — le wrapper n'expose pas de `page` (voir
 * features/librairie/requests/list-librairie-public.ts). Si le premier appel (limit par défaut,
 * 100) ne couvre pas tout le catalogue, un second appel redemande le total exact annoncé par
 * `meta.total` : ça "boucle" sans avoir à réécrire l'appel API, au prix d'une deuxième requête
 * seulement quand le catalogue dépasse 100 documents.
 */
async function fetchAllLibrairieDocuments(): Promise<PublicLibrairieDocument[]> {
  try {
    const first = await listLibrairiePublic();
    if (first.data.length >= first.meta.total) return first.data;
    const total = Math.min(first.meta.total, LIBRAIRIE_SITEMAP_MAX_LIMIT);
    const all = await listLibrairiePublic({ limit: total });
    return all.data;
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const [articles, documents] = await Promise.all([fetchAllArticles(), fetchAllLibrairieDocuments()]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    ...route,
    url: `${siteUrl}${route.url === "/" ? "" : route.url}`,
  }));

  const articleEntries: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${siteUrl}/actualites/${article.slug}`,
    // `updatedAt` reflète la vraie dernière modification côté backend ; jamais de date inventée.
    lastModified: article.updatedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const documentEntries: MetadataRoute.Sitemap = documents.map((document) => ({
    url: `${siteUrl}/ressources/${document.id}`,
    // Pas de champ "updatedAt" côté document : `uploadedAt` est la seule date réelle disponible.
    lastModified: document.uploadedAt,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticEntries, ...articleEntries, ...documentEntries];
}
