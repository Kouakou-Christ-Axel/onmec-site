# Harness IA pour onmec-site — design

## Contexte

`onmec-site` est le frontend **vinext + Cloudflare Workers** de la plateforme Citoyen+ (MEC),
généré par `create-vinext-app`, sans logique métier au départ. Le backend NestJS + Prisma
(`onmec_backend`, repo GitHub séparé) est déjà déployé et utilise sa propre convention
`docs/superpowers/{specs,plans}`. Cette spec pose, avant tout code métier, les règles et le
workflow qui permettent à l'IA de travailler de façon déterministe sur ce projet.

Contraintes vérifiées (pas supposées) :

- Backend : JWT Bearer classique (`ExtractJwt.fromAuthHeaderAsBearerToken()`), tokens renvoyés en
  JSON par `/auth/login` etc., **aucun cookie posé côté backend**.
- CORS backend : `localhost:3000`, `localhost:8080`, `mec-ci.org`, `*.mec-ci.org`, credentials on.
- `vinext dev` écoute sur le port 3000 par défaut (documentation vinext / Context7).
- vinext supporte `cookies().set()/get()` avec `httpOnly` complet et l'accès aux bindings
  Cloudflare via `cloudflare:workers` (pas `process.env` pour ça).
- Décision produit : onmec-site porte lui-même le cookie httpOnly (pattern BFF), le token
  n'est jamais exposé au JS client.
- Aucun sous-agent spécialisé pour ce projet (choix explicite) : CLAUDE.md, workflow spec/plan,
  hooks de vérification uniquement.

## 1. Structure & convention d'appel API (pattern BFF)

- `app/api/auth/*/route.ts` : route handlers proxy vers le backend (`/auth/login`,
  `/auth/register`, `/auth/refresh-token`, `/auth/verify-email` — extensible aux autres endpoints
  auth selon le même patron).
- `lib/api/client.ts` : point d'entrée unique `apiFetch()` vers `api.mec-ci.org`. Lit le cookie
  httpOnly côté serveur, attache `Authorization: Bearer`. Aucun `fetch` brut ailleurs vers le
  backend.
- `lib/api/auth-cookies.ts` : pose/lit/efface les cookies `onmec_token` / `onmec_refresh_token`
  (httpOnly, `secure` en production, `sameSite=lax`).
- Séparation stricte public / authentifié : le contenu public (actualités, librairie, quiz en
  lecture) se fetch sans cookie et profite du cache/edge ; le contenu authentifié passe
  obligatoirement par `apiFetch()`.
- Le JS client ne fait jamais d'appel direct à `api.mec-ci.org` pour de l'authentifié — il passe
  par les route handlers du site (même origine), le cookie étant httpOnly donc invisible au JS.

## 2. Tooling & déterminisme

- Dépendances pinnées en version exacte (plus de `"latest"`), lockfile pnpm committé.
- ESLint (flat config, `typescript-eslint` + `eslint-plugin-react` + `eslint-plugin-react-hooks` +
  `eslint-config-prettier`) — `typescript` pinné en `6.0.3` pour rester dans la plage supportée par
  `typescript-eslint` (`>=4.8.4 <6.1.0`), plutôt que la dernière version `7.x` non encore supportée
  par l'écosystème lint. `eslint` pinné en `9.39.5` (ligne 9.x) plutôt que `10.x` : `eslint-plugin-react`
  ne déclare le support que jusqu'à `^9.7` au moment de l'installation.
- Prettier pour le format, Vitest pour les tests (`environment: "node"`, `passWithNoTests: true`
  tant qu'aucun test n'existe).
- Ordre d'installation respecté : `git init` → configs/scripts → `tsc --noEmit` + lint verts sur le
  scaffold → seulement ensuite, hook de vérification.

## 3. Workflow plan/spec obligatoire

Convention identique à `onmec_backend` : `docs/superpowers/specs/YYYY-MM-DD-<sujet>-design.md` et
`docs/superpowers/plans/YYYY-MM-DD-<sujet>.md`. Toute feature non triviale suit
`superpowers:brainstorming` → spec si architectural → `superpowers:writing-plans` →
`superpowers:executing-plans`. Les tâches bounded restent un design court en chat + approbation,
sans fichier — géré nativement par le skill, pas dupliqué dans CLAUDE.md.

## 4. Hooks de vérification & permissions

- `PostToolUse` sur `Edit`/`Write` de `*.ts`/`*.tsx` : `tsc --noEmit` + lint ciblé, retour direct
  dans le contexte de l'IA. Pas de hook bloquant sur les commits (friction inutile en solo).
- `.claude/settings.json` : permissions pré-approuvées sur le même modèle que
  `onmec_backend/.claude/settings.local.json` (`rtk pnpm *`, `rtk tsc *`, `rtk git *`, `rtk ls *`,
  `rtk grep *`, `npm run *`, etc.).
- Aucun garde-fou destructif supplémentaire — les confirmations par défaut de Claude Code restent
  inchangées.
