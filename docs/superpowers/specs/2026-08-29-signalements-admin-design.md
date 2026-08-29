# Signalements admin — branchement sur l'API réelle

## Contexte

`app/admin/(shell)/signalements/page.tsx` et ses composants (`components/features/admin/signalement-*.tsx`)
fonctionnent entièrement sur un tableau mocké (`features/admin/data/signalements.ts`), en state local. Le
backend expose déjà `signalement-citoyen` (module `onmec_backend/src/modules/signalement-citoyen`) : il
faut brancher le vrai flux, en suivant les conventions déjà en place pour `quiz-admin` et `membres-admin`
(couche `features/<domaine>/{types,requests,queries,mutations}`, route handlers `app/api/admin/*`, règle
« filtres/pagination côté client, jamais `router.push`/`router.refresh` » de `docs/ARCHITECTURE.md`).

## Mapping mock → API réelle

| Mock (`Signalement`) | Backend (`SignalementCitoyenDto`) | Note |
|---|---|---|
| `id` | `id` | UUID, pas de format `SIG-2026-xxxx` côté backend — l'UI garde juste `id.slice(...)` ou l'UUID brut, à voir à l'implémentation |
| `sujet` | `titre` | |
| `categorie` (string libre) | `categorieId` + `categorie.nom` (relation) | catégories dynamiques via `GET /categorie-signalement`, remplace `CATEGORIES_SIGNALEMENT` codé en dur |
| `lieu` | `adresse` (+ `latitude`/`longitude`, non affichés) | |
| `recu` | `createdAt` | formatage date côté front |
| `auteur` | `citoyen.fullname` | `citoyen` peut être absent si compte supprimé — fallback `"—"` |
| `statut` (4 valeurs : validation/encours/resolu/rejete) | `statut` enum `NOUVEAU/EN_COURS/RESOLU/REJETE` | mapping 1:1, `NOUVEAU` → `"validation"` |
| `publie` (bool) | `validation` (bool) | déjà conceptuellement séparé du statut dans le panneau de modération actuel — aucun changement d'UX, juste le nom du champ |
| `responsable` | — | **absent côté backend, retiré de l'UI pour l'instant** (décision utilisateur) |
| `updates: SignalementUpdate[]` | — | **absent côté backend, gap** — voir § Dépendance backend |
| `delai` (relatif, "il y a 2h") | dérivé de `createdAt` côté front | pas de champ backend dédié |

## Composants et fichiers

**Nouvelle couche `features/signalements-admin/`**
- `types/signalement-admin.ts` — `SignalementAdmin`, `SignalementCategorie`, `SignalementListResponse`
- `requests/list-signalements.ts` — `GET /signalement-citoyen` (search/statut/categorieId/page/limit), server-only via `apiFetch`
- `requests/update-signalement.ts` — `PATCH /signalement-citoyen/:id` (`{ statut?, validation? }`)
- `requests/list-signalement-categories.ts` — `GET /categorie-signalement`
- `queries/use-signalements-list.ts` — `useQuery` (TanStack), `initialData` seedé par le SSR uniquement à l'état par défaut des filtres, `placeholderData: keepPreviousData`, suit le patron `use-quiz-list.ts`/`use-membres-list.ts`
- `queries/use-signalement-categories.ts`
- `mutations/use-update-signalement.ts` — invalide `["signalements-list"]` après succès

**Route handlers BFF**
- `app/api/admin/signalements/route.ts` (GET)
- `app/api/admin/signalements/[id]/route.ts` (PATCH)
- `app/api/admin/signalement-categories/route.ts` (GET)

**UI** (déplacée de `components/features/admin/` vers `components/features/signalements-admin/`)
- `signalement-drawer.tsx`, `signalement-moderation-panel.tsx`, `signalement-updates-panel.tsx` → adaptés au
  type `SignalementAdmin` et aux vrais champs
- `signalements-admin-client.tsx` (nouveau) — logique liste/filtres/pagination côté client, remplace la
  logique aujourd'hui inline dans `page.tsx`
- `app/admin/(shell)/signalements/page.tsx` devient un Server Component : fetch initial (liste + catégories)
  via `apiFetch`, rendu de `<SignalementsAdminClient initialData categories />`

**Retiré**
- Bouton « Exporter le mois » (page liste) — aucun endpoint d'export côté backend, pas demandé
- Bloc « Responsable du suivi » (panneau de modération) — champ absent côté backend

## Filtres, pagination, mutation — application de la règle ARCHITECTURE.md

- Onglets de statut (tags), select catégorie, pagination : state local + `useSignalementsList`, jamais de
  navigation. URL reflétée via `syncUrlParams` (`?statut=&categorieId=&page=`)
- Après un PATCH (statut, validation) : `queryClient.invalidateQueries({ queryKey: ["signalements-list"] })`,
  jamais `router.refresh()`
- Le tiroir de détail réutilise l'objet déjà présent dans la liste chargée (pas de `GET /:id` séparé) — même
  limite que le mock actuel : un `?open=` vers un signalement hors de la page/filtre courant ne s'ouvre pas
  automatiquement

## Dépendance backend

Le panneau « Mises à jour » (journal d'échanges admin ↔ citoyen, visible par le citoyen dans l'app) reste
pour l'instant en **state local uniquement**, non persisté — même traitement que `isCorrect` pour le quiz
avant que le backend le livre. Gap à transmettre :

- Un modèle de suivi par signalement : `{ id, signalementId, auteur (Admin), texte, createdAt }`
- `POST /signalement-citoyen/:id/updates` (admin uniquement) — ajoute une entrée
- Les entrées exposées soit dans `GET /signalement-citoyen/:id` (champ `updates`), soit via
  `GET /signalement-citoyen/:id/updates` dédié — au choix du backend, à documenter dans sa réponse

Une fois livré, un aller-retour de câblage rapide suit (même patron que le branchement `isCorrect`/
`totalAttempts`/`quizCount` fait pour quiz-admin cette session).

## Hors scope

- Création/suppression de signalement depuis l'admin (pas demandé, pas de bouton dans le mock)
- Recherche plein texte (le backend la supporte via `search`, mais l'UI mock n'a pas de champ recherche —
  pas ajouté ici, YAGNI)
- Affichage de la photo du signalement dans le tiroir (le backend la retourne, l'UI mock ne l'affiche pas)
