/**
 * Formes renvoyées par `onmec_backend` sur les routes publiques des actualités.
 *
 * Volontairement redéfinies ici plutôt qu'importées de `features/actualites-admin` : le site
 * public ne doit pas dépendre du domaine back-office, et les deux peuvent diverger.
 */

export type StatutActualite = "BROUILLON" | "PUBLIEE" | "ARCHIVEE";

export interface ActualiteTaxon {
  id: string;
  nom: string;
  slug: string;
}

export interface ActualiteAuthor {
  id: string;
  fullname: string;
  role: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  /** ISO 8601. Utiliser `formatArticleDate` pour l'affichage. */
  date: string;
  /**
   * URL **absolue** servie par l'API — l'OpenAPI la documente relative, à tort (vérifié à l'appel).
   * Son domaine suit donc celui de l'API et change entre local et production.
   */
  imageUrl: string | null;
  statut: StatutActualite;
  publishedAt: string | null;
  author: ActualiteAuthor | null;
  /** Null seulement si la catégorie a été retirée après coup. */
  categorie: ActualiteTaxon | null;
  tags: ActualiteTaxon[];
  likesCount: number;
  commentsCount: number;
  likedByMe: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ArticleListResponse {
  data: Article[];
  meta: ArticleListMeta;
}

export interface CategorieActualite extends ActualiteTaxon {
  description: string | null;
  /** Ne compte que les actualités publiées et non supprimées. */
  actualitesCount: number;
}
