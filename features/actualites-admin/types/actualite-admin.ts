import type { AdminRole } from "@/features/admin-auth/types/admin-auth";

export type StatutActualite = "BROUILLON" | "PUBLIEE" | "ARCHIVEE";
export type ScopeActualite = "WEB" | "MOBILE" | "BOTH";

export interface ActualiteAuthor {
  id: string;
  fullname: string;
  role: AdminRole;
}

export interface ActualiteTaxon {
  id: string;
  nom: string;
  slug: string;
}

export interface Categorie extends ActualiteTaxon {
  description: string | null;
  actualitesCount: number;
}

export interface ActualiteAdmin {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  imageUrl: string | null;
  statut: StatutActualite;
  scope: ScopeActualite;
  publishedAt: string | null;
  author: ActualiteAuthor | null;
  categorie: ActualiteTaxon | null;
  tags: ActualiteTaxon[];
  likesCount: number;
  commentsCount: number;
  likedByMe: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

/** Corps JSON envoyé à `POST /actualites` / `PATCH /actualites/:id`. */
export interface ActualiteAdminPayload {
  title: string;
  excerpt: string;
  content: string;
  date: string;
  categorieId: string;
  scope: ScopeActualite;
  imageKey?: string;
}

export interface ActualiteAdminListResponse {
  data: ActualiteAdmin[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
