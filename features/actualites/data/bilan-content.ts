export const BILAN_SECTIONS = [
  {
    heading: "Ce que nous avons mené",
    paragraphs: [
      "De janvier à juin, nos équipes sont intervenues dans les établissements de plusieurs districts, avec trois formats : la séance d’éducation civique en classe, la caravane citoyenne de quartier et la formation des encadreurs de clubs.",
      "Depuis nos débuts, plus de mille citoyens ont participé à nos activités. Sur ce seul semestre, le nombre de séances tenues et d’élèves touchés reste à consolider à partir des fiches de suivi.",
    ],
    figures: [
      { value: "—", label: "séances tenues" },
      { value: "—", label: "établissements visités" },
      { value: "—", label: "encadreurs formés" },
    ],
    figuresNote: "Janvier – juin 2026 · valeurs à renseigner avant publication",
  },
  {
    heading: "Ce qui a fonctionné",
    paragraphs: [
      "Les clubs animés par les élèves eux-mêmes tiennent dans le temps. Là où un enseignant encadre sans animer, l’activité mensuelle a été maintenue jusqu’en juin ; là où le MEC animait seul, elle s’est arrêtée après notre départ.",
    ],
    quote: {
      text: "« Nous ne venons pas faire à la place des élèves. Nous venons leur donner de quoi faire sans nous. »",
      attribution: "Nom et fonction à confirmer · Bureau exécutif",
    },
  },
  {
    heading: "Ce que nous corrigeons",
    paragraphs: [
      "Deux points nous ont manqué. Les fiches de suivi remontaient trop tard, ce qui rendait le bilan trimestriel approximatif : elles passent en saisie directe dans l’espace membre dès la rentrée.",
      "Ensuite, nos ressources circulaient par messagerie plutôt que depuis le site. Le catalogue de ressources devient la source unique, avec une version datée par document.",
    ],
  },
  {
    heading: "Le second semestre",
    paragraphs: [
      "La rentrée d’octobre ouvre une nouvelle campagne de formation des encadreurs, l’extension des clubs aux établissements demandeurs, et la publication d’un guide d’animation revu.",
      "Le rapport complet, avec le détail par district et les fiches de suivi consolidées, sera publié en même temps que ce bilan.",
    ],
  },
] as const;

export const BILAN_SUMMARY = [
  "Ce que nous avons mené",
  "Ce qui a fonctionné",
  "Ce que nous corrigeons",
  "Le second semestre",
];
