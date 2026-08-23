export interface Utilisateur {
  nom: string;
  email: string;
  role: string;
  derniereConnexion: string;
  etat: "Actif" | "Invitation";
}

export const UTILISATEURS: Utilisateur[] = [
  { nom: "Aminata Traoré", email: "a.traore@mec-ci.org", role: "Administratrice nationale", derniereConnexion: "Aujourd’hui, 07 h 40", etat: "Actif" },
  { nom: "Nadia Koffi", email: "n.koffi@mec-ci.org", role: "Chargée de communication", derniereConnexion: "Hier, 18 h 05", etat: "Actif" },
  { nom: "Konan Yao", email: "k.yao@mec-ci.org", role: "Modérateur — vérification", derniereConnexion: "Aujourd’hui, 08 h 12", etat: "Actif" },
  { nom: "Salif Ouattara", email: "s.ouattara@mec-ci.org", role: "Modérateur — vérification", derniereConnexion: "19/08, 09 h 05", etat: "Actif" },
  { nom: "Mariam Bakayoko", email: "m.bakayoko@mec-ci.org", role: "Coordination campus — lecture", derniereConnexion: "12/08, 16 h 22", etat: "Invitation" },
  { nom: "Yves N’Guessan", email: "y.nguessan@mec-ci.org", role: "Rédacteur", derniereConnexion: "—", etat: "Invitation" },
];
