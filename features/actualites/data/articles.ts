import type { Article, ArticleCategory } from "@/features/actualites/types/article";

export const ARTICLES: Article[] = [
  {
    slug: "bilan",
    title: "Bilan du premier semestre 2026",
    category: "Institutionnel",
    date: "30/06/2026",
    readingTime: "6 min",
    service: "Secrétariat général",
    excerpt:
      "Six mois d’activités dans les établissements et sur le terrain : ce que nous avons mené, ce qui a fonctionné, ce que nous corrigeons.",
  },
  {
    slug: "a2",
    title: "Caravane citoyenne : trois campus d’Abidjan en juin",
    category: "Sensibilisation",
    date: "24/06/2026",
    readingTime: "3 min",
    excerpt:
      "Trois jours de discussions ouvertes sur les droits, les devoirs et la participation, avec les associations étudiantes.",
  },
  {
    slug: "a3",
    title: "Lancement du club citoyen du Lycée moderne de Yopougon",
    category: "Lancement",
    date: "12/06/2026",
    readingTime: "2 min",
    excerpt:
      "Vingt-deux élèves, deux encadreurs, une activité par mois : le club prend le relais de nos interventions.",
  },
  {
    slug: "a4",
    title: "Convention signée avec la direction régionale de l’éducation",
    category: "Partenariat",
    date: "03/06/2026",
    readingTime: "3 min",
    excerpt:
      "Un cadre officiel pour intervenir dans les établissements publics et former les encadreurs pendant l’année scolaire.",
  },
  {
    slug: "a5",
    title: "Formation des délégués d’élèves à Bouaké",
    category: "Sensibilisation",
    date: "21/05/2026",
    readingTime: "4 min",
    excerpt:
      "Deux journées sur le rôle du délégué : représenter, rendre compte, organiser un débat sans le confisquer.",
  },
  {
    slug: "a6",
    title: "Le MEC rejoint la plateforme jeunesse de Côte d’Ivoire",
    category: "Partenariat",
    date: "09/05/2026",
    readingTime: "2 min",
    excerpt:
      "Un espace de coordination entre organisations de jeunesse, pour éviter que les mêmes établissements soient sollicités trois fois.",
  },
  {
    slug: "a7",
    title: "Communiqué : report de la journée citoyenne du 1er mai",
    category: "Institutionnel",
    date: "26/04/2026",
    readingTime: "1 min",
    excerpt:
      "La journée est décalée à la fin du mois pour ne pas se superposer aux célébrations officielles.",
  },
  {
    slug: "a8",
    title: "Lancement de l’antenne MEC de Daloa",
    category: "Lancement",
    date: "18/04/2026",
    readingTime: "3 min",
    excerpt:
      "Une équipe locale de six bénévoles couvre désormais les établissements de la ville et des communes voisines.",
  },
  {
    slug: "a9",
    title: "Comprendre le rôle du conseil municipal en dix minutes",
    category: "Sensibilisation",
    date: "05/04/2026",
    readingTime: "5 min",
    excerpt:
      "Qui décide quoi dans votre commune, et à quel moment un citoyen peut peser sur la décision.",
  },
];

export const CATEGORIES: ArticleCategory[] = [
  "Sensibilisation",
  "Lancement",
  "Partenariat",
  "Institutionnel",
];

/** Classes de jeton par catégorie — remplace [data-cat] .mec-tag du design system. */
export const CATEGORY_TAG_CLASSES: Record<ArticleCategory, string> = {
  Sensibilisation: "bg-orange-100 text-orange-800",
  Lancement: "bg-orange-500 text-white",
  Partenariat: "bg-blue-100 text-blue-700",
  Institutionnel: "bg-n-100 text-text-body ring-1 ring-inset ring-ink/10",
};

export function getArticleBySlug(slug: string): Article | undefined {
  return ARTICLES.find((article) => article.slug === slug);
}

export function getRelatedArticles(slug: string, count = 3): Article[] {
  return ARTICLES.filter((article) => article.slug !== slug).slice(0, count);
}
