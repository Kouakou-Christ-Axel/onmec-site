# Refonte du catalogue /ressources — grille → tableau

## Contexte

Item 2 des écarts de design identifiés entre la maquette Claude Design mise à jour
(`Site MEC.dc.html`, projet "MEC Design System") et l'implémentation actuelle : la maquette
remplace la grille de cartes `/ressources` par un tableau avec colonnes format/thème/accès/
téléchargements, des filtres format/accès en plus du thème et de la recherche déjà présents, un
tri, une pagination, et un bouton "aperçu" ouvrant un feuilletage plein écran. Documenté comme hors
scope dans `docs/superpowers/specs/2026-08-24-theme-sombre-mec-design.md` (§ Hors scope explicite)
et traité ici séparément, après l'item 1 (pages système 404/500/403/Maintenance, livré et vérifié).

Décisions de scope validées avec l'utilisateur (AskUserQuestion) :

- **Données statiques** : les nouveaux champs restent codés en dur dans
  `features/ressources/data/ressources.ts`, comme `pages`/`weight`/`downloads` le sont déjà. Aucun
  contrat `onmec_backend` n'est modélisé — cohérent avec `download-dialog.tsx` qui n'appelle déjà
  aucun endpoint.
- **Tag accès informatif** : "Public"/"Adhérents" s'affiche mais ne bloque rien. Aucun espace
  membre n'existe dans ce projet (voir le commentaire dans `app/(public)/forbidden.tsx`) — ajouter
  une notion d'auth sur cette page serait hors scope.
- **Tableau desktop, cartes mobile** : le tableau (6-7 colonnes) s'affiche à partir de `lg`
  (≥1024px). En dessous, la grille `RessourceCard` actuelle reste inchangée, y compris son
  comportement de clic (carte entière = lien vers la fiche détail).
- **Aperçu placeholder, pas de vrai feuilletage** : aucun fichier PDF réel n'existe dans le projet
  (couvertures = `PhotoPlaceholder`). L'overlay "aperçu" affiche la couverture placeholder et les
  métadonnées, sans rendu page par page. Un vrai feuilletage nécessiterait soit des images de page
  factices à produire, soit une lib de rendu PDF — hors scope de cette passe.

## Modèle de données

`features/ressources/types/ressource.ts` — deux champs ajoutés au type `Ressource`, deux nouveaux
types exportés :

```ts
export type Format = "PDF" | "DOCX" | "PNG";
export type Acces = "Public" | "Adhérents";

export type Ressource = {
  slug: string;
  title: string;
  theme: Theme;
  format: Format; // nouveau
  acces: Acces; // nouveau
  pages: number;
  weight: string;
  date: string;
  downloads: number;
  excerpt: string;
  body: string;
};
```

Pas de champ "fichier" séparé : `weight` (poids) et `format` (type) couvrent ensemble ce que la
maquette appelle "fichier" ; ajouter un troisième champ serait redondant.

