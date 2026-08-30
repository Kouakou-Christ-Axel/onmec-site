export const PERIODES = [
  "Janvier → août 2026",
  "2e trimestre 2026",
  "Année scolaire 2025-2026",
] as const;

export interface StatMoisSensibilisation {
  label: string;
  hauteur: number;
  orange: boolean;
}

export const MOIS: StatMoisSensibilisation[] = [
  { label: "Jan", hauteur: 38, orange: false },
  { label: "Fév", hauteur: 46, orange: false },
  { label: "Mar", hauteur: 58, orange: false },
  { label: "Avr", hauteur: 74, orange: true },
  { label: "Mai", hauteur: 62, orange: false },
  { label: "Juin", hauteur: 88, orange: true },
  { label: "Juil", hauteur: 34, orange: false },
  { label: "Août", hauteur: 52, orange: false },
];

export interface StatRegion {
  region: string;
  seances: number;
  personnes: string;
  signalements: number;
}

export const REGIONS: StatRegion[] = [
  { region: "Abidjan", seances: 18, personnes: "1 460", signalements: 26 },
  { region: "Gbêkê (Bouaké)", seances: 11, personnes: "840", signalements: 9 },
  { region: "Haut-Sassandra (Daloa)", seances: 6, personnes: "470", signalements: 5 },
  { region: "Yamoussoukro", seances: 4, personnes: "280", signalements: 3 },
  { region: "San-Pédro", seances: 2, personnes: "130", signalements: 1 },
];
