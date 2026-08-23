export interface Ressource {
  titre: string;
  meta: string;
  telechargements: number | null;
  statut: "en-ligne" | "en-validation";
}

export const RESSOURCES: Ressource[] = [
  { titre: "Guide du jeune citoyen", meta: "PDF · 34 pages · mis en ligne le 12/06/2026", telechargements: 412, statut: "en-ligne" },
  { titre: "Fiche : reconnaître une fake news", meta: "PDF · 2 pages · mis en ligne le 03/07/2026", telechargements: 690, statut: "en-ligne" },
  { titre: "Kit d’animation club scolaire", meta: "ZIP · 6 fichiers · mis en ligne le 21/07/2026", telechargements: 118, statut: "en-ligne" },
  { titre: "Affiche — Signaler une information", meta: "PNG · A3 · mis en ligne le 30/07/2026", telechargements: 74, statut: "en-ligne" },
  { titre: "Module de formation — droits et devoirs", meta: "PDF · 18 pages · soumis par Konan Yao", telechargements: null, statut: "en-validation" },
];

export const TYPES_RESSOURCE = ["Fiche PDF", "Guide", "Affiche", "Kit d’animation"] as const;
