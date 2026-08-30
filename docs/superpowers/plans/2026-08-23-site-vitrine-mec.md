# Plan — Site vitrine MEC

Suit la spec `docs/superpowers/specs/2026-08-23-site-vitrine-mec-design.md`.

## 1. Fondations

- [x] Assets : logos PNG décodés depuis le projet Claude Design → `public/assets/logo/`.
- [x] `lucide-react` ajouté aux dépendances (version exacte).
- [x] `app/globals.css` : bloc `@theme` avec les tokens couleurs/typo/espacement/forme/mouvement du
      design system (namespaces Tailwind v4 vérifiés via Context7 avant d'écrire les noms de
      variables).
- [x] `app/layout.tsx` : `<link>` Google Fonts (Instrument Sans/Serif), métadonnées mises à jour
      (titre/description MEC), garde `QueryProvider` existant.
- [x] Composant `components/features/site/reveal.tsx` (`"use client"`) portant l'animation
      `data-reveal` (IntersectionObserver + repli `prefers-reduced-motion`).

## 2. Composants partagés (`components/features/site/`)

- [x] `site-header.tsx` (nav + logo + CTA "Rejoindre le mouvement"), `site-footer.tsx` — montés dans
      `app/layout.tsx`. Ajout non prévu au plan initial : `mobile-nav.tsx` (menu hamburger `lg:hidden`,
      la maquette étant desktop-only elle n'offrait pas de repli mobile à copier).
- [x] `article-card.tsx`, `stat.tsx`, `photo-placeholder.tsx`, `category-tag.tsx`, `todo-page.tsx`
      (remplace `.mec-photo__ph` et le sélecteur `[data-cat]` du design system).
- [x] Données statiques `features/actualites/data/articles.ts`,
      `features/apropos/data/cibles.ts` (cibles/valeurs/bureau), `features/rejoindre/data/options.ts`
      (profils, statuts, dispos, intérêts) — typées, pas de `any`.

## 3. Pages

- [x] `app/page.tsx` (accueil) : hero, stats, 3 cartes actions, 3 articles récents, partenaires,
      bandeau rejoindre. Composée de sous-composants dans `components/features/accueil/`.
- [x] `app/apropos/page.tsx` : hero, mission, mot du président, cibles (3 cartes + barres), vision,
      bureau exécutif, CTA rejoindre.
- [x] `app/actualites/page.tsx` : hero + filtre catégories (client, état local) + à la une + grille.
- [x] `app/actualites/[slug]/page.tsx` : gabarit détail article (sommaire sticky, corps, citation,
      encart rapport, articles liés) piloté par `articles.ts` (404 via `notFound()` si slug inconnu).
      Seul l'article "bilan" a un corps riche fidèle à la maquette ; les 8 autres affichent un corps
      générique (extrait + mention "contenu à venir") — décision de spec, pas un oubli.
- [x] `app/rejoindre/page.tsx` : formulaire long (profil / coordonnées / engagement / validation),
      client component, état "envoyé" local, pas d'appel réseau (vérifié en conditions réelles :
      remplissage + soumission → écran de confirmation).
- [x] `app/contact/page.tsx` : à l'origine un composant partagé `components/features/site/todo-page.tsx`
      alimenté par une table de contenu par route (`features/site/data/todo-pages.ts`). **Remplacé
      par la vraie implémentation en §3ter** une fois l'écran redécouvert dans la maquette ; les deux
      fichiers `todo-page.tsx`/`todo-pages.ts` ont été supprimés (voir §3ter et Écarts).

## 3bis. Actions et Ressources (addendum — écrans redécouverts dans la maquette)

- [x] `features/actions/` : types (`Programme`, `ChronoAnnee`), données (`programmes.ts` — 3
      programmes, `chronologie.ts` — 2026/2025) portées depuis `PROG`/`CHRONO` de la maquette.
- [x] `components/features/actions/` : hero (bandeau orange + 3 stats), grille des 3 programmes
      (variant "compact"), chronologie compacte par année (même variant, cohérent avec le choix
      de page), CTA "Accueillir une action" (deux boutons → `/rejoindre`, `/ressources`).
- [x] `app/actions/page.tsx` : compose les sections ci-dessus, remplace le placeholder `TodoPage`.
- [x] `features/ressources/` : types (`Ressource`), données (`ressources.ts` — 9 guides + thèmes +
      `getRessourceBySlug`/`getRelatedRessources`, même patron que `articles.ts`).
- [x] `components/features/ressources/` : hero (2 stats), filtre catalogue (client : recherche +
      thèmes, variant "grille", état vide), carte guide, page détail (photo sticky + fiche
      chiffrée + dialogue de téléchargement client sans appel réseau + ressources liées), CTA
      "Écrire avec nous".
