# Plan — Pages système (404 / 500 / 403 / Maintenance)

Suit la spec `docs/superpowers/specs/2026-08-25-pages-systeme-mec-design.md`.

## 1. Composants partagés

- [x] `components/features/site/error-page-banner.tsx` : bandeau plein-largeur réutilisable
      (fond, nombre, eyebrow, titre + segment italique, description, 1-2 CTA).
- [x] `components/features/site/error-explore-links.tsx` : grille de 4 raccourcis ("Où aller
      maintenant") + ligne de contact, montée en pied de 404/500/403.

## 2. Écrans

- [x] `app/(public)/not-found.tsx` : bandeau orange (404), bloc "Chercher" (champ + bouton, `<form>`
      client qui redirige vers `/ressources?q=...`), pages les plus consultées, `ErrorExploreLinks`.
- [x] `app/(public)/error.tsx` (nouveau, `"use client"`, props `{error, reset}`) : bandeau bleu (500),
      "Réessayer" → `reset()`, "Retour à l'accueil", liste "ce qui fonctionne quand même",
      `ErrorExploreLinks`. `console.error(error)` en effet côté client.
- [x] `app/(public)/forbidden.tsx` (nouveau) : bandeau bleu (403), CTA "Me connecter"/"Rejoindre le
      mouvement" (les deux vers `/rejoindre` — voir Écarts spec), 2 cartes, `ErrorExploreLinks`.
- [x] `app/(public)/maintenance/page.tsx` (nouveau) : bandeau orange (503), "Réessayer maintenant"
      (rechargement client), "Nous écrire" → `/contact`, liste "pendant la maintenance". Pas de
      `ErrorExploreLinks` (voir Écarts spec).

## 3. Vérification

- [x] Chaque écran déclenché manuellement pendant le dev (URL inexistante pour 404 ; route
      temporaire `throw new Error(...)` pour 500 ; route temporaire `forbidden()` pour 403 ;
      navigation directe pour `/maintenance`) et capturé via chrome-devtools, clair + sombre,
      desktop + mobile. Déclencheurs temporaires retirés après capture. Un piège trouvé au passage :
      les dossiers de test nommés `_test-xxx` sont traités comme des dossiers privés Next.js (exclus
      du routing) — renommés `zztest-xxx` pour être réellement routables, puis supprimés.
- [x] `pnpm run typecheck`, `pnpm run lint`, `pnpm run test` : verts.
- [x] `convention-drift-check` sur les fichiers créés. Un point corrigé : `maintenance/page.tsx`
      était entièrement `"use client"` pour un seul bouton interactif — seule page publique à le
      faire (`not-found.tsx`/`error.tsx` gardent leur bloc interactif dans un petit composant client
      dédié). Extrait en `components/features/site/maintenance-retry-button.tsx`, `ErrorPageBanner`
      accepte maintenant `primary`/`secondary` en `BannerAction` **ou** `ReactNode` pour permettre
      ce genre d'îlot client sans forcer toute la page à devenir client. `maintenance/page.tsx`
      redevenu Server Component. Retypecheck/lint/test verts après correction.

## Écarts vs la spec initiale (découverts pendant l'implémentation)

- **Redémarrage du serveur dev nécessaire** : `forbidden.tsx`/`error.tsx` n'étaient pas détectés par
  le serveur vinext déjà lancé (route graph calculé au démarrage) — un redémarrage a suffi, rien à
  changer côté code, mais à savoir pour la prochaine fois qu'un fichier spécial est ajouté en cours
  de session dev.
- **`suppressHydrationWarning` ajouté sur `<html>`** (`app/layout.tsx`) : le script anti-flash pose
  `data-mec-mode`/`data-mec-theme` avant l'hydratation React, ce qui produisait un avertissement de
  mismatch d'hydratation dans la console à chaque navigation (attendu et documenté par tous les
  patrons "anti-flash de thème", mais bruyant) — supprimé explicitement plutôt que laissé comme bruit
  de fond.
