# Architecture — onmec-site

Ce document définit la structure de projet et les règles de couches, adaptées du starter personnel
`nextjs-front-starter` pour les contraintes spécifiques de onmec-site : vinext (pas Next.js lui-même)
sur Cloudflare Workers, et un backend NestJS (`onmec_backend`, repo séparé) qui renvoie le JWT en
JSON plutôt que de poser un cookie.

## Règle de layering

| Dossier                                   | Contenu                                                                                           | Peut importer depuis                      |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `config/`                                 | Configuration transverse (env typé, constantes cookies)                                           | rien d'autre                              |
| `lib/`                                    | Transport/utils **agnostiques du domaine**                                                        | `config/` uniquement, jamais `features/`  |
| `features/<domaine>/types`, `schemas`     | Types et validation Zod du domaine                                                                | `config/`                                 |
| `features/<domaine>/data`                 | Données statiques/mockées du domaine (constantes + types, pas de logique)                         | `types/`                                  |
| `features/<domaine>/requests`             | Appels **serveur uniquement** vers `onmec_backend`                                                | `lib/api-client.ts`, `types/`, `schemas/` |
| `features/<domaine>/mutations`, `queries` | Hooks TanStack Query **client uniquement**                                                        | `lib/fetch-json.ts`, `types/`, `schemas/` |
| `features/<domaine>/lib`                  | Logique du domaine qui n'est ni request/mutation/schema (ex. cookies auth, dérivation de données) | `config/`, `types/`, `data/`              |
| `components/features/<domaine>/`          | UI pure, wire les hooks de `features/<domaine>/mutations` au JSX                                  | `features/<domaine>/mutations`            |
| `components/ui/`                          | Primitives de design system génériques (Button, Tag, Field, Drawer...)                            | rien                                      |

**Règle d'or** : une couche ne connaît que celle juste en dessous. Un composant n'appelle jamais une
route handler ou l'API directement — toujours via un hook de `features/<domaine>/mutations`.

**Exception assumée — domaines UI pure sans backend réel** (ex. `features/admin/` du dashboard
admin, `docs/superpowers/specs/2026-08-23-dashboard-admin-design.md`) : sans endpoint `onmec_backend`
correspondant, il n'y a ni `requests/` ni `mutations/` à écrire. `components/features/<domaine>/`
consomme alors `features/<domaine>/data` et `features/<domaine>/lib` directement. Cette exception
disparaît dès qu'un vrai flow d'API est branché sur le domaine — à ce moment-là, revenir à la règle
générale (passer par `mutations/`).

## Deux niveaux de requête pour l'auth (divergence assumée vs le starter)

Le starter suppose que le backend pose déjà les cookies (`Set-Cookie`), donc son client API appelle
le backend directement depuis le navigateur en un seul niveau. **Ce n'est pas notre cas** :
`onmec_backend` renvoie `{ token, refreshToken }` en JSON sans cookie. onmec-site joue donc le rôle
de porteur de cookie lui-même, ce qui crée deux niveaux :

```
navigateur → app/api/auth/*/route.ts (onmec-site) → features/auth/requests/* → apiFetch → onmec_backend
                    ↑ cookie httpOnly pose ICI uniquement
```

Conséquence directe : **`features/auth/requests/` est serveur uniquement** et ne doit jamais être
importé par un fichier `"use client"`. Les futurs hooks `features/<domaine>/mutations` appellent les
route handlers de onmec-site (même origine, via `lib/fetch-json.ts`), jamais le backend directement.

`lib/api-client.ts` (server-only, dépend de `next/headers`) et `lib/fetch-json.ts` (browser-safe,
zéro dépendance `next/headers`) sont volontairement deux fichiers séparés pour cette raison — pas un
choix esthétique.

## Règle cookies

