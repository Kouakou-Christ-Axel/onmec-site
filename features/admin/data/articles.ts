export interface Article {
  titre: string;
  statut: "Brouillon" | "En relecture" | "Programmé" | "Publié";
  tone: "orange" | "blue" | "neutral";
  auteur: string;
  date: string;
  vues: string;
}

export const RUBRIQUES = ["Terrain", "Éducation civique", "Vie du mouvement", "Communiqué"] as const;

export const MOMENTS_PUBLICATION = ["Publier maintenant", "Demain 08 h 00", "Vendredi 08 h 00"] as const;

export const ARTICLES: Article[] = [
  { titre: "Trois idées fausses sur le vote des étudiants", statut: "Publié", tone: "blue", auteur: "Aminata Traoré", date: "18/08/2026", vues: "1 240" },
  { titre: "Retour sur la caravane citoyenne de Bouaké", statut: "Brouillon", tone: "orange", auteur: "Nadia Koffi", date: "—", vues: "—" },
  { titre: "Ce que dit vraiment la loi sur l’état civil", statut: "En relecture", tone: "orange", auteur: "Yves N’Guessan", date: "—", vues: "—" },
  { titre: "Ouverture des candidatures ambassadeurs campus", statut: "Programmé", tone: "neutral", auteur: "Nadia Koffi", date: "25/08/2026", vues: "—" },
  { titre: "Bilan des clubs scolaires 2025-2026", statut: "Publié", tone: "blue", auteur: "Aminata Traoré", date: "02/08/2026", vues: "860" },
];
