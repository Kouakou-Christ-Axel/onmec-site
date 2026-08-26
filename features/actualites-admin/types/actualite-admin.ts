import type { AdminRole } from "@/features/admin-auth/types/admin-auth";

export type StatutActualite = "BROUILLON" | "PUBLIEE" | "ARCHIVEE";

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

export interface ActualiteAdminListResponse {
  data: ActualiteAdmin[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
