import type { LucideIcon } from "lucide-react";
import { Users, GraduationCap, Landmark } from "lucide-react";

export type Cible = {
  icon: LucideIcon;
  colorClass: string;
  barClass: string;
  title: string;
  desc: string;
  pct: string;
};

export const CIBLES: Cible[] = [
  {
    icon: Users,
    colorClass: "text-orange-500",
    barClass: "bg-orange-500",
    title: "Jeunes de 6 à 17 ans",
    desc: "Élèves, collégiens et lycéens — la future génération de citoyens.",
    pct: "45%",
  },
  {
    icon: GraduationCap,
    colorClass: "text-blue-500",
    barClass: "bg-blue-500",
    title: "Jeunes adultes de 18 à 35 ans",
    desc: "Étudiants, jeunes professionnels et entrepreneurs.",
    pct: "40%",
  },
  {
    icon: Landmark,
    colorClass: "text-ink",
    barClass: "bg-ink",
    title: "Partenaires et leaders",
    desc: "ONG, médias, leaders d’opinion et institutions.",
    pct: "15%",
  },
];

export const VALEURS = [
  { title: "Rigueur", desc: "Ce que nous publions est daté et sourcé." },
  { title: "Proximité", desc: "Nous allons dans les établissements, pas l’inverse." },
  { title: "Indépendance", desc: "Aucune affiliation partisane, aucune consigne de vote." },
  { title: "Transmission", desc: "Nos outils sont libres, reproductibles et gratuits." },
];

export const BUREAU = [
  { name: "Nom à fournir", role: "Président" },
  { name: "Nom à fournir", role: "Vice-présidente" },
  { name: "Nom à fournir", role: "Secrétaire général" },
  { name: "Nom à fournir", role: "Trésorière" },
  { name: "Nom à fournir", role: "Chargé des programmes" },
  { name: "Nom à fournir", role: "Chargée de la communication" },
];
