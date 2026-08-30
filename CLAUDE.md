# onmec-site

Frontend de la plateforme **Citoyen+** (MEC — actualités, signalements citoyens, bibliothèque de
documents, quiz éducatifs, gamification). Consomme l'API du backend NestJS **onmec_backend**
(repo GitHub séparé, aucun code partagé) déployé sur `https://admin.mec-ci.org`.

## Stack

- **vinext** (réimplémentation de l'API Next.js App Router sur Vite) déployé en **Cloudflare
  Workers** (`wrangler.jsonc`). Les imports `next/*` (`next/headers`, `next/server`, ...) sont
  valides — vinext fournit les types et l'implémentation compatibles.
- React 19, TypeScript strict, Tailwind CSS v4, pnpm.
- Toutes les dépendances sont **pinnées en version exacte** (jamais `"latest"`) — déterminisme des
  installs. Toute mise à jour de dépendance est un choix explicite, pas un effet de bord d'un
  `pnpm install`.
- Variables d'env Cloudflare (D1/KV/R2 si utilisés un jour) : `import { env } from
"cloudflare:workers"` — jamais `process.env` pour ça. Pour tout le reste (secrets serveur,
  `API_BASE_URL`), `process.env` classique via `.env` (voir `.env.example`) reste correct : c'est
  ce que vinext charge nativement.

## Architecture

Voir [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) pour la règle de layering complète
(`config/`/`lib/`/`features/<domaine>/`/`components/`), le schéma en deux niveaux de requête pour
l'auth, la frontière fetch RSC vs TanStack Query, le contrat d'erreur, et les décisions actuelles
(pas de CSRF, garde d'auth edge dans `proxy.ts`, design system maison avec Radix sous le seul
comportement des overlays).

## Convention d'appel à l'API (règle la plus importante du projet)

onmec-site est un **BFF** (backend-for-frontend) : le navigateur ne parle jamais directement à
`admin.mec-ci.org`.

- **Un seul point d'entrée serveur** vers l'API : `apiFetch()` dans
  [lib/api-client.ts](lib/api-client.ts). Aucun `fetch` brut vers `admin.mec-ci.org` ailleurs dans le
  code. Ce module est **server-only** (dépend de `next/headers`) — jamais importé par un fichier
  `"use client"`.
- Le backend renvoie le JWT en **JSON** (`{ token, refreshToken }`), il ne pose **pas** de cookie
  lui-même. C'est onmec-site qui transforme ces tokens en cookies **httpOnly** via
  [lib/auth-cookies.ts](lib/auth-cookies.ts). Le JS client ne voit
  jamais le token. `setAuthCookies`/`clearAuthCookies` ne sont appelables que depuis un route
  handler ou une Server Action, jamais depuis le render d'un composant.
- Route handlers `app/api/auth/*` = proxys vers `onmec_backend/src/modules/auth`, via
  `features/auth/requests/*` (login, register, verify-email, refresh-token). Si un nouvel endpoint
  auth est ajouté côté backend (`forgot-password`, `reset-password`, `resend-email-otp`...), suivre
  exactement le même patron : schema Zod → request serveur → route handler → cookies.
- Côté client, les mutations (`features/<domaine>/mutations`, TanStack Query) appellent les route
  handlers de onmec-site lui-même via [lib/fetch-json.ts](lib/fetch-json.ts) — jamais le backend
  directement (le cookie httpOnly est invisible au JS).
- Séparation public / authentifié :
  - **Public** (actualités, librairie, quiz en lecture) : fetch direct en Server Component via
    `apiFetch()`, cache/`revalidate` normal, pas de cookie requis. **Jamais** remplacé par React
    Query.
  - **Authentifié** (profil, gamification, signalement citoyen, modération) : `apiFetch()` côté
    serveur (cookie httpOnly) pour le rendu, `features/<domaine>/mutations` côté client pour les
    interactions (formulaires, soumissions).

## Structure

- `app/` — App Router (pages, layouts, route handlers)
- `app/api/auth/*/route.ts` — proxys BFF vers l'auth du backend
- `config/` — configuration transverse (`env.ts`, `auth.ts`)
- `lib/` — transport/utils agnostiques du domaine (`api-client.ts` server-only, `fetch-json.ts`
  browser-safe, `api-error.ts`, `parse-json-body.ts`, `query-client.ts`)
- `features/<domaine>/` — logique métier (`types/`, `schemas/`, `requests/` serveur, `mutations/`
  client, `lib/`)
- `components/providers/` — providers React (`query-provider.tsx`)
- `components/features/<domaine>/` — UI par domaine ; `components/ui/` — primitives du design
  system maison (`cn.ts`, Button, IconButton, Tag, Field, Input, Textarea, Select, Alert, Stat,
  Dialog, Drawer). Voir `docs/ARCHITECTURE.md` pour la frontière avec Radix.

## Commandes

Toujours préfixer avec `rtk` (voir config globale RTK) :

```
rtk pnpm run dev         # vinext dev, port 3000
rtk pnpm run build       # build Cloudflare Worker
rtk pnpm run typecheck   # tsc --noEmit
rtk pnpm run lint        # eslint .
rtk pnpm run format      # prettier --write .
rtk pnpm run test        # vitest run
rtk git ...              # toutes commandes git
```

## Workflow obligatoire pour toute feature

Ce projet suit le workflow du skill `superpowers:brainstorming` (classification spike / bounded /
architectural) — ne pas le redécrire ici, juste l'appliquer :

- **Architectural** (nouvelle intégration API, changement de structure, nouvelle section
  authentifiée) : spec écrite dans `docs/superpowers/specs/YYYY-MM-DD-<sujet>-design.md`, puis plan
  dans `docs/superpowers/plans/YYYY-MM-DD-<sujet>.md` (skill `superpowers:writing-plans`), puis
  exécution (`superpowers:executing-plans`). **Même convention que `onmec_backend`** — les deux
  repos partagent ce format pour rester cohérents.
- **Bounded** (petit composant, fix, ajustement UI sur une page existante) : design court en chat +
  approbation explicite, pas de fichier.
- Pas de code touchant à la structure ou à l'intégration API sans design validé au préalable.

## Conventions

Kebab-case partout, fichiers de 200 lignes maximum sauf nécessité réelle (voir
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)). À la fin de chaque tâche d'implémentation non
triviale, lancer une revue `convention-drift-check` sur le diff avant de committer.

## Hooks & permissions

Un hook `PostToolUse` lance `tsc --noEmit` et le lint sur les fichiers `.ts`/`.tsx` modifiés
(`.claude/settings.json`). Si le hook remonte une erreur, la corriger avant de continuer — c'est le
signal que le code édité casse quelque chose, pas un avertissement à ignorer.