`setAuthCookies`/`clearAuthCookies` (écriture, `lib/auth-cookies.ts`) ne sont
appelables que depuis un route handler ou une Server Action — jamais depuis le render d'un Server
Component/layout/page (`cookies().set()` lève une exception hors contexte de mutation). La lecture
(`getRefreshToken`, et la lecture du token d'accès — privée dans `lib/api-client.ts`) est sans risque
partout côté serveur.

## Frontière fetch RSC vs TanStack Query

- **Contenu public** (actualités, librairie, quiz en lecture) : fetch direct dans un Server Component
  via `lib/api-client.ts`, cache/`revalidate` normal. **Jamais** remplacé par React Query.
- **Mutations et données réactives côté client** (login, register, verify-email, connexion et
  changement de mot de passe admin, futur quiz/commentaires/gamification) : TanStack Query via
  `features/<domaine>/mutations` (et futurs `queries`).

C'est une règle, pas une préférence — tout écart doit être justifié en revue.

## Filtres, onglets et pagination côté client : jamais `router.push`/`router.refresh`

**Piège rencontré deux fois** (`quiz-admin-client.tsx`, `membres-admin-client.tsx`) : une page liste
sous `app/admin/(shell)/` (Server Component qui lit `searchParams`) avec un composant client qui
synchronise un filtre/onglet/page dans l'URL via `router.push(...)`, ou rafraîchit après mutation
via `router.refresh()`.

`app/admin/(shell)/loading.tsx` **couvre tout le segment shell et ses enfants** (documenté dans son
propre commentaire). N'importe quelle navigation qui fait réexécuter un Server Component enfant —
y compris `router.push`/`router.refresh` déclenché par une simple frappe dans un champ recherche ou
un clic d'onglet — réaffiche ce squelette plein écran, pas juste la zone de contenu concernée. En
prime, sous vinext, une navigation vers la même route avec seulement les `searchParams` qui
changent ne réexécute pas toujours le Server Component de façon fiable : le filtre ou l'onglet
donne l'impression de ne pas fonctionner tant qu'on n'a pas rechargé la page à la main.

**Règle** : toute interaction qui reste sur le même écran (filtre, recherche, onglet, pagination,
rafraîchissement après mutation) passe par TanStack Query côté client contre les route handlers
`app/api/admin/*` existants — jamais par le router. Patron à suivre (voir
`features/quiz-admin/queries/use-quiz-list.ts` / `use-results.ts`, et
`features/membres-admin/queries/use-membres-list.ts`) :

- Un hook `features/<domaine>/queries/use-<x>-list.ts` : `useQuery` avec la même query key que les
  filtres (`[nom, search, filtre, page]`), `initialData` = la prop SSR **seulement** quand tous les
  filtres sont à leur valeur par défaut (sinon le premier fetch filtré resterait bloqué sur les
  données non filtrées), `placeholderData: keepPreviousData` pour éviter un flash vide en changeant
  de page/filtre.
- Le composant garde le filtre en `useState` local, débounce la recherche texte (~300 ms) avant de
  l'injecter dans la query key — jamais de fetch à chaque frappe, jamais besoin d'appuyer sur Entrée
  non plus.
- L'URL reste synchronisée pour le partage de lien via `syncUrlParams()` (`lib/sync-url.ts`,
  `history.replaceState`) — jamais `router.push`/`router.replace`, qui redéclenchent le Server
  Component.
- Après une mutation qui doit rafraîchir la liste : `queryClient.invalidateQueries({ queryKey:
  [...] })`, jamais `router.refresh()`.
- Le Server Component de la page (`page.tsx`) garde son fetch initial pour le premier rendu SSR (lit
  toujours `searchParams` pour permettre un lien profond) — c'est uniquement la ré-interaction
  côté client qui change de mécanisme.

Un vrai changement d'écran (créer, éditer, voir le détail d'une autre ressource) reste un
`router.push` normal — le squelette de `loading.tsx` y est légitime.

## Contrat d'erreur

Une seule classe d'erreur, `ApiError` (`lib/api-error.ts`), levée par `lib/api-client.ts` et
`lib/fetch-json.ts`. `lib/to-error-response.ts` convertit une `ApiError` en
`NextResponse` ; toute autre erreur **doit** remonter en 500 via le framework, jamais être masquée
silencieusement (`toErrorResponse` re-lève volontairement dans ce cas).

`lib/parse-json-body.ts` retourne les erreurs 400 sous la forme `{statusCode, message: string[],
error}` — c'est la forme par défaut du `ValidationPipe` NestJS (vérifié : `onmec_backend/src/main.ts`
n'a pas d'`exceptionFactory` custom), donc les 400 de onmec-site et du backend convergent
réellement.

## Décisions actuelles (à revisiter explicitement, pas des oublis)

- **Pas de CSRF** : le cookie est déjà `sameSite=lax` (bloque les requêtes cross-site en mutation),
  et `onmec_backend` n'expose aucun endpoint `/csrf-token`. À revisiter si le backend en expose un
  jour, ou si `sameSite` doit passer à `none` pour un besoin cross-site.
