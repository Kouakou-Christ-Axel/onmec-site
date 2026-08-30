# Site vitrine MEC — implémentation du design Claude Design

## Contexte

Le projet Claude Design "Design du site MEC-Citoyenneté" (`Site MEC.dc.html`, importé via
`claude_design` MCP) livre une maquette complète du site vitrine public : accueil, à propos,
actualités (liste + détail), rejoindre, plus un système de design (tokens couleurs/typo/espacement/
forme/mouvement, composants `.mec-*` en CSS pur, logos PNG). Cette spec traduit cette maquette en
code onmec-site, conformément à `docs/ARCHITECTURE.md`.

Contraintes vérifiées :

- Tailwind CSS v4 (`4.3.3`) est déjà câblé (`app/globals.css` → `@import "tailwindcss"`), donc les
  tokens du design system peuvent être portés en `@theme` plutôt que dupliqués en CSS `.mec-*`.
- `components/ui/` est vide (décision actuelle du projet) — cette tâche ne le peuple pas avec un
  design system générique, elle construit directement les sections de page en Tailwind.
- Aucune route backend (`onmec_backend`) n'est confirmée pour actualités/adhésion/contact. Cette
  tâche n'invente aucun endpoint.

## Décisions de scope (tranchées à partir de la maquette elle-même, pas de nouvelles questions)

- **Contenu 100% statique pour l'instant** : les données (articles, bureau exécutif, partenaires,
  cibles, options de formulaire) vivent en constantes TypeScript sous `features/<domaine>/`. Pas
  d'`apiFetch()` vers un endpoint non confirmé, pas de TanStack Query sur ces pages (règle
  ARCHITECTURE.md : contenu public = fetch RSC direct, jamais React Query — ici il n'y a même pas
  d'API, donc simplement des constantes importées).
- **Un seul variant retenu par écran à choix multiple**, celui marqué par défaut dans
  `data-props` de la maquette (le bandeau "Pistes de conception" est un outil de maquettage, absent
  du site livré) :
  - Actualités : variant **"une"** (à la une + grille), pas "grille" ni "liste".
  - Rejoindre : variant **"long"** (formulaire une page), pas "parcours en 4 étapes".
- **Galerie, Rapports ne sont pas maquettés.** L'écran `isTodo` de la maquette EST leur design :
  une page placeholder générique (titre + liste à puces) alimentée par une table de contenu par
  route. On ne leur invente pas de mise en page.
- **Addendum 2026-08-23 (relecture de la maquette) : Actions et Ressources sont désormais
  maquettées** (`isActions`/`isRessources` dans `Site MEC.dc.html`, absents de la première lecture).
  Comme pour Actualités/Rejoindre, un seul variant par écran, celui marqué `default` dans
  `data-props` :
  - Actions : variant **"compact"** (cartes de programme + chronologie compacte par année),
    pas "récit" (bandes narratives alternées).
  - Ressources : variant **"grille"** (grille de couvertures filtrable), pas "liste" ni
    "regroupé par thème".
  - Détail ressource (`isRessource`) : même stratégie que le détail article — un gabarit générique
    piloté par les données (`features/ressources/data/ressources.ts`), pas de contenu riche
    spécifique par guide (les 9 guides de la maquette ont tous un `excerpt`/`body` réels, donc ici
    contrairement à `bilan` vs les autres articles, le corps est le même niveau de détail pour tous
    les 9 — pas de cas "contenu à venir").
  - Le formulaire de téléchargement (dialogue "Télécharger le guide") suit la même règle que
    "Rejoindre" : composant client, état local (`ouvert` → `envoyé`), aucun appel réseau (pas
    d'endpoint backend confirmé).
- **Addendum 2026-08-23 (bis) : Contact est désormais maquetté** (`isContact`, absent de la première
  lecture ; ne reste `isTodo` que pour Galerie et Rapports). Un seul écran, pas de variant à choix
  multiple. Même règle "pas d'appel réseau" que Rejoindre/téléchargement de guide : le formulaire de
  contact est un composant client, état local `envoyé` (`sendContact`/`resetContact` dans la
  maquette), aucune route `/api/contact` créée.
- **Formulaire "Rejoindre" non câblé.** Aucune route `/api/rejoindre` n'est créée (aucun endpoint
  backend confirmé) : le formulaire est un composant client avec état local (validation basique),
  la soumission logge/affiche un état "envoyé" sans appel réseau. À revisiter dès qu'un endpoint
  backend existe.
