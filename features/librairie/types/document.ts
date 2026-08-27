export type LibrairieDocument = {
  id: string;
  title: string;
  description: string | null;
  categorie: string | null;
  fileType: string; // ex: ".pdf"
  fileUrl: string;
  coverImage: string | null;
  /** Absent de la reponse tant que le backend n'a pas ajoute le champ — toujours lire `?? null`. */
  pageCount: number | null;
  uploadedAt: string; // ISO 8601
};

export type PublicLibrairieDocument = LibrairieDocument & { auteur: string };

export type AdminLibrairieDocument = LibrairieDocument & {
  uploadedBy: { id: string; fullname: string; email: string };
};

export interface LibrairieListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PublicLibrairieListResponse {
  data: PublicLibrairieDocument[];
  meta: LibrairieListMeta;
}
