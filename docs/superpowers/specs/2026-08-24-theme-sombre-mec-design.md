# Thème sombre + écarts de design — site vitrine MEC

## Contexte

Le projet Claude Design "Design du site MEC-Citoyenneté" (`Site MEC.dc.html`) a été mis à jour
depuis l'implémentation initiale (`docs/superpowers/specs/2026-08-23-site-vitrine-mec-design.md`) :
un thème sombre a été ajouté (`mec-dark.css`, `mec-theme.js`, bouton de bascule 3 états dans le
header), et plusieurs écrans déjà implémentés ont de petits écarts de design. Cette spec couvre les
deux.

Décision de scope (validée avec l'utilisateur) :

- **Inclus** : thème sombre sur tout le site public, + les écarts de design listés ci-dessous sur
  Accueil, Actualités, Actions, Contact.
- **Hors scope, reporté à une passe séparée** :
  - Les nouveaux écrans système de la maquette (`is404`/`is500`/`is403`/`isMaintenance`/`isErreur`,
    reliés depuis le footer "Pages système") — absents de la spec/plan initiaux, aucune route de nav
    dédiée actuellement dans ce projet hors `not-found.tsx`.
  - La refonte du catalogue `/ressources` (grille de cartes → tableau avec colonnes format/thème/
    accès/téléchargements, filtres format/accès/tri, pagination, overlay de feuilletage plein écran)
    — nécessite d'étendre `features/ressources/types/ressource.ts` avec de nouveaux champs, hors
    scope de cette passe. `/ressources` reçoit uniquement le thème sombre dans cette spec.
  - Le dashboard admin (`Dashboard MEC.dc.html`, `Espace membre MEC.dc.html`) : fichiers de maquette
    différents, non lus, non concernés.

## Architecture du thème

Constat clé (vérifié dans `app/globals.css`) : les tokens couleur du design system sont déjà portés
en bloc Tailwind v4 `@theme` (`--color-orange-500`, `--color-n-50`, etc.), qui génère de vraies
variables CSS custom properties sur `:root` — consommées par les classes utilitaires
(`bg-orange-500` → `var(--color-orange-500)`) **au moment de l'usage**. Conséquence : basculer le
thème revient à **redéfinir ces mêmes variables** sous un sélecteur plus spécifique que `:root`, sans
toucher au JSX des composants pour tout ce qui utilise déjà une classe Tailwind liée à un token.

- Sélecteur de bascule : `html[data-mec-theme="dark"]` (même élément que `:root`, spécificité
  supérieure → les variables se réévaluent correctement, y compris les tokens dérivés comme
  `--color-surface-sunken: var(--color-n-100)`). **Piège identifié** : les tokens qui ne peuvent
  plus dériver d'un autre en mode sombre (ex. `surface-card` ne peut plus être `var(--n-0)` car
  `n-0` reste blanc fixe) doivent être réécrits en valeur littérale sous le bloc sombre — jamais
  posés sur un `body`/`div` wrapper (spécificité insuffisante, les tokens dérivés resteraient figés
  en clair).
