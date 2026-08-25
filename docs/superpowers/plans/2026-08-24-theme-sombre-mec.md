# Plan — Thème sombre + écarts de design

Suit la spec `docs/superpowers/specs/2026-08-24-theme-sombre-mec-design.md`.

## 1. Infrastructure thème

- [x] `app/globals.css` : tokens sémantiques ajoutés au bloc `@theme` (table complète de la spec),
      `--color-muted-foreground` conservé tel quel (réutilisé par `/admin`, non fusionné — voir
      Écarts) et `--color-text-muted` ajouté à part. Bloc `html[data-mec-theme="dark"]
      [data-mec-public] { … }` (scope ajouté, voir Écarts) avec toutes les valeurs sombres.
      `@custom-variant dark (&:where(html[data-mec-theme="dark"] [data-mec-public], html[data-mec-theme="dark"] [data-mec-public] *));`.
      `--shadow-stamp` change bien de couleur (bleu → orange) sous le bloc sombre. `body { color:
      var(--color-text-body) }`.
- [x] `components/features/site/theme-toggle.tsx` (nouveau, `"use client"`) : logique portée de
      `mec-theme.js` (3 états auto/light/dark, `localStorage`, `matchMedia` pour `auto`), icône
      pilotée en CSS pur (`data-mec-mode`/`data-mec-icon`).
- [x] `app/layout.tsx` : script inline bloquant dans `<head>` qui pose `data-mec-mode`/
      `data-mec-theme` sur `<html>` avant le premier paint.
- [x] `components/features/site/site-header.tsx` : `bg-[#faf8f5]/90` → `bg-surface-blur`,
      `<ThemeToggle />` inséré avant le bouton "Rejoindre le mouvement".
- [x] Logo header : `mec-lockup.png`/`mec-reversed.png` superposés avec `dark:hidden`/
      `hidden dark:block`. Footer : inchangé (utilisait déjà `mec-reversed.png` en dur, fond
      `bg-blue-800` fixe dans les deux thèmes — pas de swap nécessaire).
- [x] `components/features/ressources/download-dialog.tsx` : `bg-ink/50` → `bg-overlay-scrim`,
      `bg-white` → `bg-surface-card` (carte modale).
- [x] `components/features/site/photo-placeholder.tsx` : `dark:brightness-[.86]
      dark:saturate-[.94]` sur le conteneur (tous les placeholders, pas seulement `duotone`, pour
      matcher la règle `.mec-photo` de la maquette).

## 2. Vérification thème sombre sur chaque route publique

- [x] `pnpm run dev`, bascule clair/sombre via le bouton, vérification visuelle chrome-devtools des
      deux modes sur : `/`, `/apropos`, `/actions`, `/actualites`, `/actualites/bilan`, `/ressources`,
      `/ressources/g1`, `/contact`, `/rejoindre`, `/admin` (non-régression), et un slug inconnu
      (`not-found.tsx`).
- [x] Contraste vérifié et corrigé où cassé (voir Écarts : `bg-ink`+`text-white`, `bg-white`+
      `text-ink`). `shadow-stamp` passe bien à l'orange en sombre.
- [x] Persistance du thème après rechargement (`localStorage`), pas de flash constaté.

## 3. Écarts de design (par page, indépendants du thème)

- [x] Accueil : `hero.tsx` (hauteur mini retirée, `bg-orange-500` → `bg-brand-flat`),
      `actions-grid.tsx` (hover retiré uniquement sur la carte centrale).
- [x] Actualités : `features/actualites/types/article.ts` + `data/articles.ts` + `article-header.tsx`
      (champ `service` optionnel, peuplé uniquement pour "bilan" = "Secrétariat général").
