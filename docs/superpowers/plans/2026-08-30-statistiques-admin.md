# Plan — Statistiques admin

Suit la spec `docs/superpowers/specs/2026-08-30-statistiques-admin-design.md`.
Bloqué par un gap backend (`GET /admin/statistics` n'existe pas encore) — ce
plan livre la couche frontend prête à consommer l'endpoint dès qu'il existe,
avec un état "à venir" en attendant.

## Task 1 — Types et request server-only

- Create `features/statistiques-admin/types/admin-statistics.ts` (`AdminStatistics`, `SignalementStatutApi` — miroir du DTO de la spec).
- Create `features/statistiques-admin/requests/get-admin-statistics.ts` — `apiFetch<AdminStatistics>("/admin/statistics")`, pattern identique à `features/quiz-admin/requests/get-quiz-stats.ts`.

## Task 2 — Page Server Component avec état "à venir"

Pas de route BFF : la page est un Server Component pur, sans interactivité
client (période/rapport supprimés), donc appel direct à
`getAdminStatistics()`.

- Réécrire `app/admin/(shell)/statistiques/page.tsx` : appelle `getAdminStatistics()` côté serveur dans un try/catch ; si `ApiError` (endpoint pas encore livré), passe `stats: null`.
- Si `stats` non null : cartes `Stat` (total signalements, signalements résolus, membres actifs, quiz + tentatives + score moyen) + tableaux "par statut" et "par catégorie" pour signalements.
- Si `stats` est `null` : bandeau "à venir" (même pattern visuel que `components/features/membres-admin/membre-tab-a-venir.tsx`, réimplémenté localement — pas d'import cross-domaine).
- Supprimer `features/admin/data/statistiques.ts` (plus aucune référence après la réécriture de la page).

## Vérification

- `pnpm run typecheck && pnpm run lint && pnpm run test`.
- Manuel : `/admin/statistiques` affiche le bandeau "à venir" tant que le backend n'a pas livré l'endpoint (comportement attendu aujourd'hui).

## Hors scope

Voir la spec — géographie, actif/inactif sur `/admins`, série mensuelle,
implémentation backend.