`features/ressources/data/ressources.ts` — les 9 guides existants reçoivent des valeurs `format`/
`acces` cohérentes avec leur contenu (majoritairement `"PDF"`/`"Public"`, avec au moins une
variante `"DOCX"` ou `"PNG"` et une ressource `"Adhérents"` pour que le rendu du tableau ne soit pas
monotone — répartition exacte laissée à l'implémentation, sans contrainte narrative particulière).

## Architecture des composants

`ressource-filter.tsx` (106 lignes aujourd'hui) ne peut pas absorber filtres format/accès + tri +
pagination + table sans dépasser largement les 200 lignes de `CLAUDE.md`. Décomposition :

- **`components/features/ressources/ressource-catalog.tsx`** (nouveau, remplace `ressource-filter.tsx`
  comme composant monté par `app/(public)/ressources/page.tsx`) : orchestrateur `"use client"`.
  État : `query`, `theme`, `format`, `acces`, `sort`, `page`. Calcule via `useMemo` la liste
  filtrée → triée → paginée à partir de `RESSOURCES`. Rend `RessourceToolbar`, puis en parallèle
  `RessourceTable` (`hidden lg:block`) et la grille `RessourceCard` existante (`lg:hidden`) sur la
  **même page courante**, puis `RessourcePagination`. Réinitialise `page` à `1` quand un filtre ou
  le tri change.
- **`components/features/ressources/ressource-toolbar.tsx`** : recherche (reprise telle quelle de
  `ressource-filter.tsx`) + pastilles thème (reprises telles quelles) + deux `<select>` format/accès
  (réutilisent `SelectInput` de `form-controls.tsx`) + `<select>` tri. Reçoit l'état et les setters
  en props depuis `ressource-catalog.tsx` (pas d'état local dupliqué).
- **`components/features/ressources/ressource-table.tsx`** : table desktop uniquement. Colonnes :
  miniature (`PhotoPlaceholder` réduit), titre + extrait, thème, format, accès, téléchargements
  (`formatCount`), bouton "Aperçu". Le titre reste un lien vers `/ressources/{slug}` (parité avec
  le comportement carte). Reçoit `onPreview(slug)` en prop.
- **`features/ressources/lib/sort-ressources.ts`** : fonction pure
  `sortRessources(list: Ressource[], sort: SortKey): Ressource[]` — ne mute pas `list`, retourne un
  nouveau tableau trié. Les 4 modes : `"recent"` (date desc), `"az"` (title, `localeCompare`
  français), `"downloads"` (downloads desc), `"pages"` (pages desc). `SortKey` exporté depuis ce
  fichier. Testable isolément (pas de dépendance React).
- **`components/features/ressources/ressource-pagination.tsx`** : composant présentationnel pur —
  props `page`, `totalPages`, `onChange`. Bouton précédent/suivant + numéros de page. Ne s'affiche
  pas (retourne `null`) si `totalPages <= 1`.
- **`components/features/ressources/ressource-preview-overlay.tsx`** : overlay plein écran,
  `"use client"`, même patron que `download-dialog.tsx` (`fixed inset-0` + `bg-overlay-scrim` +
  `role="dialog"` `aria-modal` + fermeture Échap + focus renvoyé au déclencheur à la fermeture).
  Contenu : couverture `PhotoPlaceholder` grand format, titre, thème, format/poids/pages, extrait,
  et un lien "Voir la fiche complète →" vers `/ressources/{slug}` (pas de duplication du formulaire
  de téléchargement par e-mail, qui reste uniquement sur la page détail via `DownloadDialog`).
  Monté une seule fois par `ressource-catalog.tsx`, piloté par l'état `previewSlug: string | null`.

`components/features/ressources/ressource-card.tsx` : édition mineure, pas de réécriture — ajoute
un badge format à côté du badge thème existant (cohérence visuelle avec la nouvelle colonne format
du tableau). Le comportement de clic (carte entière = lien) et l'absence de bouton "aperçu" sur
mobile restent inchangés.

`app/(public)/ressources/page.tsx` : `<RessourceFilter ressources={RESSOURCES} />` devient
`<RessourceCatalog ressources={RESSOURCES} />`.

`ressource-filter.tsx` est supprimé une fois `ressource-catalog.tsx` + `ressource-toolbar.tsx` en
place (pas de renommage — le fichier n'a plus de raison d'exister sous ce nom, son contenu est
redistribué).

## Comportement filtre / tri / pagination

- Recherche et filtre thème : logique identique à l'existant (`toLowerCase().includes`).
- Filtre format / accès : `"Tous les formats"` / `"Tous les accès"` par défaut (même patron que
  `"Tous les thèmes"` actuel), sinon égalité stricte.
- Tri par défaut au chargement : `"recent"` (cohérent avec l'ordre de la maquette, qui liste "Plus
  récents" en premier). L'ordre actuel du tableau `RESSOURCES` n'est pas chronologique — le tri
  "recent" doit explicitement comparer les dates, ne pas se reposer sur l'ordre du tableau.
- Pagination : 9 éléments par page (parité avec la grille 3×3 mobile actuelle). Avec 9 ressources
  aujourd'hui, ça affiche une seule page — attendu, la mécanique doit simplement être prête pour la
  croissance du catalogue.
- `RessourceTable` et la grille mobile de secours affichent la **même page courante** de la même
  liste filtrée/triée — pas deux états de pagination indépendants.

## Vérification

- `pnpm run typecheck`, `pnpm run lint`, `pnpm run test`.
- Vérification manuelle via chrome-devtools (clair + sombre, desktop + mobile) : filtre par thème
  puis par format puis par accès (cumulés), recherche, chaque mode de tri, navigation de page (même
  si une seule page avec les données actuelles — vérifier que "Page 1 sur 1" ne casse rien), overlay
  aperçu ouvert/fermé (clic, Échap, clic sur l'overlay), page détail `/ressources/[slug]` toujours
  fonctionnelle (aucun changement de contrat n'affecte `ressource-header.tsx`/`ressource-body.tsx`).
- `convention-drift-check` sur le diff avant de committer, comme pour les deux passes précédentes de
  cette session.

## Hors scope explicite

- Vrai rendu de fichier / feuilletage page par page.
- Notion d'authentification ou de restriction réelle liée au tag "Adhérents".
- Contrat `onmec_backend` pour les ressources (reste 100% statique).
- Bouton "aperçu" sur la grille mobile (mobile continue de taper la carte entière → fiche détail).
