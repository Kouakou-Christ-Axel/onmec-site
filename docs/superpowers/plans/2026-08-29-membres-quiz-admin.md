# Sections admin Membres et Quiz — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended — Tasks 1-5 « Membres » et Tasks 6-11 « Quiz » sont mutuellement indépendantes une
> fois Task 0 posée, parallélisables sur deux agents) or superpowers:executing-plans. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter deux sections admin inédites — Membres (annuaire citoyen, gamification,
modération) et Quiz (banque de quiz, catégories, statistiques) — branchées sur le vrai contrat
`onmec_backend`, avec les gaps backend identifiés affichés en état "à venir" plutôt que mockés.

**Spec:** `docs/superpowers/specs/2026-08-29-membres-quiz-admin-design.md`

**Tech Stack:** Next.js App Router (route handlers), React 19, TanStack Query, Zod, TypeScript
strict, Vitest.

## Global Constraints

- BFF strict : `apiFetch()` (server, `lib/api-client.ts`) pour parler à `api.mec-ci.org`,
  `fetch-json.ts` (client) pour parler aux route handlers de onmec-site. Aucun appel client direct
  au backend.
- Fichiers de 200 lignes maximum sauf nécessité réelle documentée.
- Pas de nouveau composant `components/ui/` : onglets de la fiche membre = switcher local
  (`role="tablist"`), pas de `@radix-ui/react-tabs`.
- Toute fonctionnalité listée comme gap backend dans le spec est affichée en état "à venir"
  (composant/bouton visible mais non fonctionnel avec message explicite), jamais simulée par un
  mock qui donnerait l'illusion que ça marche.
- Le fix du thème admin (`data-mec-admin`, `app/admin/layout.tsx`) est déjà livré — aucune action
  requise ici, les nouveaux écrans en héritent automatiquement via les tokens CSS existants
  (`surface-*`, `text-*`, `border-*`, `Tag`, `Stat`, etc.).
- Aucune modification du repo `onmec_backend`.

---

## Task 0: Droits et navigation (partagé Membres + Quiz)

**Files:**

- Modify: `components/features/admin/admin-shell-context.tsx`
- Modify: `features/admin/data/droits.ts`
- Modify: `components/features/admin/admin-sidebar.tsx`

**Interfaces:**

- Produces: `AdminShellState.canMembres`, `AdminShellState.canQuiz` — consommés par toutes les
  pages/composants Membres et Quiz (Tasks 1-11) pour masquer nav/actions.

- [ ] **Step 1: Étendre `AdminShellState`**

Ajouter à l'interface et au `useMemo` de dérivation (même formule que `canSig`/`canEdito`) :

```ts
canMembres: initialRole !== "Chargée de communication",
canQuiz: initialRole !== "Modérateur",
```

- [ ] **Step 2: Étendre la table de droits affichée**

Dans `features/admin/data/droits.ts`, ajouter les deux lignes `Membres (comptes citoyens)` et
`Quiz éducatifs` (colonnes administrateur/communication/moderation), même format que les entrées
existantes.

- [ ] **Step 3: Ajouter les entrées de nav**

Dans `admin-sidebar.tsx`, étendre le type `NavItem["requires"]` avec `"canMembres" | "canQuiz"`, et
insérer entre "Ressources" et "Campagnes" :

```ts
{ href: "/admin/membres", label: "Membres", icon: Users2, requires: "canMembres" },
{ href: "/admin/quiz", label: "Quiz", icon: GraduationCap, requires: "canQuiz" },
```

Importer `Users2, GraduationCap` depuis `lucide-react`.

- [ ] **Step 4: Vérifier**

Run: `pnpm run typecheck && pnpm run lint`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/features/admin/admin-shell-context.tsx features/admin/data/droits.ts components/features/admin/admin-sidebar.tsx
git commit -m "feat(admin): droits et navigation pour membres et quiz"
```

---

## Task 1: Membres — types, schemas, requêtes de lecture

**Files:**

- Create: `features/membres-admin/types/membre-admin.ts`
- Create: `features/membres-admin/requests/list-membres.ts`
- Create: `features/membres-admin/requests/get-membre.ts`
- Create: `features/membres-admin/requests/list-membre-signalements.ts`
- Create: `features/membres-admin/requests/list-membre-quiz.ts`

**Interfaces:**

- Produces: `MembreAdmin`, `MembreEtat`, `listMembres()`, `getMembre(id)`,
  `listMembreSignalements(id, params)`, `listMembreQuiz(id)` — consommés par les route handlers
  (Task 2) et par `MembresAdminClient`/`MembreDetailDrawer` (Task 4).

- [ ] **Step 1: Types**

```ts
// features/membres-admin/types/membre-admin.ts
export type MembreEtat = "ACTIF" | "SUSPENDU" | "BANNI";

export interface MembreAdmin {
  id: string;
  nom: string;
  email: string;
  telephone: string | null;
  dateInscription: string;
  etat: MembreEtat;
  emailVerifie: boolean;
}

export interface MembreListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MembreListResponse {
  data: MembreAdmin[];
  meta: MembreListMeta;
}
```

- [ ] **Step 2: Mapper le DTO backend → `MembreAdmin`**

Le backend renvoie `UserResponseDto` (`fullname`, `phone`, `statut`, `emailVerified`, `createdAt`,
...). Petit mapper co-localisé dans `list-membres.ts`/`get-membre.ts` plutôt qu'un fichier séparé
(un seul point d'usage chacun) :

```ts
// features/membres-admin/requests/list-membres.ts
import { apiFetch } from "@/lib/api-client";
import type { MembreAdmin, MembreListResponse } from "@/features/membres-admin/types/membre-admin";