- [x] `app/ressources/page.tsx`, `app/ressources/[slug]/page.tsx` : remplace le placeholder
      `TodoPage`, gabarit détail générique (pas de cas "bilan" ici : les 9 guides ont un corps réel).
- [x] `features/site/data/todo-pages.ts` : retirer les entrées `actions`/`ressources` devenues
      mortes (seul `contact` reste `isTodo`).
- [x] Responsive mobile-first (mêmes règles que §4), `convention-drift-check`, vérification visuelle
      chrome-devtools desktop + mobile.

## 4. Responsive (écart assumé vs la maquette desktop-only)

- [x] Grilles 3/4 colonnes → 1 col mobile / 2 col `sm:` / 3-4 col `lg:`.
- [x] Mises en page `contenu + aside sticky` (article, rejoindre) → aside en dessous du contenu sous
      `lg:`.
- [x] Nav header → menu hamburger mobile complet (pas une simplification : tous les liens de
      `NAV_LINKS` y sont, partagés avec le header desktop via `features/site/data/nav-links.ts`).

## 5. Vérification

- [x] `pnpm run typecheck` et `pnpm run lint` verts (vérifié après chaque lot de fichiers via le hook
      post-edit, puis en repasse complète).
- [x] `pnpm run dev`, revue visuelle de chaque route en desktop (1440px) **et** mobile (390px) via
      chrome-devtools : accueil, à propos, actualités (liste + filtre), article (bilan + générique),
      rejoindre (formulaire + soumission), actions (placeholder todo).
- [x] `convention-drift-check` sur le diff. Rien de bloquant ; deux corrections appliquées ensuite :
      export mort `CATEGORY_ACCENT` supprimé, `features/apropos/data/cibles.ts` renommé en
      `apropos-content.ts` (le fichier exporte `CIBLES`, `VALEURS` et `BUREAU`, pas seulement les
      cibles), export `Hero` de l'accueil renommé `AccueilHero` pour cohérence avec
      `AproposHero`/`RejoindreHero`.

## Écarts vs la spec initiale (découverts pendant l'implémentation)

- Le motif `--pattern-dots` utilise `currentColor` : appliqué naïvement sur le bandeau "Rejoindre"
  (texte blanc plein), les points ressortaient bien plus visibles que dans la maquette (qui prévient
  explicitement de ce piège dans `tokens/shape.css`). Corrigé en isolant le motif dans une couche
  `absolute inset-0 text-white/10` séparée du texte.
- `lucide-react@1.33.0` (version pinnée du projet) ne fournit plus les icônes de marque
  `Facebook`/`Twitter`/`Linkedin` (retirées de la librairie). Suivant la consigne explicite de la
  tâche pour ce cas précis, la ligne "Partager" du détail ressource (`ressource-header.tsx`)
  affiche `Share2` sur ces trois emplacements, différenciés uniquement par leur `aria-label`/`title`
  ("Partager sur Facebook/Twitter/LinkedIn"), et garde `Link2` pour "Copier le lien" — donc 4
  emplacements visuellement proches mais restant accessibles individuellement.
- `components/features/site/stat.tsx` : ajout de deux props optionnelles `labelClassName` et
  `borderClassName` (défauts inchangés : `text-ink`/`border-ink`) pour permettre la variante
  blanc-sur-orange du hero `/actions` (bordure `border-white/50`) sans dupliquer le composant.
  Rétrocompatible avec l'unique usage existant (`impact-stats.tsx`).
- Barre de filtre `/ressources` : la maquette source (`NewsFilter`) n'a aucun positionnement sticky,
  mais la tâche demandait explicitement "sticky sous le header". Choix : `sticky top-[72px]`
  (hauteur exacte de `SiteHeader`, `sticky top-0 h-[72px]`), fond `bg-n-50/95 backdrop-blur-sm` pour
  éviter qu'une carte défilante ne transparaisse sous la barre.
- Hero `/ressources` : la spec de l'addendum ne précise pas de fond particulier pour ce hero
  (contrairement à `/actions`, explicitement `bg-orange-500` + `--pattern-stripes`). Traitement
  neutre retenu par défaut, aligné sur `app/actualites/page.tsx` (fond page standard, pas de bandeau
  coloré), avec les stats en `Stat` par défaut (`text-ink`/`border-ink`).
