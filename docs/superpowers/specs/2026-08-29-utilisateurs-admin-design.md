# Section admin Utilisateurs et droits

## Contexte

La page `/admin/utilisateurs` (`app/admin/(shell)/utilisateurs/page.tsx`) est aujourd'hui 100% mock :
liste des comptes back-office (`features/admin/data/utilisateurs.ts`) et table "Droits par rôle"
(`features/admin/data/droits.ts`), toutes deux des constantes statiques inventées, jamais
branchées sur `onmec_backend`.

**Frontière** : ce repo (`onmec-site`) ne touche qu'au frontend. `onmec_backend` (repo séparé) n'est
lu que pour comprendre son contrat réel (`src/modules/admins/*`, `src/common/constantes/
capabilities-by-role.ts`) — jamais modifié depuis cette session.

Décisions de scope validées avec l'utilisateur :

- **Aucun endpoint backend manquant** : les 7 endpoints de `AdminsController` couvrent tout ce dont
  la page a besoin (liste, détail, créer, modifier, activer/désactiver, réinitialiser mot de passe).
  Aucun gap à transmettre à `onmec_backend`.
- **Rôles réels** : seulement 3 (`ADMIN_NATIONAL`, `CHARGE_COMMUNICATION`, `MODERATEUR`), à la place
  des 6 libellés inventés du mock ("Modérateur — vérification", "Coordination campus — lecture",
  "Rédacteur", etc.). Mapping via le helper déjà existant `mapAdminRole`/`ADMIN_ROLE_LABELS_LIST`
  (`features/admin-auth/lib/map-admin-role.ts`) — pas de nouvelle table de libellés.
- **Table "Droits par rôle" reste statique côté frontend**, mais avec les vraies données du backend
  (`capabilitiesByRole` de `src/common/constantes/capabilities-by-role.ts`), recopiées à la main.
  Le backend ne renvoie les capacités que pour l'acteur connecté (`AdminLoginResponse.capabilities`
  au login/refresh) — pas de matrice complète exposée par API, donc pas de possibilité de fetcher
  cette table dynamiquement sans un nouvel endpoint (non demandé pour l'instant).
- **Binaire réel, pas de "Lecture seule" inventé** : la matrice `capabilitiesByRole` n'a que
  présent/absent par rôle × capacité. Le mock actuel de `droits.ts` invente un 3ᵉ état "Lecture
  seule" qui n'existe pas côté backend (ex. `moderation: "Lecture seule"` sur Actualités — le
  backend ne donne à `MODERATEUR` que `ACTUALITE_READ`, ce qui correspond en fait à "Oui" sur une
  capacité de lecture, pas à un état intermédiaire générique). La nouvelle table affiche donc une
  ligne par capacité (`Capability` slug, ex. `actualite:write`) avec une colonne "Libellé" lisible et
  trois colonnes Oui/Non par rôle — pas une ligne par "module" avec un texte libre à 3 valeurs.

**Réservé `ADMIN_NATIONAL`** : les 7 routes de `AdminsController` sont gardées au niveau de la classe
entière par `@AdminRoles(AdminRole.ADMIN_NATIONAL)`. Cohérent avec `canUsers` déjà défini dans
`AdminShellState` comme `initialRole === "Administrateur national"` (`admin-shell-context.tsx`,
`admin-sidebar.tsx` avec `requires: "canUsers"`) — **aucun changement requis sur ce flag**, il gate
déjà correctement toute la section.

## Contrat backend (`onmec_backend/src/modules/admins/`, préfixe `/api/v1`)

Toutes les routes ci-dessous sont sous `@Controller('admins')`, `@UseGuards(JwtAuthGuard,
AdminGuard, AdminRolesGuard)`, `@AdminRoles(AdminRole.ADMIN_NATIONAL)`.