interface UserResponseDto {
  id: string;
  fullname: string;
  email: string;
  phone: string | null;
  statut: MembreAdmin["etat"];
  emailVerified: boolean;
  createdAt: string;
}
interface BackendListResponse {
  data: UserResponseDto[];
  meta: MembreListResponse["meta"];
}

function toMembreAdmin(dto: UserResponseDto): MembreAdmin {
  return {
    id: dto.id,
    nom: dto.fullname,
    email: dto.email,
    telephone: dto.phone,
    dateInscription: dto.createdAt,
    etat: dto.statut,
    emailVerifie: dto.emailVerified,
  };
}

export interface ListMembresParams {
  search?: string;
  statut?: MembreAdmin["etat"];
  page?: number;
  limit?: number;
}

export async function listMembres(params: ListMembresParams = {}): Promise<MembreListResponse> {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.statut) query.set("statut", params.statut);
  query.set("page", String(params.page ?? 1));
  query.set("limit", String(params.limit ?? 20));
  const response = await apiFetch<BackendListResponse>(`/users?${query}`);
  return { data: response.data.map(toMembreAdmin), meta: response.meta };
}
```

- [ ] **Step 3: `get-membre.ts`**

```ts
// features/membres-admin/requests/get-membre.ts
import { apiFetch } from "@/lib/api-client";
import type { MembreAdmin } from "@/features/membres-admin/types/membre-admin";
// réutiliser le même mapper que list-membres.ts — extrait dans une fonction exportée si dupliqué
// une 3e fois, pas avant (règle YAGNI du projet).

export async function getMembre(id: string): Promise<MembreAdmin> {
  const dto = await apiFetch<{
    id: string;
    fullname: string;
    email: string;
    phone: string | null;
    statut: MembreAdmin["etat"];
    emailVerified: boolean;
    createdAt: string;
  }>(`/users/${id}/profile`);
  return {
    id: dto.id,
    nom: dto.fullname,
    email: dto.email,
    telephone: dto.phone,
    dateInscription: dto.createdAt,
    etat: dto.statut,
    emailVerifie: dto.emailVerified,
  };
}
```

- [ ] **Step 4: Signalements et quiz du membre**

```ts
// features/membres-admin/requests/list-membre-signalements.ts
import { apiFetch } from "@/lib/api-client";

export function listMembreSignalements(id: string, page = 1, limit = 10) {
  return apiFetch(`/signalement-citoyen?citoyenId=${id}&page=${page}&limit=${limit}`);
}
```

```ts
// features/membres-admin/requests/list-membre-quiz.ts
import { apiFetch } from "@/lib/api-client";

export function listMembreQuiz(id: string) {
  return apiFetch(`/quizz/results/${id}`);
}
```

Pas de type de retour affiné pour ces deux requêtes dans cette passe (consommées directement par les
onglets Task 4 avec un typage local minimal) — éviter de dupliquer les DTO `SignalementCitoyenDto`/
`QuizResultResponseDto` déjà définis côté backend tant qu'un vrai besoin de réutilisation ailleurs
n'apparaît pas.

- [ ] **Step 5: Vérifier**

Run: `pnpm run typecheck`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add features/membres-admin/types/ features/membres-admin/requests/list-membres.ts features/membres-admin/requests/get-membre.ts features/membres-admin/requests/list-membre-signalements.ts features/membres-admin/requests/list-membre-quiz.ts
git commit -m "feat(membres-admin): types et requetes de lecture"
```

---

## Task 2: Membres — route handlers de lecture

**Files:**

- Create: `app/api/admin/membres/route.ts`
- Create: `app/api/admin/membres/[id]/route.ts`
- Create: `app/api/admin/membres/[id]/signalements/route.ts`
- Create: `app/api/admin/membres/[id]/quiz/route.ts`

**Interfaces:**

- Consumes: `listMembres`/`getMembre`/`listMembreSignalements`/`listMembreQuiz` (Task 1),
  `toErrorResponse` (`lib/to-error-response.ts`).
- Produces: routes `GET /api/admin/membres`, `GET /api/admin/membres/{id}`,
  `GET /api/admin/membres/{id}/signalements`, `GET /api/admin/membres/{id}/quiz` — consommées par
  `app/admin/(shell)/membres/page.tsx` (Task 5) et les onglets du drawer (Task 4).

Patron identique à `app/api/admin/actualites/route.ts` — pas de test dédié.

- [ ] **Step 1: `app/api/admin/membres/route.ts`**

```ts
import { NextResponse } from "next/server";
import { listMembres } from "@/features/membres-admin/requests/list-membres";
import { toErrorResponse } from "@/lib/to-error-response";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  try {
    const result = await listMembres({
      search: searchParams.get("search") ?? undefined,
      statut: (searchParams.get("statut") as never) ?? undefined,
      page: Number(searchParams.get("page") ?? 1),
      limit: Number(searchParams.get("limit") ?? 20),
    });
    return NextResponse.json(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
```

- [ ] **Step 2: `app/api/admin/membres/[id]/route.ts`, `.../signalements/route.ts`,
      `.../quiz/route.ts`**

