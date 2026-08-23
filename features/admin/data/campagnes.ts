export interface Campagne {
  titre: string;
  statut: "En cours" | "En préparation" | "Clôturée";
  tone: "orange" | "neutral" | "outline";
  periode: string;
  resume: string;
  progression: number;
  progressionCouleur: "orange" | "blue" | "neutre";
  note: string;
}

export const CAMPAGNES: Campagne[] = [
  {
    titre: "Caravane citoyenne — Bouaké",
    statut: "En cours",
    tone: "orange",
    periode: "Avril → septembre 2026",
    resume: "4 étapes réalisées sur 6 · 1 240 personnes rencontrées",
    progression: 66,
    progressionCouleur: "orange",
    note: "Prochaine étape : Sakassou, 29/08 · Responsable : Salif Ouattara",
  },
  {
    titre: "#VérifieAvantDePartager",
    statut: "En cours",
    tone: "orange",
    periode: "Août 2026, 3 semaines restantes",
    resume: "Campagne en ligne · 9 publications sur 14 diffusées",
    progression: 64,
    progressionCouleur: "orange",
    note: "Relais : 12 clubs scolaires · Responsable : Nadia Koffi",
  },
  {
    titre: "Clubs scolaires 2026-2027",
    statut: "En préparation",
    tone: "neutral",
    periode: "Rentrée, octobre 2026",
    resume: "12 lycées engagés · 5 conventions à signer",
    progression: 28,
    progressionCouleur: "blue",
    note: "Ouverture des inscriptions le 15/09 · Responsable : Mariam Bakayoko",
  },
  {
    titre: "Concours d’éloquence citoyenne",
    statut: "Clôturée",
    tone: "outline",
    periode: "Juin 2026",
    resume: "84 candidats · 6 finalistes · bilan à publier",
    progression: 100,
    progressionCouleur: "neutre",
    note: "Rapport bailleur attendu le 05/09 · Responsable : Aminata Traoré",
  },
];
