export type SignalementStatutApi = "NOUVEAU" | "EN_COURS" | "RESOLU" | "REJETE";

export interface SignalementCategorie {
  id: string;
  nom: string;
}

export interface SignalementCitoyenAuteur {
  id: string;
  fullname: string;
  email: string;
}

export interface SignalementAdmin {
  id: string;
  titre: string;
  description: string;
  categorieId: string;
  categorie: SignalementCategorie | null;
  adresse: string;
  photo: string | null;
  statut: SignalementStatutApi;
  validation: boolean;
  citoyen: SignalementCitoyenAuteur | null;
  createdAt: string;
  updatedAt: string;
}

export interface SignalementListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SignalementListResponse {
  data: SignalementAdmin[];
  meta: SignalementListMeta;
}

/** Étape d'affichage dérivée de `statut` — l'onglet "En validation" correspond au statut NOUVEAU. */
export type SignalementTab = "validation" | "encours" | "resolu" | "rejete";

export const SIGNALEMENT_TAB_META: Record<
  SignalementTab,
  { label: string; tone: "orange" | "blue" | "neutral" | "outline" }
> = {
  validation: { label: "En validation", tone: "orange" },
  encours: { label: "En cours", tone: "blue" },
  resolu: { label: "Résolu", tone: "neutral" },
  rejete: { label: "Rejeté", tone: "outline" },
};

const TAB_BY_STATUT: Record<SignalementStatutApi, SignalementTab> = {
  NOUVEAU: "validation",
  EN_COURS: "encours",
  RESOLU: "resolu",
  REJETE: "rejete",
};

export function signalementTab(statut: SignalementStatutApi): SignalementTab {
  return TAB_BY_STATUT[statut];
}

export const STATUT_BY_TAB: Record<SignalementTab, SignalementStatutApi> = {
  validation: "NOUVEAU",
  encours: "EN_COURS",
  resolu: "RESOLU",
  rejete: "REJETE",
};

/**
 * Journal de suivi affiché dans le tiroir. Non persisté côté backend pour
 * l'instant (gap documenté dans le spec, prompt déjà transmis) : vit
 * uniquement en state local dans `SignalementsAdminClient`, perdu au
 * rechargement de page.
 */
export interface SignalementUpdateEntry {
  date: string;
  auteur: string;
  texte: string;
}

export function updatesLabel(count: number): string {
  if (count === 0) return "aucune mise à jour";
  if (count === 1) return "1 mise à jour";
  return `${count} mises à jour`;
}