| Méthode | Route | Body / Query | Réponse |
| --- | --- | --- | --- |
| `GET` | `/admins` | Query `SearchAdminDto` : `search?`, `role?`, `page? (défaut 1)`, `limit? (défaut 10, max 100)` | `{ data: AdminResponseDto[], meta: { total, page, limit, totalPages } }` |
| `GET` | `/admins/:id` | — | `AdminResponseDto` |
| `POST` | `/admins` | `CreateAdminDto` : `{ fullname, email, phone?, role }` | `AdminResponseDto & { password: string }` — mot de passe temporaire en clair, **une seule fois** |
| `PATCH` | `/admins/:id` | `UpdateAdminDto` : `{ fullname?, phone?, role? }` (email non modifiable) | `AdminResponseDto` |
| `PATCH` | `/admins/:id/statut` | `UpdateAdminStatutDto` : `{ isActive: boolean }` | `AdminResponseDto` |
| `POST` | `/admins/:id/reset-password` | — | `{ email: string, password: string }` — mot de passe temporaire, une seule fois |
| `DELETE` | `/admins/:id` | — | `AdminResponseDto` (suppression logique, `deletedAt` posé) — **hors scope UI de cette passe** |

`AdminResponseDto` : `{ id, fullname, email, phone?, role, avatar?, isActive, mustChangePassword,
lastLoginAt?, createdAt, updatedAt, deletedAt? }`.

### Erreurs 4xx déjà gérées côté backend (le front affiche le message brut, pas de pré-validation dupliquée)

- `PATCH /admins/:id` avec `role` et `id === actor.id` → `400 BadRequestException` "Vous ne pouvez
  pas modifier votre propre rôle."
- `PATCH /admins/:id` qui rétrograderait le dernier `ADMIN_NATIONAL` actif → `400` "Impossible : ce
  compte est le dernier administrateur national actif."
- `PATCH /admins/:id/statut` avec `isActive: false` et `id === actor.id` → `400` "Vous ne pouvez pas
  désactiver votre propre compte."
- `PATCH /admins/:id/statut` qui désactiverait le dernier `ADMIN_NATIONAL` actif → même message que
  ci-dessus.
- `POST /admins` avec email déjà utilisé → `409 ConflictException`.

Le front ajoute des **garde-fous UI en plus** (désactiver l'action plutôt que laisser échouer l'appel)
pour l'auto-modification de rôle et l'auto-désactivation — voir § Garde-fous UI. Le cas "dernier
admin national" n'est pas dérivable côté front sans connaître l'état de tous les autres comptes ; il
reste géré uniquement par le message d'erreur backend affiché tel quel.

## Rôles

```ts
export type AdminRole = "ADMIN_NATIONAL" | "CHARGE_COMMUNICATION" | "MODERATEUR";
```

Déjà défini dans `features/admin-auth/types/admin-auth.ts`. Libellés via `mapAdminRole`/
`ADMIN_ROLE_LABELS_LIST` (`features/admin-auth/lib/map-admin-role.ts`) — **réutilisés tels quels**,
aucune nouvelle table de libellés dans `features/admin-users/`.

## État affiché ("Actif" / "Invitation" / "Inactif")

Pas de champ backend dédié — dérivé côté frontend à partir de `AdminResponseDto` :

```ts
function deriveEtatAffiche(admin: Pick<AdminResponseDto, "isActive" | "mustChangePassword" | "lastLoginAt">) {
  if (!admin.isActive) return "Inactif";
  if (admin.mustChangePassword && admin.lastLoginAt === null) return "Invitation";
  return "Actif";
}
```

## Modèle de données (`features/admin-users/types/`)

