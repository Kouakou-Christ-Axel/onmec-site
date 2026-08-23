export type SignalementStatut = "validation" | "encours" | "resolu" | "rejete";

export interface SignalementUpdate {
  date: string;
  auteur: string;
  texte: string;
}

export interface Signalement {
  id: string;
  sujet: string;
  categorie: string;
  lieu: string;
  recu: string;
  delai: string;
  auteur: string;
  statut: SignalementStatut;
  publie: boolean;
  responsable: string;
  contenu: string;
  updates: SignalementUpdate[];
}

export const SIGNALEMENTS: Signalement[] = [
  {
    id: "SIG-2026-0148",
    sujet: "Nid de poule dangereux sur le boulevard",
    categorie: "Voirie et routes",
    lieu: "Cocody, boulevard Latrille",
    recu: "21/08/2026",
    delai: "il y a 2 h",
    auteur: "Citoyen #1042",
    statut: "validation",
    publie: false,
    responsable: "",
    contenu:
      "Trou d’environ un mètre de large sur la voie de droite, à hauteur de la pharmacie. Deux motos y sont tombées cette semaine selon le signalant.",
    updates: [],
  },
  {
    id: "SIG-2026-0147",
    sujet: "Lampadaires éteints depuis deux semaines",
    categorie: "Éclairage public",
    lieu: "Yopougon, quartier Niangon",
    recu: "21/08/2026",
    delai: "il y a 5 h",
    auteur: "Citoyen #0987",
    statut: "validation",
    publie: false,
    responsable: "",
    contenu:
      "Toute la rue principale est dans le noir à partir de 19 h. Les commerçants ferment plus tôt.",
    updates: [],
  },
  {
    id: "SIG-2026-0146",
    sujet: "Dépôt d’ordures devant l’école primaire",
    categorie: "Insalubrité et déchets",
    lieu: "Bouaké, Air France",
    recu: "20/08/2026",
    delai: "hier",
    auteur: "Enseignant — club MEC",
    statut: "validation",
    publie: false,
    responsable: "",
    contenu: "Dépôt sauvage installé sur le trottoir de l’entrée des élèves. Odeurs signalées par les parents.",
    updates: [],
  },
  {
    id: "SIG-2026-0145",
    sujet: "Canalisation bouchée, eau stagnante",
    categorie: "Eau et assainissement",
    lieu: "Daloa, Tazibouo",
    recu: "20/08/2026",
    delai: "hier",
    auteur: "Citoyen #0954",
    statut: "validation",
    publie: false,
    responsable: "",
    contenu:
      "Eau stagnante depuis les pluies du 15/08, moustiques signalés par plusieurs familles du quartier.",
    updates: [],
  },
  {
    id: "SIG-2026-0144",
    sujet: "Passage piéton effacé devant le lycée",
    categorie: "Sécurité routière",
    lieu: "Abidjan, Marcory",
    recu: "19/08/2026",
    delai: "19/08",
    auteur: "Citoyen #0931",
    statut: "encours",
    publie: true,
    responsable: "Konan Yao",
    contenu: "Marquage au sol totalement effacé à la sortie des classes, sur une voie à double sens.",
    updates: [
      {
        date: "20/08/2026",
        auteur: "Konan Yao",
        texte: "Signalement transmis à la mairie de Marcory. Dossier enregistré sous la référence M-2026-311.",
      },
    ],
  },
  {
    id: "SIG-2026-0143",
    sujet: "Toit de salle de classe percé",
    categorie: "Infrastructure scolaire",
    lieu: "Yamoussoukro, Kokrenou",
    recu: "19/08/2026",
    delai: "19/08",
    auteur: "Encadreur — club scolaire",
    statut: "encours",
    publie: true,
    responsable: "Aminata Traoré",
    contenu: "Deux tôles arrachées au-dessus de la classe de 4e. La salle est inutilisable les jours de pluie.",
    updates: [
      {
        date: "20/08/2026",
        auteur: "Aminata Traoré",
        texte: "Visite effectuée avec le proviseur. Devis de réparation demandé à la direction régionale.",
      },
    ],
  },
  {
    id: "SIG-2026-0142",
    sujet: "Bouche d’égout ouverte sur le trottoir",
    categorie: "Voirie et routes",
    lieu: "Abidjan, Adjamé",
    recu: "18/08/2026",
    delai: "18/08",
    auteur: "Citoyen #0902",
    statut: "encours",
    publie: true,
    responsable: "Salif Ouattara",
    contenu: "Plaque manquante sur un trottoir très fréquenté, à côté d’un arrêt de gbaka.",
    updates: [
      { date: "18/08/2026", auteur: "Salif Ouattara", texte: "Zone balisée par les riverains, photo transmise au district d’Abidjan." },
      { date: "20/08/2026", auteur: "Salif Ouattara", texte: "Intervention annoncée pour la semaine du 25/08." },
    ],
  },
  {
    id: "SIG-2026-0141",
    sujet: "Fuite d’eau sur la conduite principale",
    categorie: "Eau et assainissement",
    lieu: "San-Pédro, Bardot",
    recu: "15/08/2026",
    delai: "15/08",
    auteur: "Citoyen #0888",
    statut: "resolu",
    publie: true,
    responsable: "Aminata Traoré",
    contenu: "Fuite continue depuis trois jours à l’angle de la rue du marché, chaussée inondée.",
    updates: [
      { date: "16/08/2026", auteur: "Aminata Traoré", texte: "Signalement transmis au service des eaux, référence SODECI 8842." },
      { date: "19/08/2026", auteur: "Aminata Traoré", texte: "Réparation effectuée le 19/08. Signalement clôturé après vérification sur place." },
    ],
  },
  {
    id: "SIG-2026-0140",
    sujet: "Nid de poule à l’entrée du marché",
    categorie: "Voirie et routes",
    lieu: "Cocody, Angré 7e tranche",
    recu: "12/08/2026",
    delai: "12/08",
    auteur: "Citoyen #0861",
    statut: "resolu",
    publie: true,
    responsable: "Konan Yao",
    contenu: "Affaissement de la chaussée gênant les livraisons du matin.",
    updates: [
      { date: "13/08/2026", auteur: "Konan Yao", texte: "Transmis à la mairie de Cocody avec les photos du signalant." },
      { date: "18/08/2026", auteur: "Konan Yao", texte: "Rebouchage réalisé le 17/08. Le citoyen a confirmé la réparation." },
    ],
  },
  {
    id: "SIG-2026-0139",
    sujet: "Affichage politique sur un mur d’école",
    categorie: "Autre",
    lieu: "Bouaké, Belleville",
    recu: "10/08/2026",
    delai: "10/08",
    auteur: "Citoyen #0844",
    statut: "rejete",
    publie: false,
    responsable: "Salif Ouattara",
    contenu: "Affiches collées sur le mur de l’école primaire publique.",
    updates: [
      {
        date: "11/08/2026",
        auteur: "Salif Ouattara",
        texte: "Hors périmètre du dispositif : signalement redirigé vers la commission électorale locale.",
      },
    ],
  },
];

export const CATEGORIES_SIGNALEMENT = [
  "Voirie et routes",
  "Éclairage public",
  "Insalubrité et déchets",
  "Eau et assainissement",
  "Sécurité routière",
  "Infrastructure scolaire",
  "Autre",
] as const;

export const RESPONSABLES = ["Aminata Traoré", "Konan Yao", "Salif Ouattara", "Mariam Bakayoko"] as const;

export const STATUT_META: Record<SignalementStatut, { label: string; tone: "orange" | "blue" | "neutral" | "outline" }> = {
  validation: { label: "En validation", tone: "orange" },
  encours: { label: "En cours", tone: "blue" },
  resolu: { label: "Résolu", tone: "neutral" },
  rejete: { label: "Rejeté", tone: "outline" },
};

export function updatesLabel(count: number): string {
  if (count === 0) return "aucune mise à jour";
  if (count === 1) return "1 mise à jour";
  return `${count} mises à jour`;
}

export const ETAPES: { statut: SignalementStatut; label: string }[] = [
  { statut: "validation", label: "En validation" },
  { statut: "encours", label: "En cours" },
  { statut: "resolu", label: "Résolu" },
];
