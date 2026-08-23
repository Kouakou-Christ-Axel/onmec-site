export interface NotificationEnvoyee {
  titre: string;
  destinataires: string;
  date: string;
  recuePar: string;
  ouverture: string;
  ouvertureForte: boolean;
}

export const NOTIFICATIONS_ENVOYEES: NotificationEnvoyee[] = [
  { titre: "Passage piéton de Marcory : dossier transmis à la mairie", destinataires: "Tous les utilisateurs", date: "20/08/2026", recuePar: "2 140", ouverture: "38 %", ouvertureForte: true },
  { titre: "Caravane à Bouaké : rendez-vous samedi", destinataires: "Bénévoles vérifiés", date: "15/08/2026", recuePar: "2 090", ouverture: "44 %", ouvertureForte: true },
  { titre: "Guide du jeune citoyen disponible", destinataires: "Tous les utilisateurs", date: "06/08/2026", recuePar: "1 980", ouverture: "31 %", ouvertureForte: false },
];

export const CIBLES_NOTIFICATION = [
  "Tous les utilisateurs (2 340)",
  "Bénévoles vérifiés (214)",
  "Ambassadeurs campus (46)",
  "Utilisateurs d’Abidjan (1 380)",
] as const;

export const MOMENTS_ENVOI = ["Immédiat", "Demain 08 h 30", "Lundi 26/08, 07 h 00"] as const;