```ts
// admin-user.ts
import type { AdminRole } from "@/features/admin-auth/types/admin-auth";

export type AdminUserEtat = "Actif" | "Invitation" | "Inactif";

export interface AdminUser {
  id: string;
  fullname: string;
  email: string;
  phone: string | null;
  role: AdminRole;
  avatar: string | null;
  isActive: boolean;
  mustChangePassword: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminUserListResponse {
  data: AdminUser[];
  meta: AdminUserListMeta;
}

/** Résultat de création : mot de passe temporaire visible une seule fois. */
export interface CreatedAdminUser extends AdminUser {
  password: string;
}

/** Résultat d'une réinitialisation de mot de passe. */
export interface ResetAdminPassword {
  email: string;
  password: string;
}
```

`deriveEtatAffiche` (ci-dessus) vit dans `features/admin-users/lib/derive-etat-affiche.ts` — pure,
testable, consommée par la liste et la fiche.

## Garde-fous UI (empêcher un admin d'agir sur son propre compte)

Le backend refuse déjà ces actions (400), mais l'UI doit désactiver l'action à la source plutôt que
laisser l'utilisateur cliquer puis lire une erreur — nécessite de connaître l'id de l'acteur courant
dans le composant client.

`AdminShellState` (`components/features/admin/admin-shell-context.tsx`) n'expose aujourd'hui que
`role`/`fullname`/`email`, pas `id`. **Ajout requis** : `id: string` sur `AdminShellState`, dérivé de
`session.id` — champ **déjà présent** dans `AdminSession` (`features/admin-auth/types/admin-auth.ts`,
ligne `id: string`) et dans `getAdminSession()` (`app/admin/(shell)/layout.tsx`) : simple prop
supplémentaire passée à `<AdminShellProvider>`, aucune nouvelle requête serveur.

```ts
// admin-shell-context.tsx
interface AdminShellState {
  id: string; // + ajouté
  role: AdminRole;
  fullname: string;
  email: string;
  canSig: boolean;
  canEdito: boolean;
  canUsers: boolean;
  canMembres: boolean;
  canQuiz: boolean;
}
```

```tsx
// app/admin/(shell)/layout.tsx
<AdminShellProvider
  id={session.id}
  initialRole={mapAdminRole(session.role)}
  fullname={session.fullname}
  email={session.email}
>
```