Même patron (`params: Promise<{ id: string }>`, `try/catch` + `toErrorResponse`) que le Step 1,
un `GET` par fichier appelant respectivement `getMembre`, `listMembreSignalements`,
`listMembreQuiz`. Pour les deux derniers, relayer `page`/`limit` depuis `searchParams` comme au
Step 1.

- [ ] **Step 3: Vérifier**

Run: `pnpm run typecheck`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add app/api/admin/membres/
git commit -m "feat(membres-admin): route handlers de lecture"
```

---

## Task 3: Membres — actions (points, état) : schemas, requêtes, routes, mutations

**Files:**

- Create: `features/membres-admin/schemas/ajuster-points-schema.ts`
- Create: `features/membres-admin/schemas/changer-etat-schema.ts`
- Create: `features/membres-admin/requests/ajuster-points-membre.ts`
- Create: `features/membres-admin/requests/changer-etat-membre.ts`
- Create: `app/api/admin/membres/[id]/points/route.ts`
- Create: `app/api/admin/membres/[id]/etat/route.ts`
- Create: `features/membres-admin/mutations/use-ajuster-points.ts`
- Create: `features/membres-admin/mutations/use-changer-etat-membre.ts`

**Interfaces:**

- Produces: `useAjusterPoints()`, `useChangerEtatMembre()` — consommés par `AjusterPointsDialog`/
  `ChangerEtatMembreDialog` (Task 4).

- [ ] **Step 1: Schemas**

```ts
// features/membres-admin/schemas/ajuster-points-schema.ts
import { z } from "zod";

export const ajusterPointsSchema = z.object({
  delta: z.number().refine((n) => n !== 0, "Le delta ne peut pas être nul."),
  raison: z.string().min(1, "La raison est obligatoire."),
});
export type AjusterPointsInput = z.infer<typeof ajusterPointsSchema>;
```

```ts
// features/membres-admin/schemas/changer-etat-schema.ts
import { z } from "zod";

export const changerEtatSchema = z.object({
  statut: z.enum(["ACTIF", "SUSPENDU"]),
  raison: z.string().optional(),
});
export type ChangerEtatInput = z.infer<typeof changerEtatSchema>;
```

- [ ] **Step 2: Requêtes serveur**

```ts
// features/membres-admin/requests/ajuster-points-membre.ts
import { apiFetch } from "@/lib/api-client";
import type { AjusterPointsInput } from "@/features/membres-admin/schemas/ajuster-points-schema";

interface GamificationStateDto {
  points: number;
  niveau: number;
}

export function ajusterPointsMembre(userId: string, input: AjusterPointsInput) {
  return apiFetch<GamificationStateDto>("/gamification/points", {
    method: "POST",
    body: JSON.stringify({ userId, points: input.delta, raison: input.raison }),
  });
}
```

```ts
// features/membres-admin/requests/changer-etat-membre.ts
import { apiFetch } from "@/lib/api-client";
import type { ChangerEtatInput } from "@/features/membres-admin/schemas/changer-etat-schema";

