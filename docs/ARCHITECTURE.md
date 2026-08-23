# Architecture — onmec-site

Ce document définit la structure de projet et les règles de couches, adaptées du starter personnel
`nextjs-front-starter` pour les contraintes spécifiques de onmec-site : vinext (pas Next.js lui-même)
sur Cloudflare Workers, et un backend NestJS (`onmec_backend`, repo séparé) qui renvoie le JWT en
JSON plutôt que de poser un cookie.

## Règle de layering

| Dossier                                   | Contenu                                                                    | Peut importer depuis                      |
| ----------------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------- |
| `config/`                                 | Configuration transverse (env typé, constantes cookies)                    | rien d'autre                              |
| `lib/`                                    | Transport/utils **agnostiques du domaine**                                 | `config/` uniquement, jamais `features/`  |
| `features/<domaine>/types`, `schemas`     | Types et validation Zod du domaine                                         | `config/`                                 |
| `features/<domaine>/requests`             | Appels **serveur uniquement** vers `onmec_backend`                         | `lib/api-client.ts`, `types/`, `schemas/` |
| `features/<domaine>/mutations`, `queries` | Hooks TanStack Query **client uniquement**                                 | `lib/fetch-json.ts`, `types/`, `schemas/` |
| `features/<domaine>/lib`                  | Logique du domaine qui n'est ni request/mutation/schema (ex. cookies auth) | `config/`, `types/`                       |
| `components/features/<domaine>/`          | UI pure, wire les hooks de `features/<domaine>/mutations` au JSX           | `features/<domaine>/mutations`            |
| `components/ui/`                          | Primitives de design system génériques                                     | rien (pas encore peuplé — voir Décisions) |

**Règle d'or** : une couche ne connaît que celle juste en dessous. Un composant n'appelle jamais une
route handler ou l'API directement — toujours via un hook de `features/<domaine>/mutations`.

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

`setAuthCookies`/`clearAuthCookies` (écriture, `features/auth/lib/auth-cookies.ts`) ne sont
appelables que depuis un route handler ou une Server Action — jamais depuis le render d'un Server
Component/layout/page (`cookies().set()` lève une exception hors contexte de mutation). La lecture
(`getRefreshToken`, et la lecture du token d'accès — privée dans `lib/api-client.ts`) est sans risque
partout côté serveur.

## Frontière fetch RSC vs TanStack Query

- **Contenu public** (actualités, librairie, quiz en lecture) : fetch direct dans un Server Component
  via `lib/api-client.ts`, cache/`revalidate` normal. **Jamais** remplacé par React Query.
- **Mutations et données réactives côté client** (login, register, verify-email, futur
  quiz/commentaires/gamification) : TanStack Query via `features/<domaine>/mutations` (et futurs
  `queries`).

C'est une règle, pas une préférence — tout écart doit être justifié en revue.

## Contrat d'erreur

Une seule classe d'erreur, `ApiError` (`lib/api-error.ts`), levée par `lib/api-client.ts` et
`lib/fetch-json.ts`. `features/auth/lib/to-error-response.ts` convertit une `ApiError` en
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
- **Pas de garde d'auth edge** (`middleware.ts`/`proxy.ts`, supporté par vinext) : aucune page
  protégée n'existe encore. À poser dès la première page authentifiée réelle.
- **Pas de design system** (shadcn/ui) : `components/ui/` reste vide tant qu'aucune page ne le
  justifie.
- **Prérequis de déploiement** : `wrangler.jsonc` n'a actuellement aucun bloc `vars`. `API_BASE_URL`
  doit être fournie via les vars/secrets Cloudflare au déploiement — `config/env.ts` échoue
  bruyamment en production si elle manque (pas de fallback silencieux vers `localhost`).

## Conventions transverses

- **Nommage** : kebab-case partout (`auth-cookies.ts`, `use-login.ts`, `login-schema.ts`).
- **Taille de fichier** : 200 lignes maximum, sauf nécessité réelle justifiée — un fichier qui dépasse
  ce seuil doit être scindé selon les couches ci-dessus, pas gonflé sur place.
- **Revue** : à la fin de chaque tâche d'implémentation, une revue de convention (`convention-drift-check`)
  passe sur le diff avant commit.
