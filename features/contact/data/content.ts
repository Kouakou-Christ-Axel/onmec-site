import { Newspaper, Landmark, GraduationCap, Smartphone } from "lucide-react";
import type { ContactCard } from "@/features/contact/types/contact";

export const OBJETS_CONTACT = [
  "Une question générale",
  "Presse et médias",
  "Partenariat ou financement",
  "Intervenir dans mon établissement",
  "Devenir bénévole",
  "Autre",
];

export const CONTACTS_PAR_SUJET: ContactCard[] = [
  {
    icon: Newspaper,
    title: "Presse et médias",
    desc: "Demandes d’interview, éléments de contexte, visuels libres de droits.",
    action: "presse@mec-ci.org",
    href: "mailto:presse@mec-ci.org",
  },
  {
    icon: Landmark,
    title: "Partenaires et bailleurs",
    desc: "Conventions, financements, rapports d’activité et bilans chiffrés.",
    action: "partenariats@mec-ci.org",
    href: "mailto:partenariats@mec-ci.org",
  },
  {
    icon: GraduationCap,
    title: "Établissements scolaires",
    desc: "Accueillir une intervention ou ouvrir un club citoyen dans votre école.",
    action: "ecoles@mec-ci.org",
    href: "mailto:ecoles@mec-ci.org",
  },
  {
    icon: Smartphone,
    title: "Signalement citoyen",
    desc: "Une information douteuse se signale dans l’application, pas par courriel.",
    // Aucune application mobile confirmée pour l'instant : lien inerte, voir "Écarts" du plan.
    action: "Ouvrir l’application →",
    href: "#",
  },
];
