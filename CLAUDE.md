# onmec-site

Frontend de la plateforme **Citoyen+** (MEC — actualités, signalements citoyens, bibliothèque de
documents, quiz éducatifs, gamification). Consomme l'API du backend NestJS **onmec_backend**
(repo GitHub séparé, aucun code partagé) déployé sur `https://api.mec-ci.org`.

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

## Convention d'appel à l'API (règle la plus importante du projet)

onmec-site est un **BFF** (backend-for-frontend) : le navigateur ne parle jamais directement à
`api.mec-ci.org`.

- **Un seul point d'entrée** vers l'API : `apiFetch()` dans [lib/api/client.ts](lib/api/client.ts).
  Aucun `fetch` brut vers `api.mec-ci.org` ailleurs dans le code.
- Le backend renvoie le JWT en **JSON** (`{ token, refreshToken }`), il ne pose **pas** de cookie
  lui-même. C'est onmec-site qui transforme ces tokens en cookies **httpOnly** via
  [lib/api/auth-cookies.ts](lib/api/auth-cookies.ts). Le JS client ne voit jamais le token.
- Route handlers `app/api/auth/*` = proxys vers `onmec_backend/src/modules/auth` (login, register,
  verify-email, refresh-token). Si un nouvel endpoint auth est ajouté côté backend
  (`forgot-password`, `reset-password`, `resend-email-otp`...), suivre exactement le même patron.
- Séparation public / authentifié :
  - **Public** (actualités, librairie, quiz en lecture) : fetch direct en Server Component,
    cache/`revalidate` normal, pas de cookie requis.
  - **Authentifié** (profil, gamification, signalement citoyen, modération) : passe obligatoirement
    par `apiFetch()` (cookie httpOnly) ; cookie absent → redirect login. Le JS client authentifié
    passe par les route handlers du site (même origine), jamais par un appel direct au backend.

## Structure

- `app/` — App Router (pages, layouts, route handlers)
- `app/api/auth/*/route.ts` — proxys BFF vers l'auth du backend
- `lib/api/` — `client.ts` (apiFetch unique) et `auth-cookies.ts` (gestion cookies httpOnly)

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

## Hooks & permissions

Un hook `PostToolUse` lance `tsc --noEmit` et le lint sur les fichiers `.ts`/`.tsx` modifiés
(`.claude/settings.json`). Si le hook remonte une erreur, la corriger avant de continuer — c'est le
signal que le code édité casse quelque chose, pas un avertissement à ignorer.
