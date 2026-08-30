export type MembreEtat = "ACTIF" | "SUSPENDU" | "BANNI";

export interface MembreAdmin {
  id: string;
  nom: string;
  email: string;
  telephone: string | null;
  dateInscription: string;
  etat: MembreEtat;
  emailVerifie: boolean;
}

export interface MembreListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MembreListResponse {
  data: MembreAdmin[];
  meta: MembreListMeta;
}
