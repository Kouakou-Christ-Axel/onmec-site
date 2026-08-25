import { Megaphone, Users, BookOpen } from "lucide-react";
import type { Programme } from "@/features/actions/types/programme";

export const PROGRAMMES: Programme[] = [
  {
    icon: Megaphone,
    title: "Campagnes de sensibilisation",
    desc: "Nous allons à la rencontre des populations là où elles se trouvent : campus, marchés, quartiers.",
    result: "34 campus et 11 marchés en 2025",
    facts: [
      "Étudiants, commerçants, jeunes des quartiers",
      "Une caravane par trimestre, trois jours par ville",
      "Deux heures d’échange, sans estrade",
    ],
  },
  {
    icon: Users,
    title: "Clubs citoyens scolaires",
    desc: "Un club par établissement, encadré par un enseignant volontaire, avec une activité par mois.",
    result: "28 clubs actifs à la rentrée 2026",
    facts: [
      "Élèves de la 6e à la terminale, encadreurs",
      "Une activité mensuelle, un concours annuel",
      "Le club continue sans nous",
    ],
  },
  {
    icon: BookOpen,
    title: "Formation et ressources",
    desc: "Nous formons les encadreurs et publions des guides libres d’accès, écrits avec les enseignants.",
    result: "9 guides publiés au 30/06/2026",
    facts: [
      "Enseignants, encadreurs, animateurs de club",
      "Deux sessions de formation par an",
      "Publications continues, téléchargement libre",
    ],
  },
];
