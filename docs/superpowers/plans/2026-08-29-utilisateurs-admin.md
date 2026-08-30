# Section admin Utilisateurs et droits — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (Tasks 2-8 dépendent de Task 0-1, mais Task 9 § table des droits est indépendante et peut être
> menée en parallèle dès le début) or superpowers:executing-plans. Steps use checkbox (`- [ ]`)
> syntax for tracking.

**Goal:** Brancher `/admin/utilisateurs` sur le vrai contrat `onmec_backend`
(`src/modules/admins/*`) — liste, création avec mot de passe temporaire à usage unique,
modification de rôle, activation/désactivation, réinitialisation de mot de passe — et remplacer la
table statique "Droits par rôle" par les vraies capacités du backend. Aucun gap backend identifié :
tout est développable immédiatement.

**Spec:** `docs/superpowers/specs/2026-08-29-utilisateurs-admin-design.md`

**Tech Stack:** Next.js App Router (route handlers), React 19, TanStack Query, Zod, TypeScript
strict, Vitest.

## Global Constraints

- BFF strict : `apiFetch()` (server, `lib/api-client.ts`) pour parler à `api.mec-ci.org`,
  `fetch-json.ts` (client) pour parler aux route handlers de onmec-site. Aucun appel client direct
  au backend.
- Fichiers de 200 lignes maximum sauf nécessité réelle documentée.
- Toutes les 7 routes `AdminsController` sont réservées `ADMIN_NATIONAL` côté backend — cohérent
  avec `canUsers` déjà défini dans `AdminShellState`, aucun changement de droits nécessaire au-delà
  de l'ajout de `id`.
- Le mot de passe temporaire (création, reset) n'est **jamais** re-fetché ni stocké : affiché une
  seule fois depuis la réponse de la mutation, jamais persisté côté client au-delà de l'état du
  dialogue ouvert.
- Aucune modification du repo `onmec_backend`.

---

## Task 0: `id` sur `AdminShellState` (garde-fous UI)

**Files:**

- Modify: `components/features/admin/admin-shell-context.tsx`
- Modify: `app/admin/(shell)/layout.tsx`

**Interfaces:**

- Produces: `AdminShellState.id` — consommé par `AdminUsersClient` et les dialogues rôle/statut
  (Task 6) pour désactiver les actions sur son propre compte.

- [ ] **Step 1: Étendre `AdminShellState` et `AdminShellProviderProps`**

```ts
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

interface AdminShellProviderProps {
  children: ReactNode;
  id: string; // + ajouté, pas de défaut (toujours fourni par le layout)
  initialRole?: AdminRole;
  fullname?: string;
  email?: string;
}
```

Ajouter `id` au `useMemo` de dérivation et à ses dépendances.

- [ ] **Step 2: Passer `session.id` depuis le layout**

```tsx
// app/admin/(shell)/layout.tsx
<AdminShellProvider
  id={session.id}
  initialRole={mapAdminRole(session.role)}
  fullname={session.fullname}
  email={session.email}
>
```

`session.id` existe déjà sur `AdminSession` (`features/admin-auth/types/admin-auth.ts`) — aucune
nouvelle requête serveur.

- [ ] **Step 3: Vérifier**

Run: `pnpm run typecheck`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add components/features/admin/admin-shell-context.tsx "app/admin/(shell)/layout.tsx"
git commit -m "feat(admin-shell): exposer l'id de l'acteur courant"
```

---

## Task 1: Types, schemas, requêtes de lecture

**Files:**

- Create: `features/admin-users/types/admin-user.ts`
- Create: `features/admin-users/lib/derive-etat-affiche.ts`
- Create: `features/admin-users/lib/derive-etat-affiche.test.ts`
- Create: `features/admin-users/requests/list-admin-users.ts`
- Create: `features/admin-users/requests/get-admin-user.ts`

**Interfaces:**

- Produces: `AdminUser`, `AdminUserEtat`, `deriveEtatAffiche()`, `listAdminUsers()`,
  `getAdminUser(id)` — consommés par les route handlers (Task 2) et `AdminUsersClient` (Task 5).

- [ ] **Step 1: Types**

Recopier tel quel le bloc `## Modèle de données` du spec dans
`features/admin-users/types/admin-user.ts` (`AdminUser`, `AdminUserEtat`, `AdminUserListMeta`,
`AdminUserListResponse`, `CreatedAdminUser`, `ResetAdminPassword`).

