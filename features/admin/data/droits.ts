export interface DroitModule {
  module: string;
  administrateur: string;
  communication: string;
  moderation: string;
}

export const DROITS: DroitModule[] = [
  { module: "Actualités et blog", administrateur: "Plein accès", communication: "Plein accès", moderation: "Lecture seule" },
  { module: "Ressources pédagogiques", administrateur: "Plein accès", communication: "Plein accès", moderation: "Lecture seule" },
  { module: "Signalements de l’app", administrateur: "Plein accès", communication: "Aucun accès", moderation: "Plein accès" },
  { module: "Modération et suivi", administrateur: "Plein accès", communication: "Lecture seule", moderation: "Plein accès" },
  { module: "Campagnes et événements", administrateur: "Plein accès", communication: "Plein accès", moderation: "Lecture seule" },
  { module: "Notifications de l’app", administrateur: "Plein accès", communication: "Plein accès", moderation: "Aucun accès" },
  { module: "Statistiques et rapports", administrateur: "Plein accès", communication: "Lecture seule", moderation: "Lecture seule" },
  { module: "Utilisateurs et droits", administrateur: "Plein accès", communication: "Aucun accès", moderation: "Aucun accès" },
];