- **Garde d'auth edge posée** (`proxy.ts`, racine du projet) : `/admin/(shell)/*` et
  `/admin/changer-mot-de-passe` exigent une session back-office valide (JWT + refresh
  transparent via `POST /auth/admin/refresh-token`), sinon redirect vers `/admin/connexion`.
  Voir `docs/superpowers/specs/2026-08-25-auth-admin-design.md`.
- **`components/ui/` est maintenant peuplé** (Button, IconButton, Tag, Field, Input, Textarea,
  Select, Alert, Stat, Drawer, Dialog, ConfirmDialog) : primitives Tailwind/JSX réimplémentées
  depuis le design system Claude Design. **Pas de kit tiers** — ni shadcn/ui, ni `components.json`,
  ni cva : les tokens (`surface-*`, `text-*`, `action-*`, `shadow-stamp`, typo fluide) et les
  classes restent les nôtres.
  **Nuance assumée : Radix fournit le _comportement_ des overlays, pas leur style.** `Dialog`,
  `Drawer`, `ConfirmDialog` (`ui/alert-dialog.tsx`) et le popover de publication s'appuient sur
  `@radix-ui/react-{dialog,alert-dialog,popover}` pour le piège de focus, Escape, `aria-modal`, le
  verrou de scroll et l'ancrage réel — six comportements qu'aucune des cinq coquilles de modale
  maison n'avait, et que Radix retarde proprement le temps d'une animation de sortie.
  `react-alert-dialog` diffère de `react-dialog` sur un point volontaire : Escape et le clic
  extérieur ne ferment pas la modale — attendu avant une action destructive, donc **c'est le
  composant à utiliser pour tout remplacement de `window.confirm`**, jamais `Dialog`. Les
  primitives sans comportement (Button, Input, Textarea, Select, Field, Tag, Alert, Stat) restent
  100 % maison. En particulier `ui/select.tsx` est un `<select>` natif : meilleur que Radix Select
  en accessibilité et sans JS, on n'y touche pas.
  Point de vigilance : Radix portalise vers `document.body`, or le thème sombre est scopé à
  `html[data-mec-theme="dark"] [data-mec-public]` / `[data-mec-admin]` et ses tokens s'héritent. Le
  site public et le dashboard admin rendent donc chacun un `#mec-overlay-root` dans leur marqueur
  respectif (`app/(public)/layout.tsx`, `app/admin/layout.tsx`) que les portails ciblent via
  `useOverlayContainer()`. Les popovers Radix qui n'utilisent pas ce hook (rares — vérifier au cas
  par cas) doivent retirer leur `<Popover.Portal>` plutôt que de rendre sur `body`, hors scope.
- **Tester ces overlays : deux pièges.** (1) Chrome **gèle l'horloge des animations CSS dans un
  onglet non visible**. Radix attend `animationend` pour démonter : dans un onglet caché, une modale
  correctement fermée reste montée indéfiniment et donne l'illusion d'un bug. En pilotage automatisé
  du navigateur, injecter `[data-state="closed"]{animation:none !important}` **avant** de mesurer,
  systématiquement — piège rencontré quatre fois pendant la mise en place. (2) Radix ne restaure le
  focus de lui-même que s'il connaît le déclencheur (`Dialog.Trigger`). Nos overlays étant pilotés
  depuis un parent (ligne de tableau, sélection de fichier), `ui/dialog.tsx` capture explicitement la
  cible dans `onOpenAutoFocus` et la restitue dans `onCloseAutoFocus` : sans ce filet, le focus
  retombe sur `<body>` à la fermeture. Ne pas le retirer.
- **Variables d'environnement du worker** : `API_BASE_URL` est déclarée dans le bloc `vars` de
  `wrangler.jsonc` (valeur de production `https://admin.mec-ci.org/api/v1` — vérifié en direct :
  `api.mec-ci.org` ne répond pas comme l'API NestJS, seul `admin.mec-ci.org` le fait) —
  `config/env.ts` échoue bruyamment si elle manque au runtime (pas de fallback silencieux vers
  `localhost`). Ce n'est pas un secret (URL publique) : pas besoin de `wrangler secret put` pour
  celle-ci.

## Conventions transverses

- **Nommage** : kebab-case partout (`auth-cookies.ts`, `use-login.ts`, `login-schema.ts`).
- **Taille de fichier** : 200 lignes maximum, sauf nécessité réelle justifiée — un fichier qui dépasse
  ce seuil doit être scindé selon les couches ci-dessus, pas gonflé sur place.
- **Revue** : à la fin de chaque tâche d'implémentation, une revue de convention (`convention-drift-check`)
  passe sur le diff avant commit.