- [ ] **Step 2: Écrire le test de `deriveEtatAffiche`**

```ts
// features/admin-users/lib/derive-etat-affiche.test.ts
import { describe, expect, it } from "vitest";
import { deriveEtatAffiche } from "./derive-etat-affiche";

describe("deriveEtatAffiche", () => {
  it("retourne Inactif si isActive est faux", () => {
    expect(
      deriveEtatAffiche({ isActive: false, mustChangePassword: true, lastLoginAt: null }),
    ).toBe("Inactif");
  });

  it("retourne Invitation si mustChangePassword et jamais connecté", () => {
    expect(
      deriveEtatAffiche({ isActive: true, mustChangePassword: true, lastLoginAt: null }),
    ).toBe("Invitation");
  });

  it("retourne Actif sinon", () => {
    expect(
      deriveEtatAffiche({
        isActive: true,
        mustChangePassword: false,
        lastLoginAt: "2026-08-01T00:00:00.000Z",
      }),
    ).toBe("Actif");
  });
});
```

- [ ] **Step 3: Lancer le test, vérifier qu'il échoue**

Run: `pnpm run test derive-etat-affiche`
Expected: FAIL (module introuvable)

- [ ] **Step 4: Implémenter**

```ts
// features/admin-users/lib/derive-etat-affiche.ts
import type { AdminUser, AdminUserEtat } from "@/features/admin-users/types/admin-user";

export function deriveEtatAffiche(
  admin: Pick<AdminUser, "isActive" | "mustChangePassword" | "lastLoginAt">,
): AdminUserEtat {
  if (!admin.isActive) return "Inactif";
  if (admin.mustChangePassword && admin.lastLoginAt === null) return "Invitation";
  return "Actif";
}
```

- [ ] **Step 5: Lancer le test, vérifier qu'il passe**

Run: `pnpm run test derive-etat-affiche`
Expected: PASS (3 tests)

- [ ] **Step 6: `list-admin-users.ts`, `get-admin-user.ts`**

```ts
// features/admin-users/requests/list-admin-users.ts
import { apiFetch } from "@/lib/api-client";
import type { AdminUserListResponse } from "@/features/admin-users/types/admin-user";
import type { AdminRole } from "@/features/admin-auth/types/admin-auth";

export interface ListAdminUsersParams {
  search?: string;
  role?: AdminRole;
  page?: number;
  limit?: number;
}

export function listAdminUsers(params: ListAdminUsersParams = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.role) query.set("role", params.role);
  query.set("page", String(params.page ?? 1));
  query.set("limit", String(params.limit ?? 10));
  return apiFetch<AdminUserListResponse>(`/admins?${query}`);
}
```

```ts
// features/admin-users/requests/get-admin-user.ts
import { apiFetch } from "@/lib/api-client";
import type { AdminUser } from "@/features/admin-users/types/admin-user";

export function getAdminUser(id: string) {
  return apiFetch<AdminUser>(`/admins/${id}`);
}
```

Pas de mapper : `AdminResponseDto` backend et `AdminUser` front partagent déjà les mêmes noms de
champs (contrairement à `membres-admin`, qui traduit `fullname`→`nom` etc. — ici pas de traduction
FR nécessaire, `fullname`/`phone`/`role`/`isActive` restent tels quels).

- [ ] **Step 7: Vérifier**