Composants consommateurs (`AdminUsersClient`, dialogues rôle/statut) comparent `membre.id ===
shell.id` pour : désactiver l'entrée de menu "Modifier le rôle" sur sa propre ligne (avec `title`
explicatif), désactiver "Désactiver" sur sa propre ligne (le "Réactiver" ne concerne jamais son
propre compte puisqu'un compte inactif ne peut pas être connecté).

## Navigation

Aucun changement : `/admin/utilisateurs` existe déjà dans `admin-sidebar.tsx` avec `requires:
"canUsers"`. Pas de nouvelle entrée de nav à ajouter.

## Domaine frontend (`features/admin-users/`)

Miroir exact de `features/membres-admin/` (types/requests/schemas/mutations/queries), lui-même déjà
branché sur un flow API réel (voir `docs/superpowers/specs/2026-08-29-membres-quiz-admin-design.md`
§ Membres pour le patron general). BFF strict : `apiFetch()` (server, `lib/api-client.ts`) pour
parler à `api.mec-ci.org`, `fetch-json.ts` (`getJson`/`postJson`/`patchJson`) côté client pour parler
aux route handlers de onmec-site.

### Requêtes serveur (`features/admin-users/requests/`)

- `list-admin-users.ts` — `GET /admins?search=&role=&page=&limit=` → `AdminUserListResponse`. Mapping
  direct (`AdminResponseDto` ≈ `AdminUser`, pas de renommage de champs contrairement à
  `membres-admin` — pas de mapper séparé nécessaire, `phone`/`lastLoginAt`/`deletedAt` sont déjà en
  anglais des deux côtés).
- `get-admin-user.ts` — `GET /admins/:id` → `AdminUser`.
- `create-admin-user.ts` — `POST /admins`, body `{ fullname, email, phone?, role }` →
  `CreatedAdminUser`.
- `update-admin-user.ts` — `PATCH /admins/:id`, body `{ fullname?, phone?, role? }` → `AdminUser`.
- `changer-statut-admin-user.ts` — `PATCH /admins/:id/statut`, body `{ isActive: boolean }` →
  `AdminUser`.
- `reset-password-admin-user.ts` — `POST /admins/:id/reset-password` → `ResetAdminPassword`.

### Schemas Zod (`features/admin-users/schemas/`)

```ts
// creer-admin-user-schema.ts
import { z } from "zod";

export const creerAdminUserSchema = z.object({
  fullname: z.string().min(1, "Le nom complet est obligatoire.").max(100),
  email: z.string().email("Email invalide."),
  phone: z.string().max(20).optional(),
  role: z.enum(["ADMIN_NATIONAL", "CHARGE_COMMUNICATION", "MODERATEUR"]),
});
export type CreerAdminUserInput = z.infer<typeof creerAdminUserSchema>;
```

```ts
// modifier-role-admin-user-schema.ts
import { z } from "zod";

export const modifierRoleAdminUserSchema = z.object({
  role: z.enum(["ADMIN_NATIONAL", "CHARGE_COMMUNICATION", "MODERATEUR"]),
});
export type ModifierRoleAdminUserInput = z.infer<typeof modifierRoleAdminUserSchema>;
```

```ts
// changer-statut-admin-user-schema.ts
import { z } from "zod";

export const changerStatutAdminUserSchema = z.object({
  isActive: z.boolean(),
});
export type ChangerStatutAdminUserInput = z.infer<typeof changerStatutAdminUserSchema>;
```

Pas de schéma pour "modifier fullname/phone" isolément dans cette passe (non demandé par le
scope : seuls création, modification de rôle, et activation/désactivation sont des actions UI de
cette page — modifier fullname/phone n'est pas dans les 9 points du scope validé).

### Mutations client (`features/admin-users/mutations/`)

Patron identique à `features/membres-admin/mutations/use-changer-etat-membre.ts` :
`use-creer-admin-user.ts`, `use-modifier-role-admin-user.ts`, `use-changer-statut-admin-user.ts`,
`use-reset-password-admin-user.ts` — chacun un `useMutation` appelant la route handler BFF via
`postJson`/`patchJson`.

### Query liste (`features/admin-users/queries/`)

`use-admin-users-list.ts` — miroir exact de `features/membres-admin/queries/use-membres-list.ts`
(`useQuery` + `keepPreviousData`, `initialData` fourni par le Server Component tant que
recherche/filtre/page sont à leur valeur par défaut).

## Routes BFF (`app/api/admin/utilisateurs/`)

Miroir de `app/api/admin/membres/` : proxy `try/catch` + `toErrorResponse` (`lib/to-error-response.ts`),
`parseJsonBody` (`lib/parse-json-body.ts`) pour valider le body des méthodes d'écriture avant l'appel
serveur.

- `app/api/admin/utilisateurs/route.ts` — `GET` (liste), `POST` (création).
- `app/api/admin/utilisateurs/[id]/route.ts` — `PATCH` (modifier rôle).
- `app/api/admin/utilisateurs/[id]/statut/route.ts` — `PATCH` (activer/désactiver).
- `app/api/admin/utilisateurs/[id]/reset-password/route.ts` — `POST`.

## Page (`app/admin/(shell)/utilisateurs/page.tsx`)

Transformée en Server Component : lit `searchParams` (`q`, `role`, `page`), appelle
`listAdminUsers()` directement (comme `app/admin/(shell)/membres/page.tsx` appelle `listMembres()`),
passe le résultat à `<AdminUsersClient initialData={...} />`. La table "Droits par rôle" reste rendue
par la page elle-même (statique, pas de fetch) à partir de la nouvelle version de
`features/admin/data/droits.ts`.

## Composant client (`components/features/admin-users/admin-users-client.tsx`)

Miroir de `components/features/membres-admin/membres-admin-client.tsx` : recherche (debounce 300ms),
filtre rôle (`<Select>` avec les 3 rôles via `ADMIN_ROLE_LABELS_LIST`), pagination
(`LibrairiePagination`, déjà générique et réutilisé par `membres-admin`), colonnes Membre/Rôle/
État/Dernière connexion/Actions. Menu d'actions par ligne (`IconButton` ou menu, selon ce que le
budget de 200 lignes du fichier permet — extraire un `admin-user-row-actions.tsx` sinon, comme
documenté en option dans le plan Membres) : Modifier le rôle, Activer/Désactiver, Réinitialiser le
mot de passe.

## Table "Droits par rôle" (`features/admin/data/droits.ts`)

Remplacée par les vraies données de `capabilitiesByRole` (`onmec_backend/src/common/constantes/
capabilities-by-role.ts`), recopiées à la main (pas de génération automatique, pas de nouvel
endpoint). Nouvelle forme : une ligne par capacité, un libellé FR lisible, trois colonnes
booléennes.

```ts
export interface DroitCapacite {
  capacite: string; // slug backend, ex. "actualite:write" — affiché en info-bulle/petit texte
  libelle: string; // libellé FR lisible, ex. "Publier une actualité"
  administrateur: boolean;
  communication: boolean;
  moderation: boolean;
}

export const DROITS: DroitCapacite[] = [
  { capacite: "actualite:read", libelle: "Lire les actualités", administrateur: true, communication: true, moderation: true },
  { capacite: "actualite:write", libelle: "Rédiger une actualité", administrateur: true, communication: true, moderation: false },
  { capacite: "actualite:publish", libelle: "Publier une actualité", administrateur: true, communication: true, moderation: false },
  { capacite: "actualite:delete", libelle: "Supprimer une actualité", administrateur: true, communication: true, moderation: false },
  { capacite: "actualite:preview", libelle: "Prévisualiser brouillons/archives", administrateur: true, communication: true, moderation: false },
  { capacite: "commentaire:moderate", libelle: "Modérer les commentaires", administrateur: true, communication: true, moderation: true },
  { capacite: "member:read", libelle: "Consulter les membres (comptes citoyens)", administrateur: true, communication: false, moderation: true },
  { capacite: "member:suspend", libelle: "Suspendre un membre", administrateur: true, communication: false, moderation: true },
  { capacite: "member:delete", libelle: "Supprimer un membre", administrateur: true, communication: false, moderation: false },
  { capacite: "signalement:moderate", libelle: "Modérer les signalements", administrateur: true, communication: false, moderation: true },
  { capacite: "admin:manage", libelle: "Gérer les comptes back-office", administrateur: true, communication: false, moderation: false },
  { capacite: "librairie:manage", libelle: "Gérer la librairie de ressources", administrateur: true, communication: true, moderation: false },
  { capacite: "quiz:manage", libelle: "Gérer les quiz éducatifs", administrateur: true, communication: false, moderation: false },
];
```

Les libellés FR sont une traduction éditoriale du slug technique — à ajuster librement au moment de
l'implémentation si un libellé plus clair vient à l'esprit, la seule contrainte dure est
l'exactitude du booléen par rôle (recopié tel quel depuis `capabilitiesByRole`, ne jamais inventer
une capacité qui n'y figure pas).

Rendu par la page : table simple (module = capacité, colonnes Oui/Non), remplace l'ancien texte
libre "Plein accès / Lecture seule / Aucun accès" par une puce/coche binaire (`Tag` existant, tons
`blue`/`neutral`, ou icône `Check`/`Minus` de `lucide-react` — au choix de l'implémentation, cohérent
avec le reste des tables admin).

## Fiche de création (dialogue)

`components/features/admin-users/creer-admin-user-dialog.tsx` : formulaire (`fullname`, `email`,
`phone` optionnel, `role` via `<Select>`), validation Zod avant `mutate`, puis — **si succès** —
bascule le contenu du dialogue sur un écran "mot de passe temporaire" :

- Avertissement explicite et visible (ex. bandeau orange) : "Ce mot de passe ne sera plus jamais
  affiché. Notez-le ou transmettez-le maintenant au titulaire du compte."
- Le mot de passe en clair dans un champ en lecture seule + bouton "Copier" (`navigator.clipboard.
  writeText`, retour visuel bref "Copié" — premier usage du clipboard dans le repo, pas d'abstraction
  `lib/clipboard.ts` tant qu'un 2ᵉ site d'usage n'apparaît pas).
- Le dialogue ne se ferme pas tout seul après la création (contrairement au patron générique
  "succès → close") : seule une action explicite de l'utilisateur ("J'ai noté le mot de passe,
  fermer") referme et invalide la liste (`queryClient.invalidateQueries(["admin-users-list"])`).

## Fiche de modification de rôle (dialogue)

`components/features/admin-users/modifier-role-admin-user-dialog.tsx` : `<Select>` des 3 rôles,
présélectionné sur le rôle actuel, `disabled` avec message si `adminUser.id === shell.id` (garde-fou
UI § plus haut) — au cas où le menu qui ouvre ce dialogue n'aurait pas déjà bloqué l'accès.

## Fiche d'activation/désactivation (dialogue)

`components/features/admin-users/changer-statut-admin-user-dialog.tsx` — miroir de
`components/features/membres-admin/changer-etat-membre-dialog.tsx` (bouton "Désactiver"/"Réactiver"
contextuel, pas de champ "motif" côté backend ici puisque `UpdateAdminStatutDto` n'a que
`isActive`). Menu déclencheur désactivé sur sa propre ligne (garde-fou UI).

## Réinitialisation de mot de passe

Pas de dialogue de confirmation dédié à part entière si une simple `ConfirmDialog` existante suffit
(à vérifier à l'implémentation) — au succès, afficher le nouveau mot de passe temporaire avec le
même traitement "une seule fois + copier" que la création (réutilisation du même sous-composant
d'affichage, ex. `mot-de-passe-temporaire-reveal.tsx`, partagé entre création et reset — évite de
dupliquer le bloc avertissement/champ/copier).

## Vérification

- `pnpm run typecheck`, `pnpm run lint`, `pnpm run test`, `pnpm run build`.
- Vérification manuelle : connexion en `ADMIN_NATIONAL`, `/admin/utilisateurs` charge la vraie liste
  des comptes back-office. Créer un compte, vérifier l'affichage unique du mot de passe temporaire et
  le bouton copier. Modifier le rôle d'un autre compte (pas le sien). Désactiver puis réactiver un
  autre compte. Réinitialiser le mot de passe d'un compte. Vérifier que les actions "modifier mon
  propre rôle" et "me désactiver" sont bien désactivées dans l'UI sur sa propre ligne. Vérifier le
  message d'erreur backend brut si on tente (via un autre compte `ADMIN_NATIONAL` de test) de
  rétrograder/désactiver le dernier admin national actif. Table "Droits par rôle" affiche les vraies
  capacités avec Oui/Non exacts.
- `convention-drift-check` sur le diff avant de committer.

## Hors scope explicite

- `DELETE /admins/:id` (suppression logique) — non exposé dans l'UI de cette passe (demandé
  explicitement hors scope).
- Modifier `fullname`/`phone` d'un compte existant en dehors de la création — non demandé par le
  scope validé (seuls création, rôle, statut, reset mot de passe sont des actions UI).
- Tout changement au repo `onmec_backend` — aucun gap identifié, rien à transmettre.
- Toute autre section admin déjà implémentée — non retouchée au-delà de l'ajout de `id` sur
  `AdminShellState` (Task 0 du plan), strictement additif.
