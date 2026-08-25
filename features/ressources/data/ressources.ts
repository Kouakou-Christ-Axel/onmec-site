import type { Ressource, Theme, Format, Acces } from "@/features/ressources/types/ressource";

export const THEMES: Theme[] = [
  "Droits et devoirs",
  "Vote et élections",
  "Désinformation",
  "Institutions",
  "Vie de club",
];

export const FORMATS: Format[] = ["PDF", "DOCX", "PNG"];

export const ACCES_VALUES: Acces[] = ["Public", "Adhérents"];

// Fichier volontairement long (voir CLAUDE.md, exemption « nécessité réelle ») : les 9 guides ont
// chacun un excerpt/body réels et fractionner par guide nuirait à la découvrabilité du catalogue.
export const RESSOURCES: Ressource[] = [
  {
    slug: "g1",
    title: "Mes droits, mes devoirs : le guide de l’élève citoyen",
    theme: "Droits et devoirs",
    format: "PDF",
    acces: "Public",
    pages: 48,
    weight: "3,2 Mo",
    date: "12/02/2026",
    downloads: 1840,
    excerpt:
      "Ce qu’un élève peut exiger, ce qu’il doit à son établissement et à sa commune, expliqué sans jargon juridique.",
    body: "Écrit avec quatre enseignants d’éducation civique d’Abidjan et de Bouaké, ce guide reprend les situations que les élèves rencontrent vraiment : un conseil de discipline, une carte d’identité à demander, une réunion de délégués. Chaque chapitre se termine par un cas à discuter en classe.",
  },
  {
    slug: "g2",
    title: "Reconnaître une fausse information en cinq questions",
    theme: "Désinformation",
    format: "PDF",
    acces: "Public",
    pages: 24,
    weight: "1,8 Mo",
    date: "05/03/2026",
    downloads: 2310,
    excerpt: "Une méthode courte, applicable sur un téléphone, pour vérifier avant de partager.",
    body: "Cinq questions, cinq pages, un exemple ivoirien par question. Le guide est conçu pour être projeté en séance de trente minutes ou distribué en fin d’intervention. Il sert de support à nos caravanes depuis mars 2026.",
  },
  {
    slug: "g3",
    title: "Animer un club citoyen : guide de l’encadreur",
    theme: "Vie de club",
    format: "PDF",
    acces: "Adhérents",
    pages: 64,
    weight: "4,6 Mo",
    date: "20/01/2026",
    downloads: 940,
    excerpt: "Créer le club, tenir le rythme d’une activité par mois, passer la main aux élèves.",
    body: "Le guide de référence remis à chaque enseignant volontaire pendant nos sessions de formation. Il contient douze fiches d’activité prêtes à l’emploi, un calendrier type sur l’année scolaire et les documents administratifs à faire signer.",
  },
  {
    slug: "g4",
    title: "Le vote, mode d’emploi",
    theme: "Vote et élections",
    format: "PDF",
    acces: "Public",
    pages: 32,
    weight: "2,4 Mo",
    date: "14/04/2026",
    downloads: 1205,
    excerpt: "S’inscrire, retirer sa carte, voter : le parcours complet, étape par étape.",
    body: "Destiné aux primo-votants de 18 à 25 ans. Le guide suit le calendrier électoral ivoirien et rappelle les pièces à fournir à chaque étape. Les délais indiqués sont ceux publiés par la commission électorale ; nous les révisons à chaque scrutin.",
  },
  {
    slug: "g5",
    title: "Qui décide quoi ? Les institutions ivoiriennes expliquées",
    theme: "Institutions",
    format: "PDF",
    acces: "Public",
    pages: 40,
    weight: "3,0 Mo",
    date: "28/02/2026",
    downloads: 760,
    excerpt:
      "De la mairie à l’Assemblée nationale : qui fait quoi, et à quel moment un citoyen peut peser.",
    body: "Une carte des institutions en double page, puis une fiche par échelon avec ses compétences réelles. Le guide répond à la question que nous entendons le plus souvent en intervention : à qui faut-il s’adresser ?",
  },
  {
    slug: "g6",
    title: "Organiser un débat en classe sans le confisquer",
    theme: "Vie de club",
    format: "DOCX",
    acces: "Adhérents",
    pages: 20,
    weight: "1,2 Mo",
    date: "11/03/2026",
    downloads: 512,
    excerpt: "Cadrer, distribuer la parole, conclure : la méthode que nous utilisons en club.",
    body: "Un format court à l’usage des encadreurs et des délégués. Trois déroulés types de quarante minutes, une grille de répartition de la parole et les phrases de relance qui évitent que deux élèves monopolisent la séance.",
  },
  {
    slug: "g7",
    title: "Vérifier une image avant de la partager",
    theme: "Désinformation",
    format: "PNG",
    acces: "Public",
    pages: 16,
    weight: "1,1 Mo",
    date: "02/06/2026",
    downloads: 1470,
    excerpt: "Recherche inversée, indices de contexte, dates : les réflexes de base sur une photo.",
    body: "Le complément visuel du guide des cinq questions. Il traite le cas le plus fréquent en Côte d’Ivoire : une photo authentique remise en circulation dans un contexte qui n’est pas le sien.",
  },
  {
    slug: "g8",
    title: "Le délégué d’élèves : rôle, limites, méthode",
    theme: "Droits et devoirs",
    format: "PDF",
    acces: "Public",
    pages: 28,
    weight: "1,9 Mo",
    date: "22/05/2026",
    downloads: 655,
    excerpt: "Représenter sans se substituer, rendre compte, préparer un conseil de classe.",
    body: "Support de la formation menée à Bouaké en mai 2026, mis à disposition de tous les établissements. Il distingue clairement ce que le délégué peut porter et ce qui relève de l’administration.",
  },
  {
    slug: "g9",
    title: "Comprendre le rôle du conseil municipal",
    theme: "Institutions",
    format: "PDF",
    acces: "Public",
    pages: 22,
    weight: "1,5 Mo",
    date: "05/04/2026",
    downloads: 430,
    excerpt: "Budget, voirie, état civil : ce qui se décide à dix minutes de chez vous.",
    body: "Un guide volontairement local. Il détaille le calendrier des séances publiques, les documents consultables par tout habitant et les trois moments de l’année où une demande citoyenne a réellement une chance d’aboutir.",
  },
];

export function getRessourceBySlug(slug: string): Ressource | undefined {
  return RESSOURCES.find((ressource) => ressource.slug === slug);
}

/** Priorise les guides du même thème, puis complète avec les autres thèmes. */
export function getRelatedRessources(slug: string, count = 3): Ressource[] {
  const current = getRessourceBySlug(slug);
  const others = RESSOURCES.filter((ressource) => ressource.slug !== slug);
  if (!current) return others.slice(0, count);

  const sameTheme = others.filter((ressource) => ressource.theme === current.theme);
  const rest = others.filter((ressource) => ressource.theme !== current.theme);
  return [...sameTheme, ...rest].slice(0, count);
}