- **Responsive ajouté, pas dans la maquette.** La maquette est desktop-only (une seule media query
  à 1100px). Toutes les grilles multi-colonnes (`repeat(3,1fr)`, `1fr 300px`, etc.) sont retravaillées
  en mobile-first avec un empilement `md:`/`lg:` — c'est un écart assumé à la fidélité pixel, pas un
  oubli.
- **Icônes** : `lucide-react` (paquet npm, pinné en version exacte) plutôt que le CDN `unpkg`
  utilisé par la maquette.
- **Polices** : Instrument Sans / Instrument Serif via `<link>` Google Fonts dans `app/layout.tsx`
  (pas d'auto-hébergement pour l'instant — même compromis que documenté dans `tokens/fonts.css` de
  la maquette).
- **Révélation au scroll (`data-reveal`)** : portée dans un unique composant client
  `components/features/site/reveal.tsx` (wrapper `IntersectionObserver`), pas dupliquée par page.

## Système de tokens → Tailwind `@theme`

Les fichiers `tokens/*.css` du design system (couleurs orange/bleu/neutres, typographie, espacement,
formes/ombres `shadow-stamp`, easings) sont portés dans `app/globals.css` sous un bloc `@theme` afin
que `bg-orange-500`, `text-ink`, `shadow-stamp`, `rounded-md`, `font-serif`, etc. soient générés par
Tailwind. Les fichiers composants `.mec-*` (`core.css`, `brand.css`, `editorial.css`,
`navigation.css`, `forms.css`, `feedback.css`) ne sont PAS copiés tels quels dans le projet : ils
servent de spec visuelle, traduite en JSX + classes utilitaires. Seuls les motifs non exprimables en
utilitaires (dégradés `--pattern-stripes`/`--pattern-dots`, le scrim de photo) restent en valeurs
arbitraires Tailwind (`bg-[image:var(--pattern-stripes)]`) ou en CSS minimal dans `globals.css`.

## Découpage des routes

| Route                                           | Contenu                                    | Statut maquette                                                                                                                                                        |
| ----------------------------------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/page.tsx`                                  | Accueil                                    | designé                                                                                                                                                                |
| `app/apropos/page.tsx`                          | À propos                                   | designé                                                                                                                                                                |
| `app/actualites/page.tsx`                       | Liste actualités (variant "une")           | designé                                                                                                                                                                |
| `app/actualites/[slug]/page.tsx`                | Détail article                             | designé (un seul article de contenu réel : "Bilan du premier semestre 2026" ; les autres articles de la liste pointent vers le même gabarit avec leurs propres champs) |
| `app/rejoindre/page.tsx`                        | Formulaire adhésion (variant "long")       | designé                                                                                                                                                                |
| `app/actions/page.tsx`                          | Nos actions (variant "compact")            | designé (addendum)                                                                                                                                                     |
| `app/ressources/page.tsx`                       | Catalogue ressources (variant "grille")    | designé (addendum)                                                                                                                                                     |
| `app/ressources/[slug]/page.tsx`                | Détail ressource                           | designé (addendum)                                                                                                                                                     |
| `app/contact/page.tsx`                          | Formulaire de contact + contacts par sujet | designé (addendum bis)                                                                                                                                                 |
| `app/galerie/page.tsx`, `app/rapports/page.tsx` | Placeholder `isTodo`                       | non designé (assumé, hors scope — pas de route de nav dédiée actuellement)                                                                                             |

Header/footer partagés via `app/layout.tsx` (pas de route group `(site)` : il n'existe pas encore
d'autre section type app authentifiée qui nécessiterait de les exclure).

## Hors scope explicite

- Pages Galerie photos / Rapports (mentionnées seulement dans le footer et la table `TODO` de la
  maquette, aucune route de nav dédiée) : non créées dans cette passe.
- Auth, cookies, `lib/api-client.ts` : non touchés.
- Design system générique `components/ui/` : non peuplé (hors scope de cette tâche).
