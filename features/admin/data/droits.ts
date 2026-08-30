export interface DroitCapacite {
  /** Slug backend (`capabilities-by-role.ts`), affiché en info-bulle/petit texte. */
  capacite: string;
  libelle: string;
  administrateur: boolean;
  communication: boolean;
  moderation: boolean;
}

/**
 * Recopié à la main depuis `onmec_backend/src/common/constantes/capabilities-by-role.ts`
 * (`capabilitiesByRole`) — accès binaire réel par rôle × capacité, pas de "Lecture seule"
 * inventé. Ne jamais ajouter une capacité qui n'y figure pas ni inventer un état intermédiaire.
 */
export const DROITS: DroitCapacite[] = [
  {
    capacite: "actualite:read",
    libelle: "Lire les actualités",
    administrateur: true,
    communication: true,
    moderation: true,
  },
  {
    capacite: "actualite:write",
    libelle: "Rédiger une actualité",
    administrateur: true,
    communication: true,
    moderation: false,
  },
  {
    capacite: "actualite:publish",
    libelle: "Publier une actualité",
    administrateur: true,
    communication: true,
    moderation: false,
  },
  {
    capacite: "actualite:delete",
    libelle: "Supprimer une actualité",
    administrateur: true,
    communication: true,
    moderation: false,
  },
  {
    capacite: "actualite:preview",
    libelle: "Prévisualiser brouillons/archives",
    administrateur: true,
    communication: true,
    moderation: false,
  },
  {
    capacite: "commentaire:moderate",
    libelle: "Modérer les commentaires",
    administrateur: true,
    communication: true,
    moderation: true,
  },
  {
    capacite: "member:read",
    libelle: "Consulter les membres (comptes citoyens)",
    administrateur: true,
    communication: false,
    moderation: true,
  },
  {
    capacite: "member:suspend",
    libelle: "Suspendre un membre",
    administrateur: true,
    communication: false,
    moderation: true,
  },
  {
    capacite: "member:delete",
    libelle: "Supprimer un membre",
    administrateur: true,
    communication: false,
    moderation: false,
  },
  {
    capacite: "signalement:moderate",
    libelle: "Modérer les signalements",
    administrateur: true,
    communication: false,
    moderation: true,
  },
  {
    capacite: "admin:manage",
    libelle: "Gérer les comptes back-office",
    administrateur: true,
    communication: false,
    moderation: false,
  },
  {
    capacite: "librairie:manage",
    libelle: "Gérer la librairie de ressources",
    administrateur: true,
    communication: true,
    moderation: false,
  },
  {
    capacite: "quiz:manage",
    libelle: "Gérer les quiz éducatifs",
    administrateur: true,
    communication: false,
    moderation: false,
  },
];