- Attribut piloté par script (pas de dépendance à `prefers-color-scheme` seul) : 3 états
  `auto`/`light`/`dark`, mémorisés en `localStorage`, portés depuis `mec-theme.js` quasi tel quel
  (logique éprouvée, SSR-safe : l'icône visible est pilotée en CSS pur via
  `html[data-mec-mode="x"] [data-mec-icon="x"]`, pas par un état React qui causerait un flash/
  mismatch d'hydratation).
- Script anti-flash : exécuté en inline, bloquant, dans `<head>` (`app/layout.tsx`), pose
  `data-mec-mode`/`data-mec-theme` avant le premier paint.
- `@custom-variant dark (&:where([data-mec-theme="dark"], [data-mec-theme="dark"] *));` ajouté dans
  `app/globals.css` pour disposer d'utilitaires `dark:` sur les exceptions ponctuelles (section 4).
- `color-scheme: light` / `dark` sur le même bloc (contrôle le rendu natif : scrollbars, form
  controls).
- Logo : le swap `content:url()` de la maquette n'est pas fiable cross-browser. À la place :
  `mec-lockup.png` (clair) et une variante inversée superposées, visibilité pilotée par
  `dark:hidden`/`hidden dark:block` — pas de changement de `src` en JS.

## Table de correspondance des tokens (clair → sombre)

Toutes les valeurs sombres viennent de `mec-dark.css` (design) ; les valeurs claires sont déjà dans
`app/globals.css` sauf mention "nouveau" (vient de `tokens/colors.css`/`tokens/shape.css` du design
system, jamais porté car l'implémentation initiale utilisait des classes directes plutôt que ces
alias sémantiques).

### Neutres — surfaces inversées, `n-0` fixe (sert de texte sur aplat de marque dans les 2 thèmes)

| Token | Clair | Sombre |
| --- | --- | --- |
| `--color-n-0` | `#FFFFFF` | inchangé |
| `--color-n-50` | `#FAF8F5` | `#0D1622` |
| `--color-n-100` | `#F1EEE9` | `#1A2637` |
| `--color-n-200` | `#E1DDD6` | `#26344A` |
| `--color-n-300` | `#C7C2B9` | `#3A4A64` |
| `--color-n-400` | `#9C968C` | `#6B7A92` |
| `--color-n-500` | `#746E64` | `#8D9AAF` |
| `--color-n-600` | `#544E47` | `#AEB9C9` |
| `--color-n-700` | `#3A352F` | `#CBD4E0` |
| `--color-n-800` | `#221E1A` | `#E4EAF2` |
| `--color-ink` | `#0E1B2E` | `#E9EFF7` |

### Orange — 500 fixe (couleur bouton, ne se négocie pas)

| Token | Clair | Sombre |
| --- | --- | --- |
| `--color-orange-50` | `#FFF4E8` | `#2B1D0B` |
| `--color-orange-100` | `#FFE7CC` | `#3A2810` |
| `--color-orange-200` | `#FFD199` | `#5C3F14` |
| `--color-orange-300/400/500` | inchangés | inchangés |
| `--color-orange-600` | `#E06D00` | `#FF9126` |
| `--color-orange-700` | `#B85700` | `#FFA94D` |
| `--color-orange-800` | `#8A4100` | `#FFC286` |
| `--color-orange-900` | `#5C2B00` | `#FFD9B0` |

### Bleu — 300/400 fixes

| Token | Clair | Sombre |
| --- | --- | --- |
| `--color-blue-50` | `#EEF3FC` | `#152238` |
| `--color-blue-100` | `#D8E4F8` | `#1B2B45` |
| `--color-blue-200` | `#AFC6EF` | `#243652` |
| `--color-blue-300/400` | inchangés | inchangés |
| `--color-blue-500` | `#1556B5` | `#6D9AE0` |
| `--color-blue-600` | `#114796` | `#8FB3EC` |
| `--color-blue-700` | `#0D3872` | `#A8C4F0` |
| `--color-blue-800` | `#0A2B58` | `#16243A` |
| `--color-blue-900` | `#071C39` | `#101B2C` |

### Sémantique texte (nouveau — absent de `globals.css`, à ajouter)

| Token | Clair | Sombre |
| --- | --- | --- |
| `--color-text-strong` | `var(--color-ink)` | `#F2F6FB` |
| `--color-text-body` | `#2B3646` (= couleur actuelle de `body`) | `#C3CDDB` |
| `--color-text-muted` | `#5E6878` (= `--color-muted-foreground` actuel, à fusionner) | `#8E9BAE` |
| `--color-text-invert` | `#FFFFFF` | inchangé |
| `--color-text-on-brand` | `#FFFFFF` | inchangé |
| `--color-text-accent` | `var(--color-blue-500)` | `#7FA3E3` |
| `--color-text-link` | `var(--color-blue-600)` | `#8FB3EC` |
| `--color-text-link-hover` | `var(--color-orange-700)` | `var(--color-orange-400)` |

### Sémantique surfaces (nouveau, sauf les 5 déjà présentes)

| Token | Clair | Sombre |
| --- | --- | --- |
| `--color-surface-page` | `var(--color-n-50)` (existant) | `#0D1622` |
| `--color-surface-card` | `var(--color-n-0)` (existant) | `#141F2E` (littéral — ne peut plus dériver de `n-0`) |
| `--color-surface-sunken` | `var(--color-n-100)` (existant) | `#1A2637` |
| `--color-surface-brand` | `var(--color-orange-500)` | inchangé |
| `--color-surface-brand-soft` | `var(--color-orange-50)` | `#2A1D0C` |
| `--color-surface-deep` | `var(--color-blue-800)` (existant) | `#16243A` |
| `--color-surface-deep-soft` | `var(--color-blue-50)` (existant) | `#152238` |
| `--color-surface-invert` | `var(--color-ink)` | `#E9EFF7` |
| `--color-fill-ink` (nouveau) | `var(--color-ink)` | `#2A3A52` |
| `--color-surface-blur` (nouveau, header sticky) | `rgba(250,248,245,.92)` | `rgba(13,22,34,.88)` |
| `--color-brand-flat` (nouveau, aplats hero/CTA pleine largeur) | `var(--color-orange-500)` | `#B85700` |

### Bordures

| Token | Clair | Sombre |
| --- | --- | --- |
| `--color-border-subtle` | `rgba(14,27,46,.10)` (existant) | `rgba(233,239,247,.13)` |
| `--color-border-strong` | `rgba(14,27,46,.24)` (existant) | `rgba(233,239,247,.27)` |
| `--color-border-brand` (nouveau) | `var(--color-orange-500)` | inchangé |
| `--color-border-deep` (nouveau) | `var(--color-blue-500)` | dérive automatiquement (pas d'override) |
| `--color-border-invert` (nouveau) | `rgba(255,255,255,.24)` | `rgba(233,239,247,.24)` |

### Actions

| Token | Clair | Sombre |
| --- | --- | --- |
| `--color-action-primary-bg/-hover/-active/-fg` (nouveau) | orange-500/600/700/blanc | dérivent automatiquement |
| `--color-action-deep-bg` (nouveau) | `var(--color-blue-500)` | `#2C63C4` (littéral — le bleu 500 éclairci ne passe plus AA sur texte blanc) |
| `--color-action-deep-bg-hover` | `var(--color-blue-600)` | `#3B74D8` |
| `--color-action-deep-bg-active` | `var(--color-blue-700)` | `#5088E0` |
| `--color-action-deep-fg` | `#FFFFFF` | inchangé |
| `--color-action-ghost-fg` (nouveau) | `var(--color-ink)` | `#E9EFF7` |
| `--color-action-ghost-bg-hover` (nouveau) | `var(--color-n-100)` | `#1A2637` |

### Divers

| Token | Clair | Sombre |
| --- | --- | --- |
| `--color-focus-ring` (nouveau) | `var(--color-blue-500)` | `#7FA3E3` |
| `--color-overlay-scrim` (nouveau) | `rgba(7,28,57,.62)` | `rgba(4,9,16,.72)` |
| `--color-verdict-unchecked/-bg` (nouveau) | `#544E47` / `#F1EEE9` | `#A9B4C4` / `#1A2637` |
| `--color-verdict-true/-false/-misleading(+bg)` (existants) | inchangés | true `#4ECB93`/`#10281D`, false `#FF8B7D`/`#2B1512`, misleading `#FFB866`/`#2B1D0B` |
| `--shadow-stamp` | `5px 5px 0 var(--color-blue-500)` (existant) | `5px 5px 0 var(--color-orange-500)` (couleur change, pas juste la variable sous-jacente) |
| `--shadow-raise` (nouveau) | `0 1px 2px rgba(14,27,46,.06), 0 8px 24px rgba(14,27,46,.08)` | `0 4px 16px rgba(0,0,0,.52)` |
| `--shadow-overlay` (existant) | `0 24px 60px rgba(7,28,57,.22)` | `0 14px 38px rgba(0,0,0,.64)` |
| `--pattern-dots` (existant, `:root`) | `radial-gradient(currentColor 1px, transparent 1px)` | `radial-gradient(rgba(233,239,247,.13) 1px, transparent 1px)` (littéral en sombre) |
| `--pattern-stripes` (existant, `:root`) | `repeating-linear-gradient(118deg, rgba(255,255,255,.14) 0 2px, transparent 2px 12px)` | même dégradé, opacité `.085` |
| `color-scheme` | `light` | `dark` |

Compatibilité composants (traduits en classes/props, pas en CSS `.mec-*`) :

- Champs de formulaire (`form-controls.tsx` : `TextInput`/`TextareaInput`/`SelectInput`) : fond
  `surface-card` déjà correct si ce token est branché ; vérifier `CheckboxItem` (case cochée doit
  utiliser `surface-card` en anneau intérieur, pas `n-0`).
- Tags actifs / pastilles pleines (`category-tag.tsx`, `ui/tag.tsx` si utilisé côté public) : texte
  qui passe sur `surface-page` (foncé) au lieu de blanc en mode sombre — vérifier au cas par cas,
  la plupart des tags du site public utilisent déjà orange-500/blue-100/n-100 en fond (dérivent
  automatiquement) donc pas de texte blanc à inverser.
- Bouton "invert" (fond clair fixe, texte qui doit rester foncé) : aucun composant public identifié
  à ce jour — à vérifier en implémentant, pas un point bloquant.
- `img[data-logo-swap]` → géré par double logo + `dark:hidden` (voir Architecture ci-dessus), pas de
  changement de `src`.
- `.mec-photo`/duotone (`photo-placeholder.tsx`) : `filter: brightness(.86) saturate(.94)` en mode
  sombre uniquement, via `dark:brightness-[.86] dark:saturate-[.94]` ou classe dédiée.

## Bypasses de tokens à corriger (scope site public uniquement — pas `components/features/admin*`)

Repérés par grep (`#[0-9a-fA-F]{3,6}|rgba?\(` sur `app/` et `components/`, filtré aux fichiers
publics) :

- `app/globals.css` : `body { color: #2b3646 }` → `color: var(--color-text-body)`.
- `components/features/site/site-header.tsx` : `bg-[#faf8f5]/90` → `bg-surface-blur` (nouveau
  token). Ajouter le bouton de bascule de thème (3 icônes SVG identiques à la maquette, `<span
  data-mec-icon="…">` + CSS de visibilité) à côté du CTA "Rejoindre le mouvement", avant lui dans
  l'ordre visuel (comme la maquette).
- `components/features/ressources/download-dialog.tsx` : `bg-ink/50` → `bg-overlay-scrim` (nouveau
  token, remplace l'approximation).
- Tout le reste des correspondances `text-white`/`bg-white`/opacités sur `ink`/`n-*` déjà repéré est
  du texte blanc fixe sur aplat de marque (orange-500, blue-800…) qui reste sombre dans les deux
  thèmes — **ne pas** ajouter de `dark:` dessus, c'est déjà correct.

## Écarts de design par page (hors couleurs — trouvés par comparaison maquette vs implémentation)

**Accueil** (`components/features/accueil/`)

- `hero.tsx` : retirer `min-h-[calc(100svh_-_72px)]` — la maquette ne force aucune hauteur, le hero
  est dimensionné par son padding seul.
- `actions-grid.tsx` : la carte centrale mise en avant (`highlight: true`, bordure `ink` +
  `shadow-stamp`) ne doit **pas** avoir l'effet hover (translation + bordure orange) appliqué aux
  deux autres cartes — retirer `hover:-translate-y-0.5 hover:border-orange-500` pour cette carte
  uniquement.

**Actualités** (`components/features/actualites/`)

- `article-header.tsx` + `features/actualites/types/article.ts` : la ligne méta de l'article ajoute
  un 3ᵉ segment "service/auteur" (ex. "Secrétariat général") entre la durée de lecture et rien —
  ajouter un champ optionnel `auteur`/`service` au type `Article` et l'afficher si présent.
- La barre flottante "Connectée en administratrice… Modifier cette page" visible dans la maquette
  sur `isArticle` est un artefact de démo de l'outil (session admin simulée) — **ne pas
  implémenter**.

**Actions** (`components/features/actions/`)

- `hero.tsx` : passer d'un empilement (texte puis stats pleine largeur) à une grille 2 colonnes
  `1.15fr .85fr` avec `items-end`, stats groupées à droite alignées en bas du texte.
- `action-cta.tsx` : retirer le conteneur carte arrondie + l'overlay `pattern-dots` (la maquette a
  une section pleine largeur, fond bleu direct, sans motif) ; boutons en rangée (`flex`, pas
  `flex-col`).
- `timeline.tsx` : le filet séparateur passe de `border-t` (au-dessus du bloc année) à
  `border-b` sous le numéro d'année uniquement.

**Contact** (`components/features/contact/`)

- `contact-form.tsx` : corriger les placeholders — Nom → "Votre nom" (pas "Votre nom complet"),
  Organisation → "Si vous en avez une" (pas "Nom de l'organisation"), Téléphone → "+225" (pas
  "+225 00 00 00 00 00"), Message → "Dites-nous ce dont vous avez besoin" (pas la version longue
  actuelle).
- `contact-confirmation.tsx` : l'icône `mail-check` doit être seule (40px), pas dans un badge
  circulaire plein `rounded-full` de 56px.
- `contact-cta.tsx` : retirer l'overlay `pattern-dots` (absent de la maquette pour ce bandeau).

**Apropos, Rejoindre, Ressources (liste + détail)** : aucun écart structurel/contenu trouvé au-delà
du thème sombre.

## Hors scope explicite

- Écrans système 404/500/403/Maintenance/Erreur générique (voir Contexte).
- Refonte catalogue `/ressources` en tableau (voir Contexte).
- Dashboard admin et Espace membre (maquettes séparées, non lues).