export function changerEtatMembre(id: string, input: ChangerEtatInput) {
  return apiFetch(`/users/${id}/statut`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
```

- [ ] **Step 3: Route handlers**

Même patron proxy que Task 2 (`POST`/`PATCH` au lieu de `GET`, body relayé tel quel après parse
JSON, `toErrorResponse` en cas d'échec).

- [ ] **Step 4: Mutations client**

```ts
// features/membres-admin/mutations/use-ajuster-points.ts
"use client";
import { useMutation } from "@tanstack/react-query";
import { postJson } from "@/lib/fetch-json";
import type { AjusterPointsInput } from "@/features/membres-admin/schemas/ajuster-points-schema";

interface Input extends AjusterPointsInput {
  membreId: string;
}

export function useAjusterPoints() {
  return useMutation({
    mutationFn: ({ membreId, ...body }: Input) =>
      postJson<{ points: number; niveau: number }>(`/api/admin/membres/${membreId}/points`, body),
  });
}
```

`use-changer-etat-membre.ts` : même patron (`patchJson`).

- [ ] **Step 5: Vérifier**

Run: `pnpm run typecheck`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add features/membres-admin/schemas/ features/membres-admin/requests/ajuster-points-membre.ts features/membres-admin/requests/changer-etat-membre.ts app/api/admin/membres/[id]/points/ app/api/admin/membres/[id]/etat/ features/membres-admin/mutations/
git commit -m "feat(membres-admin): ajuster les points, suspendre/reactiver"
```

---

## Task 4: Membres — composants (liste, drawer, onglets, modales)

**Files:**

- Create: `components/features/membres-admin/membres-admin-client.tsx`
- Create: `components/features/membres-admin/membre-detail-drawer.tsx`
- Create: `components/features/membres-admin/membre-tab-infos.tsx`
- Create: `components/features/membres-admin/membre-tab-signalements.tsx`
- Create: `components/features/membres-admin/membre-tab-quiz.tsx`
- Create: `components/features/membres-admin/membre-tab-a-venir.tsx`
- Create: `components/features/membres-admin/ajuster-points-dialog.tsx`
- Create: `components/features/membres-admin/changer-etat-membre-dialog.tsx`

**Interfaces:**

- Consumes: Tasks 1-3, `Drawer` (`components/ui/drawer.tsx`), `Dialog`/`DialogTitle`, `Tag`,
  `Field`/`Input`/`Textarea`, `Button`/`IconButton`, `useAdminShell`.
- Produces: `<MembresAdminClient initialData />` — consommé par `app/admin/(shell)/membres/page.tsx`
  (Task 5).

- [ ] **Step 1: `membre-tab-a-venir.tsx`** (le plus simple, sert de base aux autres onglets)

```tsx
"use client";
interface MembreTabAVenirProps {
  message: string;
}
export function MembreTabAVenir({ message }: MembreTabAVenirProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border-subtle bg-surface-card px-5 py-10 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
```

Utilisé pour les onglets Commentaires/Points/Notifications avec un message par onglet (ex.
"Cet onglet nécessite un endpoint backend pas encore disponible.").

- [ ] **Step 2: `membre-tab-infos.tsx`, `membre-tab-signalements.tsx`, `membre-tab-quiz.tsx`**

Chacun reçoit `membreId: string`, fait un `useQuery` (`queryKey: ["membre", membreId, "infos"|...]`)
vers la route handler correspondante (`getJson` de `lib/fetch-json.ts`), affiche un `Skeleton`
pendant le chargement, une erreur simple sinon, et le contenu (badge `Tag` pour l'état, liste pour
signalements/quiz).

- [ ] **Step 3: `membre-detail-drawer.tsx`** — switcher d'onglets local

```tsx
"use client";
import { useState } from "react";
import { Drawer } from "@/components/ui/drawer";
import { cn } from "@/components/ui/cn";
import { MembreTabInfos } from "./membre-tab-infos";
import { MembreTabSignalements } from "./membre-tab-signalements";
import { MembreTabQuiz } from "./membre-tab-quiz";
import { MembreTabAVenir } from "./membre-tab-a-venir";
import type { MembreAdmin } from "@/features/membres-admin/types/membre-admin";

const ONGLETS = [
  { id: "infos", label: "Infos" },
  { id: "signalements", label: "Signalements" },
  { id: "quiz", label: "Quiz" },
  { id: "commentaires", label: "Commentaires" },
  { id: "points", label: "Points" },
  { id: "notifications", label: "Notifications" },
] as const;
type OngletId = (typeof ONGLETS)[number]["id"];

interface MembreDetailDrawerProps {
  membre: MembreAdmin | null;
  onClose: () => void;
}

export function MembreDetailDrawer({ membre, onClose }: MembreDetailDrawerProps) {
  const [onglet, setOnglet] = useState<OngletId>("infos");
  if (!membre) return null;

  return (
    <Drawer open={membre !== null} onClose={onClose}>
      <div className="flex flex-col gap-4 p-5.5">
        <h2 className="text-xl font-semibold text-ink">{membre.nom}</h2>
        <div
          role="tablist"
          aria-label="Onglets de la fiche membre"
          className="flex gap-1 border-b border-border-subtle"
        >
          {ONGLETS.map((o) => (
            <button
              key={o.id}
              role="tab"
              id={`membre-tab-${o.id}`}
              aria-selected={onglet === o.id}
              aria-controls={`membre-panel-${o.id}`}
              onClick={() => setOnglet(o.id)}
              className={cn(
                "px-3 py-2 text-sm font-medium",
                onglet === o.id
                  ? "border-b-2 border-orange-500 text-ink"
                  : "text-muted-foreground hover:text-ink",
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
        <div role="tabpanel" id={`membre-panel-${onglet}`} aria-labelledby={`membre-tab-${onglet}`}>
          {onglet === "infos" && <MembreTabInfos membreId={membre.id} />}
          {onglet === "signalements" && <MembreTabSignalements membreId={membre.id} />}
          {onglet === "quiz" && <MembreTabQuiz membreId={membre.id} />}
          {onglet === "commentaires" && (
            <MembreTabAVenir message="Filtre par auteur pas encore disponible côté API." />
          )}
          {onglet === "points" && (
            <MembreTabAVenir message="Journal des ajustements de points pas encore exposé par l'API." />
          )}
          {onglet === "notifications" && (
            <MembreTabAVenir message="Historique des notifications pas encore exposé par l'API." />
          )}
        </div>
      </div>
    </Drawer>
  );
}
```

- [ ] **Step 4: `ajuster-points-dialog.tsx`, `changer-etat-membre-dialog.tsx`**

Même patron que `edit-document-dialog.tsx` (`librairie-admin`) : formulaire contrôlé, `Zod` en
validation avant `mutate`, message d'erreur si `isError`, `disabled` pendant `isPending`.
`AjusterPointsDialog` affiche l'aperçu "points après" (`points actuels + delta`) calculé côté client
à partir d'une prop `pointsActuels` (si connue) — sinon simplement le delta et la raison.

- [ ] **Step 5: `membres-admin-client.tsx`**

Liste + recherche (debounce simple) + filtre état (`<Select>`) + pagination, ouvre
`MembreDetailDrawer` au clic sur une ligne, expose les actions (ajuster points, changer état) via
`membre-row-actions.tsx` intégré directement (pas de fichier séparé si le menu tient dans le budget
de 200 lignes du client — sinon extraire). Bouton "Anonymiser"/"Notifier"/"Export CSV" : rendus
`disabled` avec un `title` explicatif (gap backend), jamais retirés silencieusement (pour ne pas
donner l'impression que le design a été ignoré).

- [ ] **Step 6: Vérifier**

Run: `pnpm run typecheck && pnpm run lint`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add components/features/membres-admin/
git commit -m "feat(membres-admin): liste, drawer, onglets, actions"
```

---

## Task 5: Membres — page

**Files:**

- Create: `app/admin/(shell)/membres/page.tsx`

**Interfaces:**

- Consumes: `listMembres` (Task 1, direct — Server Component), `MembresAdminClient` (Task 4).

- [ ] **Step 1: Implémenter**

```tsx
import { listMembres } from "@/features/membres-admin/requests/list-membres";
import { MembresAdminClient } from "@/components/features/membres-admin/membres-admin-client";

interface PageProps {
  searchParams: Promise<{ q?: string; etat?: string; page?: string }>;
}

export default async function MembresPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const result = await listMembres({
    search: params.q,
    statut: params.etat as never,
    page: params.page ? Number(params.page) : 1,
  });
  return <MembresAdminClient initialData={result} />;
}
```

- [ ] **Step 2: Vérifier**

Run: `pnpm run typecheck && pnpm run lint && pnpm run build`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add "app/admin/(shell)/membres/page.tsx"
git commit -m "feat(membres-admin): page /admin/membres"
```

---

## Task 6: Quiz — types, schemas, requêtes CRUD

**Files:**

- Create: `features/quiz-admin/types/quiz-admin.ts`
- Create: `features/quiz-admin/schemas/quiz-form-schema.ts`
- Create: `features/quiz-admin/schemas/question-schema.ts`
- Create: `features/quiz-admin/requests/list-quiz.ts`
- Create: `features/quiz-admin/requests/get-quiz.ts`
- Create: `features/quiz-admin/requests/create-quiz.ts`
- Create: `features/quiz-admin/requests/update-quiz.ts`
- Create: `features/quiz-admin/requests/delete-quiz.ts`
- Create: `features/quiz-admin/requests/get-quiz-stats.ts`

**Interfaces:**

- Produces: `QuizAdmin`, `QuizQuestion`, `QuizChoix`, `listQuiz()`, `getQuiz(id)`,
  `createQuiz(payload)`, `updateQuiz(id, payload)`, `deleteQuiz(id)`, `getQuizStats(id)` —
  consommés par les route handlers (Task 7) et les composants (Task 10).

- [ ] **Step 1: Types**

Voir le spec (§ Modèle de données — Quiz) pour le détail complet des interfaces
(`QuizDifficulte`, `QuizChoix`, `QuizQuestion`, `QuizAdmin`, `QuizCategorie`, `QuizStatistiques`) —
recopier tel quel dans `features/quiz-admin/types/quiz-admin.ts`.

- [ ] **Step 2: Schemas Zod**

```ts
// features/quiz-admin/schemas/question-schema.ts
import { z } from "zod";

export const choixSchema = z.object({
  id: z.string().optional(),
  texte: z.string().min(1, "Le texte du choix est obligatoire."),
  correct: z.boolean(),
});

export const questionSchema = z
  .object({
    id: z.string().optional(),
    texte: z.string().min(1, "Le texte de la question est obligatoire."),
    choix: z.array(choixSchema).min(2, "Au moins 2 choix sont requis."),
  })
  .refine((q) => q.choix.filter((c) => c.correct).length === 1, {
    message: "Exactement un choix doit être marqué correct.",
    path: ["choix"],
  });
```

```ts
// features/quiz-admin/schemas/quiz-form-schema.ts
import { z } from "zod";
import { questionSchema } from "./question-schema";

export const quizFormSchema = z.object({
  titre: z.string().min(1, "Le titre est obligatoire."),
  description: z.string().optional(),
  categorieId: z.string().optional(),
  difficulte: z.enum(["FACILE", "MOYEN", "DIFFICILE"]).optional(),
  questions: z.array(questionSchema).default([]),
});
export type QuizFormInput = z.infer<typeof quizFormSchema>;
```

- [ ] **Step 3: Requêtes de lecture/écriture**

```ts
// features/quiz-admin/requests/list-quiz.ts
import { apiFetch } from "@/lib/api-client";
import type { QuizAdmin } from "@/features/quiz-admin/types/quiz-admin";

export interface ListQuizParams {
  categorieId?: string;
  difficulte?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export function listQuiz(params: ListQuizParams = {}) {
  const query = new URLSearchParams();
  if (params.categorieId) query.set("categorieId", params.categorieId);
  if (params.difficulte) query.set("difficulte", params.difficulte);
  if (params.search) query.set("search", params.search);
  query.set("page", String(params.page ?? 1));
  query.set("limit", String(params.limit ?? 20));
  return apiFetch<{
    data: QuizAdmin[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }>(`/quizz?${query}`);
}
```

`get-quiz.ts` (`GET /quizz/{id}`), `create-quiz.ts` (`POST /quizz`, body =
`{ titre, description, categorieId, difficulte, questions }` — le backend attend `title`/`categorieId`
en anglais partiel (`title`, pas `titre`) : **mapper explicitement** les noms de champs front (FR,
cohérent avec le reste du domaine) vers les noms attendus par `CreateQuizzDto`/`UpdateQuizzDto`
(`title`, `description`, `difficulte`, `categorieId`, `questions: [{ text, choices: [{ text,
isCorrect }] }]`) dans ces deux fichiers), `update-quiz.ts` (`PATCH /quizz/{id}`, même mapping),
`delete-quiz.ts` (`DELETE /quizz/{id}`) — patron identique à `create-actualite.ts`/
`update-actualite.ts`.

- [ ] **Step 4: `get-quiz-stats.ts`**

```ts
// features/quiz-admin/requests/get-quiz-stats.ts
import { apiFetch } from "@/lib/api-client";
import type { QuizStatistiques } from "@/features/quiz-admin/types/quiz-admin";

interface BackendStats extends QuizStatistiques {
  recentAttempts: unknown[];
}

export function getQuizStats(id: string) {
  return apiFetch<BackendStats>(`/quizz/${id}/statistics`);
}
```

- [ ] **Step 5: Vérifier**

Run: `pnpm run typecheck`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add features/quiz-admin/types/ features/quiz-admin/schemas/ features/quiz-admin/requests/list-quiz.ts features/quiz-admin/requests/get-quiz.ts features/quiz-admin/requests/create-quiz.ts features/quiz-admin/requests/update-quiz.ts features/quiz-admin/requests/delete-quiz.ts features/quiz-admin/requests/get-quiz-stats.ts
git commit -m "feat(quiz-admin): types, schemas, requetes CRUD"
```

---

## Task 7: Quiz — catégories (requêtes + routes)

**Files:**

- Create: `features/quiz-admin/requests/list-categories.ts`
- Create: `features/quiz-admin/requests/create-categorie.ts`
- Create: `features/quiz-admin/requests/update-categorie.ts`
- Create: `features/quiz-admin/requests/delete-categorie.ts`
- Create: `app/api/admin/quiz-categories/route.ts`
- Create: `app/api/admin/quiz-categories/[id]/route.ts`

**Interfaces:**

- Produces: CRUD complet catégories — consommé par `queries/use-categories.ts` (Task 8) et
  `quiz-categories-client.tsx` (Task 10).

Patron identique à `features/actualites-admin/requests/list-categories.ts` et
`app/api/admin/actualites/categories/route.ts` (déjà en place dans le repo pour un domaine voisin) —
recopier la structure, endpoints `GET/POST /quizz/categories`, `GET/PATCH/DELETE
/quizz/categories/{id}`.

- [ ] **Step 1: Requêtes** (4 fichiers, patron CRUD standard du repo)
- [ ] **Step 2: Route handlers** (2 fichiers, proxy `try/catch` + `toErrorResponse`)
- [ ] **Step 3: Vérifier** — `pnpm run typecheck`, PASS
- [ ] **Step 4: Commit**

```bash
git add features/quiz-admin/requests/list-categories.ts features/quiz-admin/requests/create-categorie.ts features/quiz-admin/requests/update-categorie.ts features/quiz-admin/requests/delete-categorie.ts app/api/admin/quiz-categories/
git commit -m "feat(quiz-admin): CRUD categories"
```

---

## Task 8: Quiz — route handlers CRUD + mutations client

**Files:**

- Create: `app/api/admin/quiz/route.ts`
- Create: `app/api/admin/quiz/[id]/route.ts`
- Create: `app/api/admin/quiz/[id]/statistiques/route.ts`
- Create: `features/quiz-admin/mutations/use-create-quiz.ts`
- Create: `features/quiz-admin/mutations/use-update-quiz.ts`
- Create: `features/quiz-admin/mutations/use-delete-quiz.ts`
- Create: `features/quiz-admin/mutations/use-create-categorie.ts`
- Create: `features/quiz-admin/mutations/use-update-categorie.ts`
- Create: `features/quiz-admin/mutations/use-delete-categorie.ts`
- Create: `features/quiz-admin/queries/use-categories.ts`

**Interfaces:**

- Consumes: Tasks 6-7.
- Produces: hooks TanStack Query consommés par les composants (Task 10).

- [ ] **Step 1: Route handlers** — patron `POST`/`PATCH`/`DELETE` identique à
      `app/api/admin/actualites/[id]/route.ts`.
- [ ] **Step 2: Mutations quiz** — patron identique à `use-create-actualite.ts`/
      `use-update-actualite.ts`/`use-delete-actualite.ts`.
- [ ] **Step 3: Mutations catégories** — patron identique aux mutations quiz (Step 2).
- [ ] **Step 4: `use-categories.ts`**

```ts
// features/quiz-admin/queries/use-categories.ts
"use client";
import { useQuery } from "@tanstack/react-query";
import { getJson } from "@/lib/fetch-json";
import type { QuizCategorie } from "@/features/quiz-admin/types/quiz-admin";

export function useCategories() {
  return useQuery({
    queryKey: ["quiz-categories"],
    queryFn: () => getJson<QuizCategorie[]>("/api/admin/quiz-categories"),
  });
}
```

- [ ] **Step 5: Vérifier**

Run: `pnpm run typecheck`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add app/api/admin/quiz/ features/quiz-admin/mutations/ features/quiz-admin/queries/
git commit -m "feat(quiz-admin): route handlers CRUD et mutations"
```

---

## Task 9: `compute-quiz-score` (simulateur d'aperçu)

**Files:**

- Create: `features/quiz-admin/lib/compute-quiz-score.ts`
- Test: `features/quiz-admin/lib/compute-quiz-score.test.ts`

**Interfaces:**

- Produces: `computeQuizScore(questions, reponses): { score: number; total: number;
details: { questionId: string; correct: boolean }[] }` — consommé par `quiz-preview-dialog.tsx`
  (Task 10). Purement local, aucun appel réseau (ne soumet jamais à `POST /quizz/submit`).

- [ ] **Step 1: Écrire le test**

```ts
// features/quiz-admin/lib/compute-quiz-score.test.ts
import { describe, expect, it } from "vitest";
import { computeQuizScore } from "@/features/quiz-admin/lib/compute-quiz-score";
import type { QuizQuestion } from "@/features/quiz-admin/types/quiz-admin";

const questions: QuizQuestion[] = [
  {
    id: "q1",
    texte: "2+2 ?",
    choix: [
      { id: "a", texte: "3", correct: false },
      { id: "b", texte: "4", correct: true },
    ],
  },
  {
    id: "q2",
    texte: "Capitale de la Côte d'Ivoire ?",
    choix: [
      { id: "c", texte: "Abidjan", correct: false },
      { id: "d", texte: "Yamoussoukro", correct: true },
    ],
  },
];

describe("computeQuizScore", () => {
  it("compte les bonnes reponses", () => {
    const result = computeQuizScore(questions, { q1: "b", q2: "c" });
    expect(result.score).toBe(1);
    expect(result.total).toBe(2);
    expect(result.details).toEqual([
      { questionId: "q1", correct: true },
      { questionId: "q2", correct: false },
    ]);
  });

  it("traite une question sans reponse comme incorrecte", () => {
    const result = computeQuizScore(questions, { q1: "b" });
    expect(result.score).toBe(1);
    expect(result.details[1]).toEqual({ questionId: "q2", correct: false });
  });
});
```

- [ ] **Step 2: Lancer le test, vérifier qu'il échoue**

Run: `pnpm run test compute-quiz-score`
Expected: FAIL (module introuvable)

- [ ] **Step 3: Implémenter**

```ts
// features/quiz-admin/lib/compute-quiz-score.ts
import type { QuizQuestion } from "@/features/quiz-admin/types/quiz-admin";

export interface QuizScoreResult {
  score: number;
  total: number;
  details: { questionId: string; correct: boolean }[];
}

export function computeQuizScore(
  questions: QuizQuestion[],
  reponses: Record<string, string>,
): QuizScoreResult {
  const details = questions.map((question) => {
    const choixId = reponses[question.id ?? ""];
    const correct = question.choix.some((c) => c.id === choixId && c.correct);
    return { questionId: question.id ?? "", correct };
  });
  return {
    score: details.filter((d) => d.correct).length,
    total: questions.length,
    details,
  };
}
```

- [ ] **Step 4: Lancer le test, vérifier qu'il passe**

Run: `pnpm run test compute-quiz-score`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add features/quiz-admin/lib/compute-quiz-score.ts features/quiz-admin/lib/compute-quiz-score.test.ts
git commit -m "feat(quiz-admin): calcul du score du simulateur d'apercu"
```

---

## Task 10: Quiz — composants

**Files:**

- Create: `components/features/quiz-admin/quiz-admin-client.tsx`
- Create: `components/features/quiz-admin/quiz-categories-client.tsx`
- Create: `components/features/quiz-admin/quiz-editor-form.tsx`
- Create: `components/features/quiz-admin/quiz-question-editor.tsx`
- Create: `components/features/quiz-admin/quiz-preview-dialog.tsx`
- Create: `components/features/quiz-admin/quiz-save-confirm-dialog.tsx`
- Create: `components/features/quiz-admin/quiz-delete-dialog.tsx`
- Create: `components/features/quiz-admin/quiz-categorie-dialog.tsx`
- Create: `components/features/quiz-admin/quiz-stats-cards.tsx`

**Interfaces:**

- Consumes: Tasks 6-9, `Stat`/`Tag`/`Field`/`Input`/`Textarea`/`Select`/`Button`/`IconButton`,
  `ConfirmDialog`, `useAdminShell`.
- Produces: composants consommés par les pages (Task 11).

- [ ] **Step 1: `quiz-admin-client.tsx`** — liste avec 4 états explicites (chargement/squelettes,
      erreur+réessayer, vide+CTA "Nouveau quiz", normal+pagination), filtres catégorie/difficulté,
      tri. Même structure que `librairie-admin-client.tsx` (Task 9 du plan librairie) pour la
      grille/table, adaptée aux colonnes titre/catégorie/difficulté/questions/actions.

- [ ] **Step 2: `quiz-categories-client.tsx`** — liste + `quiz-categorie-dialog.tsx` (créer/éditer,
      formulaire nom+description) + suppression via `ConfirmDialog` (affiche le message backend brut
      si 409 "catégorie utilisée").

- [ ] **Step 3: `quiz-question-editor.tsx`** — une question : champ texte + liste de choix (ajouter/
      supprimer un choix, un seul `correct` actif à la fois — `onChange` qui décoche les autres au
      clic, cohérent avec la contrainte Zod `question-schema.ts`).

- [ ] **Step 4: `quiz-editor-form.tsx`** — titre/description/catégorie (`useCategories`)/difficulté,
      liste de `QuizQuestionEditor` (état vide + bouton "Ajouter une question"), bandeau "modifié/non
      enregistré" (comparaison de l'état local au dernier état sauvegardé), bouton "Aperçu" (ouvre
      `quiz-preview-dialog.tsx`) et bouton "Enregistrer" (valide via `quizFormSchema`, si `totalAttempts

  > 0`— récupéré via`getQuizStats`en parallèle du chargement — ouvre
   `quiz-save-confirm-dialog.tsx`avant de`mutate`, sinon sauvegarde directe).

- [ ] **Step 5: `quiz-preview-dialog.tsx`** — simulateur : question courante, barre de progression,
      choix cliquables, état répondu (bonne réponse en vert `--verdict-true`, mauvaise en rouge
      `--verdict-false` via `Tag`/classes existantes), bouton suivant, score final via
      `computeQuizScore` (Task 9), bouton "Recommencer". Aucun appel réseau.

- [ ] **Step 6: `quiz-save-confirm-dialog.tsx`, `quiz-delete-dialog.tsx`** — `ConfirmDialog` simple,
      nommant le quiz, avec le texte d'avertissement "des tentatives existent déjà" pour le premier.

- [ ] **Step 7: `quiz-stats-cards.tsx`** — 3 `<Stat>` (tentatives, score moyen, nombre de questions) +
      liste brute de `recentAttempts` (pas de distribution/pagination — gaps backend, voir spec).

- [ ] **Step 8: Vérifier**

Run: `pnpm run typecheck && pnpm run lint`
Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add components/features/quiz-admin/
git commit -m "feat(quiz-admin): liste, editeur, apercu, categories, statistiques"
```

---

## Task 11: Quiz — pages

**Files:**

- Create: `app/admin/(shell)/quiz/page.tsx`
- Create: `app/admin/(shell)/quiz/categories/page.tsx`
- Create: `app/admin/(shell)/quiz/nouveau/page.tsx`
- Create: `app/admin/(shell)/quiz/[id]/modifier/page.tsx`
- Create: `app/admin/(shell)/quiz/[id]/statistiques/page.tsx`

**Interfaces:**

- Consumes: `listQuiz`, `listCategories` (Server Components, direct), `getQuiz`, `getQuizStats`,
  et les composants clients (Task 10).

- [ ] **Step 1: `quiz/page.tsx`** — RSC, lit `searchParams` (categorie, difficulte, tri, page),
      appelle `listQuiz` directement, passe à `<QuizAdminClient>`. Même structure que
      `app/admin/(shell)/ressources/page.tsx` (Task 10 du plan librairie).

- [ ] **Step 2: `quiz/categories/page.tsx`** — RSC, `listCategories` direct, passe à
      `<QuizCategoriesClient>`.

- [ ] **Step 3: `quiz/nouveau/page.tsx`** — rend `<QuizEditorForm quiz={null} />` (mode création).

- [ ] **Step 4: `quiz/[id]/modifier/page.tsx`** — RSC, `getQuiz(id)` direct, rend
      `<QuizEditorForm quiz={quiz} />` (mode édition).

- [ ] **Step 5: `quiz/[id]/statistiques/page.tsx`** — RSC, `getQuizStats(id)` direct, rend
      `<QuizStatsCards stats={stats} />`.

- [ ] **Step 6: Vérifier**

Run: `pnpm run typecheck && pnpm run lint && pnpm run test && pnpm run build`
Expected: PASS sur les quatre commandes.

- [ ] **Step 7: Commit**

```bash
git add "app/admin/(shell)/quiz/"
git commit -m "feat(quiz-admin): pages liste, categories, editeur, statistiques"
```

---

## Task 12: Vérification manuelle et clôture

Pas de fichier modifié — vérification humaine avant de considérer le plan terminé.

- [ ] **Step 1: Lancer le serveur de dev, se connecter en back-office**

Run: `pnpm run dev`. Tester avec un rôle Administrateur national (accès complet), puis un rôle
Modérateur (Quiz visible en lecture seule si les actions d'édition sont bien gatées par
`canQuiz`/droits, Membres visible), puis Chargée de communication (Membres masqué, Quiz visible).

- [ ] **Step 2: Membres**

`/admin/membres` : recherche, filtre état, pagination. Ouvrir une fiche : onglets Infos/
Signalements/Quiz affichent de vraies données ; Commentaires/Points/Notifications affichent l'état
"à venir" sans erreur console. Ajuster les points d'un membre réel, vérifier le nouveau total.
Suspendre puis réactiver un membre, vérifier le changement d'état dans la liste sans recharger.

- [ ] **Step 3: Quiz**

`/admin/quiz` : créer un quiz avec 2+ questions (au moins une réponse correcte par question),
utiliser l'Aperçu (répondre à toutes les questions, vérifier le score et le style bonne/mauvaise
réponse), Enregistrer. Modifier ce quiz, vérifier le bandeau "non enregistré" apparaît au premier
changement. Consulter ses statistiques. Créer/éditer/supprimer une catégorie ; tenter de supprimer
une catégorie utilisée par un quiz et vérifier que le message d'erreur 409 s'affiche. Supprimer un
quiz avec confirmation.

- [ ] **Step 4: `convention-drift-check`**

Lancer l'agent `convention-drift-check` sur le diff complet avant de considérer le plan terminé.

- [ ] **Step 5: Transmettre les gaps backend**

Envoyer la liste § Dépendance backend du spec (`docs/superpowers/specs/2026-08-29-membres-quiz-admin-design.md`)
comme prompt à une session Claude Code ouverte sur `onmec_backend`.