- `components/features/contact/contact-confirmation.tsx` : la spec distingue un bouton "secondaire"
  ("Écrire un autre message") d'un bouton "ghost" ("Parcourir les ressources"), une nuance sans
  précédent exact dans le reste du site (qui n'utilise jusqu'ici que primaire orange / secondaire
  `border-ink/24`). Choix : "secondaire" = le style `border-ink/24` déjà établi partout ; "ghost" =
  même forme sans bordure, seulement `hover:bg-n-100` — extrapolation raisonnable, pas un token
  existant.
- `components/features/contact/contact-form.tsx` : la case à cocher de consentement RGPD-like
  ("J'accepte que le MEC conserve mes coordonnées…") désactive le bouton d'envoi tant qu'elle n'est
  pas cochée, sur le même patron que les cases de consentement de `join-form.tsx` — la spec ne le
  demandait pas explicitement pour Contact, mais c'est cohérent avec le seul autre formulaire du site
  qui a une case de consentement équivalente.
- Suppression de `components/features/site/todo-page.tsx` et `features/site/data/todo-pages.ts`
  (point 6 de la tâche) : Galerie et Rapports n'ont aucune route dans ce projet (confirmé hors scope
  par la spec), donc aucune régression actuelle. Mais si ces routes sont ajoutées un jour, le
  placeholder générique `isTodo` qu'elles étaient censées réutiliser n'existe plus — à recréer à ce
  moment-là, pas un oubli de cette passe.
- Incohérence pré-existante repérée, non corrigée (hors scope de cette tâche) :
  `components/features/rejoindre/form-sidebar.tsx` annonce "nous répondons sous deux jours ouvrés"
  alors que `/contact` (maquette `isContact`) annonce "Sous 3 jours ouvrés". Les deux valeurs
  viennent chacune fidèlement de leur écran respectif dans la maquette — pas une erreur introduite
  ici.
- Renommage post-`convention-drift-check` : `resource-card.tsx`/`ResourceCard` et
  `resource-filter.tsx`/`ResourceFilter` renommés en `ressource-card.tsx`/`RessourceCard` et
  `ressource-filter.tsx`/`RessourceFilter` pour rester cohérents avec le vocabulaire français du
  reste de la feature (`Ressource`, `RESSOURCES`, `getRessourceBySlug`, etc.). `components/features/
rejoindre/form-controls.tsx` déplacé vers `components/features/site/form-controls.tsx` (devenu
  partagé entre `rejoindre` et `ressources` — le dialogue de téléchargement réutilise `FormField`/
  `TextInput`/`CheckboxItem`) ; `TextInput` rendu `forwardRef` pour permettre l'autofocus du champ
  email du dialogue.

## 3ter. Contact (addendum bis — écran redécouvert dans la maquette)

- [x] `features/contact/` : types (`ContactCard` dans `types/contact.ts` pour la carte "Contacts par
      sujet"), données (`OBJETS_CONTACT` pour le `<select>`, `CONTACTS_PAR_SUJET` — 4 cartes) dans
      `data/content.ts`, portées depuis la maquette (`objets`/`contacts` dans `renderVals()`).
- [x] `components/features/contact/` : `hero.tsx` (accroche + bloc "Sous 3 jours ouvrés" via `Stat`),
      `contact-form.tsx` (client, réutilise `FormField`/`TextInput`/`SelectInput`/`TextareaInput`/
      `CheckboxItem` de `components/features/site/form-controls.tsx`, état local "envoyé" sans appel
      réseau — même règle que `join-form.tsx`), `contact-confirmation.tsx` (écran "Message reçu"),
      `contact-details.tsx` (coordonnées du siège + plan d'accès via `PhotoPlaceholder`),
      `contact-form-section.tsx` (grille formulaire/coordonnées), `contact-by-subject.tsx` (grille 4
      cartes), `contact-cta.tsx` (bandeau "Avant d'écrire", 3 raccourcis vers
      rejoindre/ressources/actions).
- [x] `app/contact/page.tsx` : compose les sections ci-dessus, remplace le placeholder `TodoPage`.
- [x] `features/site/data/todo-pages.ts` et `components/features/site/todo-page.tsx` : plus aucune
      route ne les utilisait après le remplacement de `contact` (`galerie`/`rapports` n'ont pas de
      route dans ce projet — hors scope, voir spec) — supprimés entièrement plutôt que laissés en
      code mort (grep `TodoPage`/`TODO_PAGES` vérifié vide avant suppression).
- [ ] Responsive mobile-first, `convention-drift-check`, vérification visuelle chrome-devtools
      desktop + mobile (formulaire, soumission → état "Message reçu", grille contacts).
      `convention-drift-check` fait (aucun écart trouvé) ; vérification visuelle en cours.