- [x] Actions : `hero.tsx` (grille 2 colonnes `1.15fr .85fr`, `bg-orange-500` → `bg-brand-flat`),
      `action-cta.tsx` (section pleine largeur sans carte ni motif, boutons en rangée, grille
      `1.25fr .75fr`), `timeline.tsx` (filet sous l'année, plus au-dessus du bloc).
- [x] Contact : `contact-form.tsx` (4 placeholders), `contact-confirmation.tsx` (icône seule, sans
      badge circulaire), `contact-cta.tsx` (carte + motif retirés, section pleine largeur).

## 4. Vérification finale

- [x] `pnpm run typecheck`, `pnpm run lint`, `pnpm run test` : verts.
- [x] Revue visuelle chrome-devtools desktop (1440px) et mobile (390px), clair ET sombre.
- [x] `convention-drift-check` sur les fichiers touchés (pas de diff git propre disponible, le site
      public entier était déjà non-commité avant cette tâche — l'agent a retrouvé les fichiers via
      grep sur les nouveaux tokens). Verdict : propre. Un point corrigé (`ressource-filter.tsx` :
      `bg-n-50/95 backdrop-blur-sm` → `bg-surface-blur backdrop-blur-sm`, le token dédié introduit
      par cette même passe pour ce patron). Un point noté sans action : `app/globals.css` dépasse les
      200 lignes (256) — lecture de l'agent : la croissance reflète le doublement du tableau de
      tokens clair sous le sélecteur sombre, un bloc `@theme` plat ne se découpe pas selon la règle
      de layering du projet, exception plausible pour un fichier de tokens CSS.

## Écarts vs la spec initiale (découverts pendant l'implémentation)

- **Scope `[data-mec-public]` ajouté** : la spec initiale proposait `html[data-mec-theme="dark"]`
  seul. Constaté pendant l'implémentation que `/admin` réutilise les mêmes tokens de couleur
  (`n-*`, `border-subtle`, `muted-foreground`, `ink`…) sans avoir été conçu pour le mode sombre —
  sans scope, activer le thème sombre sur le site public aurait aussi basculé `/admin` (même
  `<html>` racine, `localStorage` partagé). Solution : wrapper `data-mec-public` posé une seule fois
  dans `app/(public)/layout.tsx`, sélecteur `html[data-mec-theme="dark"] [data-mec-public]`.
  Vérifié : `/admin` reste inchangé après bascule sombre sur le site public (screenshot
  chrome-devtools).
- **`--color-muted-foreground` non fusionné dans `--color-text-muted`** (contrairement à la spec) :
  `muted-foreground` est utilisé par ~15 fichiers admin. Fusionner aurait fait dériver leur couleur
  sous le bloc sombre scope public (aucun risque réel puisque scope à `/admin` exclu, mais aurait
  créé une dépendance croisée fragile entre les deux design systems). Choix : deux tokens distincts,
  `text-muted-foreground` reste réservé à l'admin, `text-text-muted` au site public.
- **Bug de contraste non anticipé par la spec, trouvé en vérification visuelle** : plusieurs pilules/
  badges utilisaient `bg-ink text-white` (icône de statut, tags actifs de filtre, badge thème de
  ressource) — `ink` s'inverse en sombre (devient clair), donc le texte blanc fixe devenait
  invisible. Corrigé en `bg-ink text-surface-page` (les deux tokens s'inversent ensemble, comme le
  fait `.mec-tag--active{color:var(--surface-page)}` dans `mec-dark.css`). Fichiers : `ressource-
  card.tsx`, `ressource-filter.tsx`, `news-filter.tsx`, `form-sidebar.tsx`. Même bug inverse sur le
  bouton blanc du hero d'accueil (`bg-white text-ink` → `bg-white text-fill-ink`, `fill-ink` reste
  sombre dans les deux thèmes contrairement à `ink`).
- **`app/(public)/layout.tsx` : `min-h-screen` ajouté** au wrapper `data-mec-public` — sans ça, une
  page courte (ex. `not-found.tsx`) laissait apparaître le fond clair de `<body>` sous le footer
  quand le contenu est plus court que le viewport.
- **Tokens `Institutionnel`/`getArticleBySlug` (`features/actualites/data/articles.ts`)** : hex
  `text-[#2b3646]` manqué par le premier passage de nettoyage (portée initialement limitée à
  `components/features/`, pas `features/`) — trouvé en vérification visuelle (tag illisible), corrigé
  en `text-text-body`.