Run: `pnpm run typecheck && pnpm run test`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add features/admin-users/types/ features/admin-users/lib/ features/admin-users/requests/list-admin-users.ts features/admin-users/requests/get-admin-user.ts
git commit -m "feat(admin-users): types, etat derive, requetes de lecture"
```

---

## Task 2: Route handlers de lecture (liste)

**Files:**

- Create: `app/api/admin/utilisateurs/route.ts` (GET seulement à cette étape — POST ajouté Task 3)

**Interfaces:**

- Consumes: `listAdminUsers` (Task 1), `toErrorResponse` (`lib/to-error-response.ts`).
- Produces: route `GET /api/admin/utilisateurs` — consommée par `app/admin/(shell)/utilisateurs/
  page.tsx` (Task 8) et `use-admin-users-list.ts` (Task 4).

Patron identique à `app/api/admin/membres/route.ts`.

- [ ] **Step 1: `app/api/admin/utilisateurs/route.ts` (GET)**

```ts
import { NextResponse } from "next/server";
import { listAdminUsers } from "@/features/admin-users/requests/list-admin-users";
import { toErrorResponse } from "@/lib/to-error-response";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  try {
    const result = await listAdminUsers({
      search: searchParams.get("search") ?? undefined,
      role: (searchParams.get("role") as never) ?? undefined,
      page: Number(searchParams.get("page") ?? 1),
      limit: Number(searchParams.get("limit") ?? 10),
    });
    return NextResponse.json(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
```

- [ ] **Step 2: Vérifier**

Run: `pnpm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add app/api/admin/utilisateurs/route.ts
git commit -m "feat(admin-users): route handler de liste"
```

---

## Task 3: Création — schema, requête, route (POST), mutation

**Files:**

- Create: `features/admin-users/schemas/creer-admin-user-schema.ts`
- Create: `features/admin-users/requests/create-admin-user.ts`
- Modify: `app/api/admin/utilisateurs/route.ts` (ajout du `POST`)
- Create: `features/admin-users/mutations/use-creer-admin-user.ts`

**Interfaces:**

- Produces: `useCreerAdminUser()` — consommé par `CreerAdminUserDialog` (Task 6).

- [ ] **Step 1: Schema**

Recopier `creerAdminUserSchema` du spec dans
`features/admin-users/schemas/creer-admin-user-schema.ts`.

- [ ] **Step 2: Requête serveur**

```ts
// features/admin-users/requests/create-admin-user.ts
import { apiFetch } from "@/lib/api-client";
import type { CreerAdminUserInput } from "@/features/admin-users/schemas/creer-admin-user-schema";
import type { CreatedAdminUser } from "@/features/admin-users/types/admin-user";

export function createAdminUser(input: CreerAdminUserInput) {
  return apiFetch<CreatedAdminUser>("/admins", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
```

- [ ] **Step 3: Ajouter le `POST` à la route handler**

```ts
// app/api/admin/utilisateurs/route.ts — ajouter à côté du GET existant
import { createAdminUser } from "@/features/admin-users/requests/create-admin-user";
import { creerAdminUserSchema } from "@/features/admin-users/schemas/creer-admin-user-schema";
import { parseJsonBody } from "@/lib/parse-json-body";

export async function POST(request: Request) {
  const parsed = await parseJsonBody(request, creerAdminUserSchema);
  if (!parsed.success) return parsed.response;
  try {
    const result = await createAdminUser(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
```

- [ ] **Step 4: Mutation client**

```ts
// features/admin-users/mutations/use-creer-admin-user.ts
"use client";
import { useMutation } from "@tanstack/react-query";
import { postJson } from "@/lib/fetch-json";
import type { CreerAdminUserInput } from "@/features/admin-users/schemas/creer-admin-user-schema";
import type { CreatedAdminUser } from "@/features/admin-users/types/admin-user";

export function useCreerAdminUser() {
  return useMutation({
    mutationFn: (input: CreerAdminUserInput) =>
      postJson<CreatedAdminUser>("/api/admin/utilisateurs", input),
  });
}
```

- [ ] **Step 5: Vérifier**

Run: `pnpm run typecheck`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add features/admin-users/schemas/creer-admin-user-schema.ts features/admin-users/requests/create-admin-user.ts app/api/admin/utilisateurs/route.ts features/admin-users/mutations/use-creer-admin-user.ts
git commit -m "feat(admin-users): creation de compte back-office"
```

---

## Task 4: Rôle, statut, reset mot de passe — schemas, requêtes, routes, mutations, query liste

**Files:**

- Create: `features/admin-users/schemas/modifier-role-admin-user-schema.ts`
- Create: `features/admin-users/schemas/changer-statut-admin-user-schema.ts`
- Create: `features/admin-users/requests/update-admin-user.ts`
- Create: `features/admin-users/requests/changer-statut-admin-user.ts`
- Create: `features/admin-users/requests/reset-password-admin-user.ts`
- Create: `app/api/admin/utilisateurs/[id]/route.ts`
- Create: `app/api/admin/utilisateurs/[id]/statut/route.ts`
- Create: `app/api/admin/utilisateurs/[id]/reset-password/route.ts`
- Create: `features/admin-users/mutations/use-modifier-role-admin-user.ts`
- Create: `features/admin-users/mutations/use-changer-statut-admin-user.ts`
- Create: `features/admin-users/mutations/use-reset-password-admin-user.ts`
- Create: `features/admin-users/queries/use-admin-users-list.ts`

**Interfaces:**

- Produces: `useModifierRoleAdminUser()`, `useChangerStatutAdminUser()`,
  `useResetPasswordAdminUser()`, `useAdminUsersList()` — consommés par les dialogues et
  `AdminUsersClient` (Tasks 5-6).

- [ ] **Step 1: Schemas**

Recopier `modifierRoleAdminUserSchema` et `changerStatutAdminUserSchema` du spec.

- [ ] **Step 2: Requêtes serveur**

```ts
// features/admin-users/requests/update-admin-user.ts
import { apiFetch } from "@/lib/api-client";
import type { ModifierRoleAdminUserInput } from "@/features/admin-users/schemas/modifier-role-admin-user-schema";
import type { AdminUser } from "@/features/admin-users/types/admin-user";

export function updateAdminUser(id: string, input: ModifierRoleAdminUserInput) {
  return apiFetch<AdminUser>(`/admins/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
```

```ts
// features/admin-users/requests/changer-statut-admin-user.ts
import { apiFetch } from "@/lib/api-client";
import type { ChangerStatutAdminUserInput } from "@/features/admin-users/schemas/changer-statut-admin-user-schema";
import type { AdminUser } from "@/features/admin-users/types/admin-user";

export function changerStatutAdminUser(id: string, input: ChangerStatutAdminUserInput) {
  return apiFetch<AdminUser>(`/admins/${id}/statut`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
```

```ts
// features/admin-users/requests/reset-password-admin-user.ts
import { apiFetch } from "@/lib/api-client";
import type { ResetAdminPassword } from "@/features/admin-users/types/admin-user";

export function resetPasswordAdminUser(id: string) {
  return apiFetch<ResetAdminPassword>(`/admins/${id}/reset-password`, { method: "POST" });
}
```

- [ ] **Step 3: Route handlers**

Patron identique à `app/api/admin/membres/[id]/etat/route.ts` (`parseJsonBody` + `toErrorResponse`
pour PATCH ; pour `reset-password/route.ts`, pas de body à parser, juste `try/catch` autour de
l'appel `POST`).

- [ ] **Step 4: Mutations client**

Patron identique à `features/membres-admin/mutations/use-changer-etat-membre.ts` pour les trois
premières (`patchJson`/`postJson` vers la route handler correspondante).

- [ ] **Step 5: `use-admin-users-list.ts`**

Miroir exact de `features/membres-admin/queries/use-membres-list.ts` : `search`, `role`, `page`,
`initialData`, `queryKey: ["admin-users-list", search, role, page]`.

- [ ] **Step 6: Vérifier**

Run: `pnpm run typecheck`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add features/admin-users/schemas/modifier-role-admin-user-schema.ts features/admin-users/schemas/changer-statut-admin-user-schema.ts features/admin-users/requests/update-admin-user.ts features/admin-users/requests/changer-statut-admin-user.ts features/admin-users/requests/reset-password-admin-user.ts "app/api/admin/utilisateurs/[id]/" features/admin-users/mutations/ features/admin-users/queries/
git commit -m "feat(admin-users): role, statut, reinitialisation mot de passe"
```

---

## Task 5: Composant partagé "mot de passe temporaire"

**Files:**

- Create: `components/features/admin-users/mot-de-passe-temporaire-reveal.tsx`

**Interfaces:**

- Produces: `<MotDePasseTemporaireReveal password email onDone />` — consommé par
  `CreerAdminUserDialog` et `ResetPasswordAdminUserDialog` (Task 6).

- [ ] **Step 1: Implémenter**

```tsx
// components/features/admin-users/mot-de-passe-temporaire-reveal.tsx
"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

interface MotDePasseTemporaireRevealProps {
  email: string;
  password: string;
  onDone: () => void;
}

export function MotDePasseTemporaireReveal({
  email,
  password,
  onDone,
}: MotDePasseTemporaireRevealProps) {
  const [copie, setCopie] = useState(false);

  async function copier() {
    await navigator.clipboard.writeText(password);
    setCopie(true);
    setTimeout(() => setCopie(false), 2000);
  }

  return (
    <div className="flex flex-col gap-4.5 p-5.5">
      <Alert tone="warning">
        Ce mot de passe ne sera plus jamais affiché. Notez-le ou transmettez-le maintenant au
        titulaire du compte ({email}).
      </Alert>
      <div className="flex items-center gap-2.5 rounded-md border border-border-subtle bg-n-50 px-3.5 py-2.5">
        <code className="flex-1 text-sm font-medium text-ink">{password}</code>
        <Button variant="ghost" icon={copie ? Check : Copy} onClick={copier}>
          {copie ? "Copié" : "Copier"}
        </Button>
      </div>
      <Button variant="primary" onClick={onDone}>
        J’ai noté le mot de passe, fermer
      </Button>
    </div>
  );
}
```

`Alert` (`components/ui/alert.tsx`) déjà présent dans `components/ui/` — vérifier la prop exacte de
ton ("warning" ou équivalent) à l'implémentation, ajuster au composant réel plutôt qu'inventer une
prop absente.

- [ ] **Step 2: Vérifier**

Run: `pnpm run typecheck && pnpm run lint`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add components/features/admin-users/mot-de-passe-temporaire-reveal.tsx
git commit -m "feat(admin-users): affichage a usage unique du mot de passe temporaire"
```

---

## Task 6: Dialogues (création, rôle, statut, reset)

**Files:**

- Create: `components/features/admin-users/creer-admin-user-dialog.tsx`
- Create: `components/features/admin-users/modifier-role-admin-user-dialog.tsx`
- Create: `components/features/admin-users/changer-statut-admin-user-dialog.tsx`
- Create: `components/features/admin-users/reset-password-admin-user-dialog.tsx`

**Interfaces:**

- Consumes: Tasks 3-5, `useAdminShell` (garde-fous `id`), `Dialog`/`DialogTitle`, `Field`/`Input`/
  `Select`, `Button`/`IconButton`.
- Produces: consommés par `AdminUsersClient` (Task 7).

- [ ] **Step 1: `creer-admin-user-dialog.tsx`**

Formulaire contrôlé (`fullname`, `email`, `phone`, `role`), validation `creerAdminUserSchema` avant
`mutate`. Deux étapes internes (`useState<"form" | "reveal">`) : après succès de
`useCreerAdminUser()`, bascule sur `"reveal"` et rend `<MotDePasseTemporaireReveal>` avec le
résultat de la mutation ; `onDone` referme le dialogue et invalide
`queryClient.invalidateQueries({ queryKey: ["admin-users-list"] })`. Le dialogue ne se ferme
jamais sur `onSuccess` seul (contrairement au patron générique des autres dialogues du repo) —
uniquement via l'action explicite de l'étape reveal.

- [ ] **Step 2: `modifier-role-admin-user-dialog.tsx`**

`<Select>` des 3 rôles via `ADMIN_ROLE_LABELS_LIST`/`mapAdminRole` (afficher les libellés, soumettre
la valeur `AdminRole` technique), présélectionné sur `adminUser.role`. `disabled` (select + bouton
"Enregistrer") si `adminUser.id === shell.id`, avec un texte explicatif ("Vous ne pouvez pas modifier
votre propre rôle."). `mutation.isError` affiche `mutation.error.message` (le message backend brut,
ex. "dernier administrateur national actif") plutôt qu'un message générique.

- [ ] **Step 3: `changer-statut-admin-user-dialog.tsx`**

Miroir de `components/features/membres-admin/changer-etat-membre-dialog.tsx`, adapté à
`isActive: boolean` (pas de `raison`, absent de `UpdateAdminStatutDto`). Bouton "Désactiver" masqué/
`disabled` sur sa propre ligne (garde-fou UI) — le bouton "Réactiver" n'a pas cette contrainte
(on ne peut pas être connecté depuis un compte inactif).

- [ ] **Step 4: `reset-password-admin-user-dialog.tsx`**

`ConfirmDialog` (si le composant générique existe déjà dans `components/ui/` — sinon un `Dialog`
simple avec un bouton "Réinitialiser") suivi, au succès, du même écran `reveal` que la création
(`<MotDePasseTemporaireReveal>` réutilisé).

- [ ] **Step 5: Vérifier**

Run: `pnpm run typecheck && pnpm run lint`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add components/features/admin-users/creer-admin-user-dialog.tsx components/features/admin-users/modifier-role-admin-user-dialog.tsx components/features/admin-users/changer-statut-admin-user-dialog.tsx components/features/admin-users/reset-password-admin-user-dialog.tsx
git commit -m "feat(admin-users): dialogues creation, role, statut, reinitialisation"
```

---

## Task 7: Liste (`admin-users-client.tsx`)

**Files:**

- Create: `components/features/admin-users/admin-users-client.tsx`
- Create: `components/features/admin-users/admin-user-row-actions.tsx` (si le budget de 200 lignes
  du client l'exige — sinon intégré directement, à trancher à l'implémentation comme pour
  `membres-admin-client.tsx`)

**Interfaces:**

- Consumes: Task 4 (`useAdminUsersList`), Task 6 (dialogues), `useAdminShell`.
- Produces: `<AdminUsersClient initialData />` — consommé par
  `app/admin/(shell)/utilisateurs/page.tsx` (Task 8).

- [ ] **Step 1: Implémenter**

Miroir exact de `components/features/membres-admin/membres-admin-client.tsx` : recherche
(debounce 300ms), `<Select>` filtre rôle (options = `ADMIN_ROLE_LABELS_LIST`), pagination
(`LibrairiePagination`), `syncUrlParams({ q, role, page })`. Colonnes : Membre (nom + email), Rôle
(libellé via `mapAdminRole`), État (`Tag`, via `deriveEtatAffiche` — tons `blue`="Actif",
`neutral`="Invitation", `outline`="Inactif" ou équivalent déjà utilisé ailleurs dans le repo),
Dernière connexion (`formatDate` si non `null`, sinon "—"), Actions (icônes ou menu : modifier rôle,
activer/désactiver, réinitialiser mot de passe — `disabled` avec `title` sur les actions concernées
par le garde-fou `id === shell.id`). Bouton "Inviter un membre" en haut de page ouvre
`CreerAdminUserDialog`.

- [ ] **Step 2: Vérifier**

Run: `pnpm run typecheck && pnpm run lint`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add components/features/admin-users/admin-users-client.tsx
git commit -m "feat(admin-users): liste, recherche, filtre role, pagination, actions"
```

---

## Task 8: Page `/admin/utilisateurs`

**Files:**

- Modify: `app/admin/(shell)/utilisateurs/page.tsx`

**Interfaces:**

- Consumes: `listAdminUsers` (Task 1, direct — Server Component), `AdminUsersClient` (Task 7), `DROITS`
  (Task 9).

- [ ] **Step 1: Implémenter**

```tsx
import { listAdminUsers } from "@/features/admin-users/requests/list-admin-users";
import { AdminUsersClient } from "@/components/features/admin-users/admin-users-client";
import { DROITS } from "@/features/admin/data/droits";
// + rendu de la table "Droits par rôle" à partir de DROITS (Task 9), sur le même gabarit visuel
// que l'actuel `app/admin/(shell)/utilisateurs/page.tsx` (en-tête "Droits par rôle", grille
// colonnes Module/Admin national/Communication/Modération), adapté aux 3 colonnes booléennes.

interface PageProps {
  searchParams: Promise<{ q?: string; role?: string; page?: string }>;
}

export default async function UtilisateursPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const result = await listAdminUsers({
    search: params.q,
    role: params.role as never,
    page: params.page ? Number(params.page) : 1,
  });
  return (
    <div className="flex max-w-[1320px] flex-col gap-5.5">
      <AdminUsersClient initialData={result} />
      {/* table Droits par rôle, cf. Task 9 */}
    </div>
  );
}
```

Retirer les imports/usages de `UTILISATEURS` (`features/admin/data/utilisateurs.ts`) — ce fichier
mock devient orphelin, à supprimer dans cette même tâche (contrairement à la consigne des Tâches 1-2
de la session précédente qui gardait les pages mock sans les supprimer : ici la donnée mock
`utilisateurs.ts` n'est plus référencée par aucune route, donc supprimable sans perdre d'accès —
différent du cas campagnes/push où la route entière restait accessible par URL directe).

- [ ] **Step 2: Vérifier**

Run: `pnpm run typecheck && pnpm run lint && pnpm run build`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add "app/admin/(shell)/utilisateurs/page.tsx"
git rm features/admin/data/utilisateurs.ts
git commit -m "feat(admin-users): page /admin/utilisateurs branchee sur l'API"
```

---

## Task 9: Table "Droits par rôle" avec les vraies capacités (indépendante, parallélisable)

**Files:**

- Modify: `features/admin/data/droits.ts`

**Interfaces:**

- Produces: nouvelle forme de `DROITS` (`DroitCapacite[]`) — consommée par
  `app/admin/(shell)/utilisateurs/page.tsx` (Task 8).

- [ ] **Step 1: Remplacer le contenu**

Recopier tel quel le bloc `## Table "Droits par rôle"` du spec (interface `DroitCapacite` + 13
lignes issues de `capabilitiesByRole`).

- [ ] **Step 2: Vérifier**

Run: `pnpm run typecheck`
Expected: PASS (échouera tant que Task 8 n'a pas mis à jour le rendu qui consomme l'ancienne forme
de `DROITS` — normal si menée en parallèle, à intégrer ensemble avant de committer la page).

- [ ] **Step 3: Commit**

```bash
git add features/admin/data/droits.ts
git commit -m "feat(admin): droits par role bases sur les vraies capacites backend"
```

---

## Task 10: Vérification manuelle et clôture

Pas de fichier modifié — vérification humaine avant de considérer le plan terminé.

- [ ] **Step 1: Lancer le serveur de dev, se connecter en `ADMIN_NATIONAL`**

Run: `pnpm run dev`.

- [ ] **Step 2: Liste**

`/admin/utilisateurs` : recherche, filtre rôle, pagination affichent les vrais comptes back-office.
États Actif/Invitation/Inactif cohérents avec `isActive`/`mustChangePassword`/`lastLoginAt` réels.

- [ ] **Step 3: Création**

Créer un compte, vérifier l'écran "mot de passe temporaire" (bouton copier fonctionnel, le
dialogue ne se ferme pas tant qu'on n'a pas cliqué "fermer"), vérifier que le compte apparaît dans
la liste après fermeture.

- [ ] **Step 4: Rôle et statut**

Modifier le rôle d'un autre compte. Désactiver puis réactiver un autre compte. Vérifier que
"Modifier le rôle" et "Désactiver" sont bien désactivés/masqués sur sa propre ligne. Tenter (avec un
2ᵉ compte `ADMIN_NATIONAL` de test) de rétrograder/désactiver le dernier admin national actif,
vérifier que le message d'erreur backend s'affiche tel quel.

- [ ] **Step 5: Réinitialisation de mot de passe**

Réinitialiser le mot de passe d'un compte, vérifier l'affichage à usage unique.

- [ ] **Step 6: Droits par rôle**

Vérifier que la table affiche les 13 capacités avec des Oui/Non exacts par rapport à
`capabilitiesByRole` (comparer visuellement avec le fichier backend si doute).

- [ ] **Step 7: `convention-drift-check`**

Lancer l'agent `convention-drift-check` sur le diff complet avant de considérer le plan terminé.
