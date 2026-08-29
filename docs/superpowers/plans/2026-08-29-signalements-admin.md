# Signalements admin — branchement API réelle — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer le mock local de l'écran admin "Signalements" par un branchement réel sur `onmec_backend` (module `signalement-citoyen`), en suivant les conventions déjà établies pour `quiz-admin`/`membres-admin`.

**Architecture:** Nouvelle couche `features/signalements-admin/` (types, requests server-only via `apiFetch`, queries/mutations client via TanStack Query), deux route handlers BFF (`app/api/admin/signalements`), composants déplacés de `components/features/admin/` vers `components/features/signalements-admin/`. Filtres/pagination côté client (jamais `router.push`/`router.refresh`, cf. règle `docs/ARCHITECTURE.md`). Le panneau "Mises à jour" reste en state local non persisté (gap backend documenté, prompt déjà transmis).

**Tech Stack:** Next.js App Router (vinext), React 19, TypeScript strict, TanStack Query, Zod, Tailwind v4.

**Spec:** `docs/superpowers/specs/2026-08-29-signalements-admin-design.md`

## Global Constraints

- Aucun `fetch` direct vers `api.mec-ci.org` en dehors de `apiFetch` (server-only, `lib/api-client.ts`).
- Les fichiers `"use client"` n'appellent que les route handlers `app/api/admin/*` de onmec-site, via `lib/fetch-json.ts` (`getJson`/`patchJson`).
- Filtres, onglets, pagination : jamais `router.push`/`router.replace`/`router.refresh` — state local + TanStack Query + `syncUrlParams` (`lib/sync-url.ts`) + `queryClient.invalidateQueries` après mutation. Voir `docs/ARCHITECTURE.md § Filtres, onglets et pagination côté client`.
- Ce projet n'a aucun fichier de test unitaire existant (vitest configuré mais inutilisé partout, y compris pour les mappers plus complexes de `quiz-admin`) : chaque tâche se vérifie par `pnpm run typecheck` / `pnpm run lint` (déjà automatisés par le hook `PostToolUse`) plutôt que par des tests écrits — cohérent avec le reste du code base.
- Ne pas toucher à `features/admin/data/signalements.ts` : ce mock reste utilisé tel quel par `components/features/admin/admin-sidebar.tsx` (badge) et `features/admin/lib/build-queue.ts` (file de travail du dashboard), deux écrans entièrement mockés sur d'autres domaines aussi (articles, ressources, push, invitations) — hors scope de cette tâche, à traiter dans un futur passage dédié au dashboard.
- Ne pas modifier `onmec_backend` (repo séparé) — uniquement le consommer en lecture pour connaître le contrat exact. Le gap "Mises à jour" a déjà été transmis dans un prompt séparé.

---

### Task 1: Types et helpers de mapping

**Files:**
- Create: `features/signalements-admin/types/signalement-admin.ts`

**Interfaces:**
- Produces: `SignalementStatutApi` (`"NOUVEAU"|"EN_COURS"|"RESOLU"|"REJETE"`), `SignalementCategorie {id, nom}`, `SignalementCitoyenAuteur {id, fullname, email}`, `SignalementAdmin`, `SignalementListMeta`, `SignalementListResponse`, `SignalementTab` (`"validation"|"encours"|"resolu"|"rejete"`), `SIGNALEMENT_TAB_META`, `signalementTab(statut): SignalementTab`, `STATUT_BY_TAB`, `SignalementUpdateEntry {date, auteur, texte}`, `updatesLabel(count): string` — utilisés par toutes les tâches suivantes.

- [ ] **Step 1: Écrire le fichier de types**

```ts
// features/signalements-admin/types/signalement-admin.ts

export type SignalementStatutApi = "NOUVEAU" | "EN_COURS" | "RESOLU" | "REJETE";

export interface SignalementCategorie {
  id: string;
  nom: string;
}

export interface SignalementCitoyenAuteur {
  id: string;
  fullname: string;
  email: string;
}

export interface SignalementAdmin {
  id: string;
  titre: string;
  description: string;
  categorieId: string;
  categorie: SignalementCategorie | null;
  adresse: string;
  photo: string | null;
  statut: SignalementStatutApi;
  validation: boolean;
  citoyen: SignalementCitoyenAuteur | null;
  createdAt: string;
  updatedAt: string;
}

export interface SignalementListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SignalementListResponse {
  data: SignalementAdmin[];
  meta: SignalementListMeta;
}

/** Étape d'affichage dérivée de `statut` — l'onglet "En validation" correspond au statut NOUVEAU. */
export type SignalementTab = "validation" | "encours" | "resolu" | "rejete";

export const SIGNALEMENT_TAB_META: Record<
  SignalementTab,
  { label: string; tone: "orange" | "blue" | "neutral" | "outline" }
> = {
  validation: { label: "En validation", tone: "orange" },
  encours: { label: "En cours", tone: "blue" },
  resolu: { label: "Résolu", tone: "neutral" },
  rejete: { label: "Rejeté", tone: "outline" },
};

const TAB_BY_STATUT: Record<SignalementStatutApi, SignalementTab> = {
  NOUVEAU: "validation",
  EN_COURS: "encours",
  RESOLU: "resolu",
  REJETE: "rejete",
};

export function signalementTab(statut: SignalementStatutApi): SignalementTab {
  return TAB_BY_STATUT[statut];
}

export const STATUT_BY_TAB: Record<SignalementTab, SignalementStatutApi> = {
  validation: "NOUVEAU",
  encours: "EN_COURS",
  resolu: "RESOLU",
  rejete: "REJETE",
};

/**
 * Journal de suivi affiché dans le tiroir. Non persisté côté backend pour
 * l'instant (gap documenté dans le spec, prompt déjà transmis) : vit
 * uniquement en state local dans `SignalementsAdminClient`, perdu au
 * rechargement de page.
 */
export interface SignalementUpdateEntry {
  date: string;
  auteur: string;
  texte: string;
}

export function updatesLabel(count: number): string {
  if (count === 0) return "aucune mise à jour";
  if (count === 1) return "1 mise à jour";
  return `${count} mises à jour`;
}
```

- [ ] **Step 2: Vérifier**

Run: `pnpm run typecheck`
Expected: aucune erreur (fichier autonome, aucune dépendance externe).

- [ ] **Step 3: Commit**

```bash
git add features/signalements-admin/types/signalement-admin.ts
git commit -m "$(cat <<'EOF'
feat(signalements-admin): types et mapping statut/onglet

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Dsm1DM4UcgZ1gh2QDKfDPf
EOF
)"
```

---

### Task 2: Requests server-only + schema Zod

**Files:**
- Create: `features/signalements-admin/requests/list-signalements.ts`
- Create: `features/signalements-admin/requests/update-signalement.ts`
- Create: `features/signalements-admin/requests/list-signalement-categories.ts`
- Create: `features/signalements-admin/schemas/update-signalement-schema.ts`

**Interfaces:**
- Consumes: `SignalementListResponse`, `SignalementAdmin`, `SignalementCategorie`, `SignalementStatutApi` (Task 1), `apiFetch` (`@/lib/api-client`, server-only — dépend de `next/headers`).
- Produces: `listSignalements(params: ListSignalementsParams): Promise<SignalementListResponse>`, `updateSignalement(id, input: UpdateSignalementInput): Promise<SignalementAdmin>`, `listSignalementCategories(): Promise<SignalementCategorie[]>`, `updateSignalementSchema` (Zod) + `type UpdateSignalementFormInput` — consommés par les route handlers de la Task 3 et le Server Component de la Task 9.

Le backend (`onmec_backend/src/modules/signalement-citoyen`) renvoie déjà les objets Prisma bruts avec les mêmes noms de champs que `SignalementAdmin` (`categorie`/`citoyen` inclus en relation, `photo` déjà réécrit en URL publique) — pas de mapper de renommage nécessaire, contrairement à `quiz-admin`.

- [ ] **Step 1: `list-signalements.ts`**

```ts
// features/signalements-admin/requests/list-signalements.ts
import { apiFetch } from "@/lib/api-client";
import type {
  SignalementListResponse,
  SignalementStatutApi,
} from "@/features/signalements-admin/types/signalement-admin";

export interface ListSignalementsParams {
  statut?: SignalementStatutApi;
  categorieId?: string;
  page?: number;
  limit?: number;
}

export async function listSignalements(
  params: ListSignalementsParams = {},
): Promise<SignalementListResponse> {
  const query = new URLSearchParams();
  if (params.statut) query.set("statut", params.statut);
  if (params.categorieId) query.set("categorieId", params.categorieId);
  query.set("page", String(params.page ?? 1));
  query.set("limit", String(params.limit ?? 20));
  return apiFetch<SignalementListResponse>(`/signalement-citoyen?${query}`);
}
```

- [ ] **Step 2: `update-signalement.ts`**

```ts
// features/signalements-admin/requests/update-signalement.ts
import { apiFetch } from "@/lib/api-client";
import type {
  SignalementAdmin,
  SignalementStatutApi,
} from "@/features/signalements-admin/types/signalement-admin";

export interface UpdateSignalementInput {
  statut?: SignalementStatutApi;
  validation?: boolean;
}

export function updateSignalement(
  id: string,
  input: UpdateSignalementInput,
): Promise<SignalementAdmin> {
  return apiFetch<SignalementAdmin>(`/signalement-citoyen/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
```

- [ ] **Step 3: `list-signalement-categories.ts`**

```ts
// features/signalements-admin/requests/list-signalement-categories.ts
import { apiFetch } from "@/lib/api-client";
import type { SignalementCategorie } from "@/features/signalements-admin/types/signalement-admin";

interface CategorieSignalementResponseDto {
  id: string;
  nom: string;
}

export async function listSignalementCategories(): Promise<SignalementCategorie[]> {
  const categories = await apiFetch<CategorieSignalementResponseDto[]>("/categorie-signalement");
  return categories.map((c) => ({ id: c.id, nom: c.nom }));
}
```

- [ ] **Step 4: `update-signalement-schema.ts`**

```ts
// features/signalements-admin/schemas/update-signalement-schema.ts
import { z } from "zod";

export const updateSignalementSchema = z.object({
  statut: z.enum(["NOUVEAU", "EN_COURS", "RESOLU", "REJETE"]).optional(),
  validation: z.boolean().optional(),
});
export type UpdateSignalementFormInput = z.infer<typeof updateSignalementSchema>;
```

- [ ] **Step 5: Vérifier**

Run: `pnpm run typecheck`
Expected: aucune erreur.

- [ ] **Step 6: Commit**

```bash
git add features/signalements-admin/requests features/signalements-admin/schemas
git commit -m "$(cat <<'EOF'
feat(signalements-admin): requests server-only vers signalement-citoyen

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Dsm1DM4UcgZ1gh2QDKfDPf
EOF
)"
```

---

### Task 3: Route handlers BFF

**Files:**
- Create: `app/api/admin/signalements/route.ts`
- Create: `app/api/admin/signalements/[id]/route.ts`

**Interfaces:**
- Consumes: `listSignalements`, `updateSignalement` (Task 2), `updateSignalementSchema` (Task 2), `toErrorResponse` (`@/lib/to-error-response`), `parseJsonBody` (`@/lib/parse-json-body`).
- Produces: `GET /api/admin/signalements?statut=&categorieId=&page=`, `PATCH /api/admin/signalements/:id` — consommés par les hooks client de la Task 4.

- [ ] **Step 1: `app/api/admin/signalements/route.ts`**

```ts
import { NextResponse } from "next/server";
import { listSignalements } from "@/features/signalements-admin/requests/list-signalements";
import { toErrorResponse } from "@/lib/to-error-response";
import type { SignalementStatutApi } from "@/features/signalements-admin/types/signalement-admin";

const VALID_STATUTS: SignalementStatutApi[] = ["NOUVEAU", "EN_COURS", "RESOLU", "REJETE"];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const statutParam = searchParams.get("statut");
  const statut = VALID_STATUTS.includes(statutParam as SignalementStatutApi)
    ? (statutParam as SignalementStatutApi)
    : undefined;
  try {
    const result = await listSignalements({
      statut,
      categorieId: searchParams.get("categorieId") ?? undefined,
      page: Number(searchParams.get("page") ?? 1),
      limit: Number(searchParams.get("limit") ?? 20),
    });
    return NextResponse.json(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
```

- [ ] **Step 2: `app/api/admin/signalements/[id]/route.ts`**

```ts
import { NextResponse } from "next/server";
import { updateSignalement } from "@/features/signalements-admin/requests/update-signalement";
import { updateSignalementSchema } from "@/features/signalements-admin/schemas/update-signalement-schema";
import { toErrorResponse } from "@/lib/to-error-response";
import { parseJsonBody } from "@/lib/parse-json-body";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = await parseJsonBody(request, updateSignalementSchema);
  if (!parsed.success) return parsed.response;

  try {
    const signalement = await updateSignalement(id, parsed.data);
    return NextResponse.json(signalement);
  } catch (error) {
    return toErrorResponse(error);
  }
}
```

- [ ] **Step 3: Vérifier**

Run: `pnpm run typecheck`
Expected: aucune erreur.

- [ ] **Step 4: Commit**

```bash
git add app/api/admin/signalements
git commit -m "$(cat <<'EOF'
feat(signalements-admin): route handlers BFF liste + PATCH

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Dsm1DM4UcgZ1gh2QDKfDPf
EOF
)"
```

---

### Task 4: Hooks client (query + mutation)

**Files:**
- Create: `features/signalements-admin/queries/use-signalements-list.ts`
- Create: `features/signalements-admin/mutations/use-update-signalement.ts`

**Interfaces:**
- Consumes: `SignalementListResponse`, `SignalementAdmin`, `SignalementStatutApi` (Task 1), `getJson`/`patchJson` (`@/lib/fetch-json`), route handlers de la Task 3.
- Produces: `useSignalementsList({statut, categorieId, page, initialData}): UseQueryResult<SignalementListResponse>` avec `queryKey: ["signalements-list", statut, categorieId, page]` ; `useUpdateSignalement(): UseMutationResult` avec `mutationFn({id, statut?, validation?})` — consommés par le composant client de la Task 8, qui invalide `["signalements-list"]` après succès.

- [ ] **Step 1: `use-signalements-list.ts`**

```ts
"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getJson } from "@/lib/fetch-json";
import type {
  SignalementListResponse,
  SignalementStatutApi,
} from "@/features/signalements-admin/types/signalement-admin";

interface UseSignalementsListParams {
  statut: SignalementStatutApi | "";
  categorieId: string;
  page: number;
  initialData: SignalementListResponse;
}

export function useSignalementsList({
  statut,
  categorieId,
  page,
  initialData,
}: UseSignalementsListParams) {
  return useQuery({
    queryKey: ["signalements-list", statut, categorieId, page],
    queryFn: () => {
      const params = new URLSearchParams();
      if (statut) params.set("statut", statut);
      if (categorieId) params.set("categorieId", categorieId);
      params.set("page", String(page));
      return getJson<SignalementListResponse>(`/api/admin/signalements?${params}`);
    },
    initialData: statut || categorieId || page !== 1 ? undefined : initialData,
    placeholderData: keepPreviousData,
  });
}
```

- [ ] **Step 2: `use-update-signalement.ts`**

```ts
"use client";

import { useMutation } from "@tanstack/react-query";
import { patchJson } from "@/lib/fetch-json";
import type {
  SignalementAdmin,
  SignalementStatutApi,
} from "@/features/signalements-admin/types/signalement-admin";

interface UpdateSignalementInput {
  id: string;
  statut?: SignalementStatutApi;
  validation?: boolean;
}

export function useUpdateSignalement() {
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateSignalementInput) =>
      patchJson<SignalementAdmin>(`/api/admin/signalements/${id}`, body),
  });
}
```

- [ ] **Step 3: Vérifier**

Run: `pnpm run typecheck`
Expected: aucune erreur.

- [ ] **Step 4: Commit**

```bash
git add features/signalements-admin/queries features/signalements-admin/mutations
git commit -m "$(cat <<'EOF'
feat(signalements-admin): hooks TanStack Query liste + mutation statut

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Dsm1DM4UcgZ1gh2QDKfDPf
EOF
)"
```

---

### Task 5: Composant panneau de modération

**Files:**
- Create: `components/features/signalements-admin/signalement-moderation-panel.tsx`

**Interfaces:**
- Consumes: `SignalementAdmin`, `SignalementStatutApi` (Task 1).
- Produces: `SignalementModerationPanel({signalement, disabled, onChangeStatut, onChangeValidation})` — consommé par le tiroir (Task 7). Reprend le panneau existant (`components/features/admin/signalement-moderation-panel.tsx`), sans le bloc "Responsable du suivi" (retiré, champ absent côté backend) et avec les vrais noms de champs (`statut` enum backend, `validation` booléen au lieu de `publie`).

- [ ] **Step 1: Écrire le composant**

```tsx
import type {
  SignalementAdmin,
  SignalementStatutApi,
} from "@/features/signalements-admin/types/signalement-admin";

const ETAPES: { statut: SignalementStatutApi; label: string }[] = [
  { statut: "NOUVEAU", label: "En validation" },
  { statut: "EN_COURS", label: "En cours" },
  { statut: "RESOLU", label: "Résolu" },
];

interface SignalementModerationPanelProps {
  signalement: SignalementAdmin;
  disabled: boolean;
  onChangeStatut: (statut: SignalementStatutApi) => void;
  onChangeValidation: (validation: boolean) => void;
}

export function SignalementModerationPanel({
  signalement,
  disabled,
  onChangeStatut,
  onChangeValidation,
}: SignalementModerationPanelProps) {
  return (
    <div className="flex flex-col gap-3.5 rounded-lg border border-border-subtle bg-surface-card p-4.5">
      <span className="text-xs font-semibold tracking-[0.13em] text-muted-foreground uppercase">
        Modération
      </span>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChangeValidation(true)}
          className={`h-9.5 rounded-md border text-sm font-semibold text-blue-700 disabled:opacity-50 ${signalement.validation ? "border-ink bg-white shadow-stamp" : "border-border-strong bg-white"}`}
        >
          Afficher dans l’app
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChangeValidation(false)}
          className={`h-9.5 rounded-md border text-sm font-semibold text-text-body disabled:opacity-50 ${!signalement.validation ? "border-ink bg-white shadow-stamp" : "border-border-strong bg-white"}`}
        >
          Masquer
        </button>
      </div>
      <span className="text-xs leading-relaxed text-muted-foreground">
        Un signalement masqué reste traité en interne, mais n’apparaît pas dans la carte publique de
        l’app.
      </span>
      <span className="h-px bg-border-subtle" />
      <span className="text-xs font-semibold tracking-[0.13em] text-muted-foreground uppercase">
        Statut du traitement
      </span>
      <div className="grid grid-cols-3 gap-2">
        {ETAPES.map((etape) => (
          <button
            key={etape.statut}
            type="button"
            disabled={disabled}
            onClick={() => onChangeStatut(etape.statut)}
            className={`h-9.5 rounded-md border text-[0.8125rem] font-semibold text-ink disabled:opacity-50 ${signalement.statut === etape.statut ? "border-ink bg-white shadow-stamp" : "border-border-strong bg-white"}`}
          >
            {etape.label}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Vérifier**

Run: `pnpm run typecheck && pnpm run lint`
Expected: aucune erreur.

- [ ] **Step 3: Commit**

```bash
git add components/features/signalements-admin/signalement-moderation-panel.tsx
git commit -m "$(cat <<'EOF'
feat(signalements-admin): panneau de modération sur les vrais champs

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Dsm1DM4UcgZ1gh2QDKfDPf
EOF
)"
```

---

### Task 6: Composant panneau "Mises à jour" (local, non persisté)

**Files:**
- Create: `components/features/signalements-admin/signalement-updates-panel.tsx`

**Interfaces:**
- Consumes: `SignalementUpdateEntry`, `updatesLabel` (Task 1).
- Produces: `SignalementUpdatesPanel({updates, onAdd})` — consommé par le tiroir (Task 7). Reçoit désormais `updates`/`onAdd` en props plutôt que de lire/patcher un objet `Signalement` mocké : la liste et l'ajout sont pilotés par le state local du composant client (Task 8), pas persistés côté backend (gap documenté).

- [ ] **Step 1: Écrire le composant**

```tsx
"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import {
  updatesLabel,
  type SignalementUpdateEntry,
} from "@/features/signalements-admin/types/signalement-admin";

interface SignalementUpdatesPanelProps {
  updates: SignalementUpdateEntry[];
  onAdd: (texte: string) => void;
}

export function SignalementUpdatesPanel({ updates, onAdd }: SignalementUpdatesPanelProps) {
  const [maj, setMaj] = useState("");

  const addUpdate = () => {
    if (!maj.trim()) return;
    onAdd(maj.trim());
    setMaj("");
  };

  return (
    <div className="flex flex-col gap-3.5 rounded-lg border border-border-subtle bg-surface-card p-4.5">
      <span className="text-xs font-semibold tracking-[0.13em] text-muted-foreground uppercase">
        {updatesLabel(updates.length)}
      </span>
      {updates.length > 0 ? (
        <div className="flex flex-col gap-3.5">
          {updates.map((u, i) => (
            <span key={i} className="flex flex-col gap-0.5 border-l-2 border-orange-500 pl-3.5">
              <span className="text-[0.6875rem] text-muted-foreground">
                {u.date} · {u.auteur}
              </span>
              <span className="text-sm leading-relaxed text-text-body">{u.texte}</span>
            </span>
          ))}
        </div>
      ) : (
        <span className="text-[0.8125rem] text-muted-foreground">
          Aucune mise à jour. Le citoyen ne voit encore que son signalement.
        </span>
      )}
      <Field
        label="Ajouter une mise à jour"
        hint="Visible par le citoyen dans l’app, avec la date et votre nom"
      >
        <Textarea
          rows={3}
          value={maj}
          onChange={(e) => setMaj(e.target.value)}
          placeholder="Ex. Signalement transmis à la mairie de Cocody, intervention annoncée pour le 28/08."
        />
      </Field>
      <span>
        <Button variant="deep" size="sm" icon={Send} disabled={!maj.trim()} onClick={addUpdate}>
          Publier la mise à jour
        </Button>
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Vérifier**

Run: `pnpm run typecheck && pnpm run lint`
Expected: aucune erreur.

- [ ] **Step 3: Commit**

```bash
git add components/features/signalements-admin/signalement-updates-panel.tsx
git commit -m "$(cat <<'EOF'
feat(signalements-admin): panneau mises à jour piloté par state local

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Dsm1DM4UcgZ1gh2QDKfDPf
EOF
)"
```

---

### Task 7: Composant tiroir de détail

**Files:**
- Create: `components/features/signalements-admin/signalement-drawer.tsx`

**Interfaces:**
- Consumes: `SignalementAdmin`, `SignalementStatutApi`, `SignalementUpdateEntry`, `SIGNALEMENT_TAB_META`, `signalementTab` (Task 1), `SignalementModerationPanel` (Task 5), `SignalementUpdatesPanel` (Task 6), `Drawer`/`DialogTitle`/`useLastNonNull` (`@/components/ui/drawer`, `@/components/ui/dialog`), `Tag`/`Button`/`IconButton`.
- Produces: `SignalementDrawer({signalement, onClose, onChangeStatut, onChangeValidation, pending, updates, onAddUpdate})` — consommé par le composant client (Task 8).

- [ ] **Step 1: Écrire le composant**

```tsx
"use client";

import { X, Check } from "lucide-react";
import { Drawer } from "@/components/ui/drawer";
import { DialogTitle, useLastNonNull } from "@/components/ui/dialog";
import { Tag } from "@/components/ui/tag";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { SignalementModerationPanel } from "./signalement-moderation-panel";
import { SignalementUpdatesPanel } from "./signalement-updates-panel";
import {
  SIGNALEMENT_TAB_META,
  signalementTab,
  type SignalementAdmin,
  type SignalementStatutApi,
  type SignalementUpdateEntry,
} from "@/features/signalements-admin/types/signalement-admin";

const ETAPES: { statut: SignalementStatutApi; label: string }[] = [
  { statut: "NOUVEAU", label: "En validation" },
  { statut: "EN_COURS", label: "En cours" },
  { statut: "RESOLU", label: "Résolu" },
];

interface SignalementDrawerProps {
  signalement: SignalementAdmin | null;
  onClose: () => void;
  onChangeStatut: (id: string, statut: SignalementStatutApi) => void;
  onChangeValidation: (id: string, validation: boolean) => void;
  pending: boolean;
  updates: SignalementUpdateEntry[];
  onAddUpdate: (id: string, texte: string) => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR");
}

export function SignalementDrawer({
  signalement,
  onClose,
  onChangeStatut,
  onChangeValidation,
  pending,
  updates,
  onAddUpdate,
}: SignalementDrawerProps) {
  const shown = useLastNonNull(signalement);
  if (!shown) return null;

  const currentIndex = ETAPES.findIndex((e) => e.statut === shown.statut);

  return (
    <Drawer open={signalement !== null} onClose={onClose}>
      <div className="flex items-center justify-between gap-3.5 border-b border-border-subtle bg-surface-card px-5.5 py-4.5">
        <span className="flex flex-col gap-0.5">
          <span className="text-[0.6875rem] font-semibold tracking-[0.13em] text-muted-foreground uppercase">
            Signalement citoyen
          </span>
          <span className="flex items-center gap-2.5">
            <span className="text-base font-semibold text-ink tabular-nums">
              {shown.id.slice(0, 8)}
            </span>
            <Tag tone={SIGNALEMENT_TAB_META[signalementTab(shown.statut)].tone}>
              {SIGNALEMENT_TAB_META[signalementTab(shown.statut)].label}
            </Tag>
          </span>
        </span>
        <IconButton icon={X} label="Fermer" onClick={onClose} />
      </div>

      <div className="flex flex-1 flex-col gap-5.5 overflow-auto p-5.5">
        <div className="grid grid-cols-3 gap-2">
          {ETAPES.map((etape, i) => (
            <span key={etape.statut} className="flex flex-col gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full border-2 ${
                  i < currentIndex
                    ? "border-verdict-true bg-verdict-true"
                    : i === currentIndex
                      ? "border-orange-500 bg-orange-500"
                      : "border-n-300 bg-transparent"
                }`}
              />
              <span
                className={`text-xs ${i === currentIndex ? "font-semibold text-ink" : "text-muted-foreground"}`}
              >
                {etape.label}
              </span>
            </span>
          ))}
        </div>

        <DialogTitle asChild>
          <h2 className="text-[1.375rem] leading-tight font-semibold tracking-[-0.026em] text-ink">
            {shown.titre}
          </h2>
        </DialogTitle>

        <div className="grid grid-cols-2 gap-3.5 rounded-lg border border-border-subtle bg-surface-card p-4 text-[0.8125rem]">
          <span className="flex flex-col gap-0.5">
            <span className="text-muted-foreground">Catégorie</span>
            <span className="font-semibold text-ink">{shown.categorie?.nom ?? "—"}</span>
          </span>
          <span className="flex flex-col gap-0.5">
            <span className="text-muted-foreground">Reçu le</span>
            <span className="font-semibold text-ink">{formatDate(shown.createdAt)}</span>
          </span>
          <span className="flex flex-col gap-0.5">
            <span className="text-muted-foreground">Localisation</span>
            <span className="font-semibold text-ink">{shown.adresse}</span>
          </span>
          <span className="flex flex-col gap-0.5">
            <span className="text-muted-foreground">Signalé par</span>
            <span className="font-semibold text-ink">{shown.citoyen?.fullname ?? "—"}</span>
          </span>
          <span className="flex flex-col gap-0.5">
            <span className="text-muted-foreground">Visible dans l’app</span>
            <span className="font-semibold text-ink">{shown.validation ? "Publié" : "Masqué"}</span>
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-semibold tracking-[0.13em] text-muted-foreground uppercase">
            Description du citoyen
          </span>
          <p className="text-[0.9375rem] leading-relaxed text-text-body">{shown.description}</p>
        </div>

        <SignalementModerationPanel
          signalement={shown}
          disabled={pending}
          onChangeStatut={(statut) => onChangeStatut(shown.id, statut)}
          onChangeValidation={(validation) => onChangeValidation(shown.id, validation)}
        />

        <SignalementUpdatesPanel updates={updates} onAdd={(texte) => onAddUpdate(shown.id, texte)} />
      </div>

      <div className="flex flex-none flex-wrap items-center gap-2.5 border-t border-border-subtle bg-surface-card px-5.5 py-4">
        <Button variant="primary" icon={Check} onClick={onClose}>
          Enregistrer et fermer
        </Button>
        <Button variant="ghost" disabled={pending} onClick={() => onChangeStatut(shown.id, "REJETE")}>
          Rejeter le signalement
        </Button>
        <span className="flex-[1_0_100%] text-xs text-muted-foreground">
          Les mises à jour et le statut sont visibles par le citoyen dans l’app.
        </span>
      </div>
    </Drawer>
  );
}
```

- [ ] **Step 2: Vérifier**

Run: `pnpm run typecheck && pnpm run lint`
Expected: aucune erreur.

- [ ] **Step 3: Commit**

```bash
git add components/features/signalements-admin/signalement-drawer.tsx
git commit -m "$(cat <<'EOF'
feat(signalements-admin): tiroir de détail sur données réelles

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Dsm1DM4UcgZ1gh2QDKfDPf
EOF
)"
```

---

### Task 8: Composant client liste/filtres/pagination

**Files:**
- Create: `components/features/signalements-admin/signalements-admin-client.tsx`

**Interfaces:**
- Consumes: `useSignalementsList`, `useUpdateSignalement` (Task 4), `SignalementDrawer` (Task 7), `SIGNALEMENT_TAB_META`, `STATUT_BY_TAB`, `signalementTab`, tous les types (Task 1), `LibrairiePagination` (`@/components/features/librairie/librairie-pagination`), `useAdminShell` (`@/components/features/admin/admin-shell-context`, expose `canSig`), `syncUrlParams` (`@/lib/sync-url`).
- Produces: `SignalementsAdminClient({initialTab, initialCategorieId, initialPageNum, initialData, initialCategories, initialOpenId})` — consommé par le Server Component de la Task 9. Suit exactement le patron de filtrage/pagination client de `QuizAdminClient`/`MembresAdminClient` (state local seedé par les props SSR, jamais de `router.push`).

- [ ] **Step 1: Écrire le composant**

```tsx
"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Tag } from "@/components/ui/tag";
import { Select } from "@/components/ui/select";
import { LibrairiePagination } from "@/components/features/librairie/librairie-pagination";
import { useAdminShell } from "@/components/features/admin/admin-shell-context";
import { useSignalementsList } from "@/features/signalements-admin/queries/use-signalements-list";
import { useUpdateSignalement } from "@/features/signalements-admin/mutations/use-update-signalement";
import { syncUrlParams } from "@/lib/sync-url";
import { SignalementDrawer } from "./signalement-drawer";
import {
  SIGNALEMENT_TAB_META,
  STATUT_BY_TAB,
  signalementTab,
  type SignalementCategorie,
  type SignalementListResponse,
  type SignalementStatutApi,
  type SignalementTab,
  type SignalementUpdateEntry,
} from "@/features/signalements-admin/types/signalement-admin";

const TAB_ORDER: SignalementTab[] = ["validation", "encours", "resolu", "rejete"];

interface SignalementsAdminClientProps {
  initialTab: SignalementTab | "tous";
  initialCategorieId: string;
  initialPageNum: number;
  initialData: SignalementListResponse;
  initialCategories: SignalementCategorie[];
  initialOpenId: string | null;
}

export function SignalementsAdminClient({
  initialTab,
  initialCategorieId,
  initialPageNum,
  initialData,
  initialCategories,
  initialOpenId,
}: SignalementsAdminClientProps) {
  const shell = useAdminShell();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<SignalementTab | "tous">(initialTab);
  const [categorieId, setCategorieId] = useState(initialCategorieId);
  const [page, setPage] = useState(initialPageNum);
  const [openId, setOpenId] = useState<string | null>(initialOpenId);
  const [localUpdates, setLocalUpdates] = useState<Record<string, SignalementUpdateEntry[]>>({});
  const updateMutation = useUpdateSignalement();

  const statut: SignalementStatutApi | "" = tab === "tous" ? "" : STATUT_BY_TAB[tab];
  const listQuery = useSignalementsList({ statut, categorieId, page, initialData });
  const data = listQuery.data ?? initialData;

  useEffect(() => {
    syncUrlParams({
      tab: tab === "tous" ? "" : tab,
      categorieId,
      page: page > 1 ? String(page) : "",
      open: openId ?? "",
    });
  }, [tab, categorieId, page, openId]);

  const openSignalement = data.data.find((s) => s.id === openId) ?? null;

  function invalidateList() {
    queryClient.invalidateQueries({ queryKey: ["signalements-list"] });
  }

  function handleChangeStatut(id: string, next: SignalementStatutApi) {
    updateMutation.mutate(
      { id, statut: next },
      { onSuccess: invalidateList, onError: () => toast.error("Une erreur est survenue. Réessayez.") },
    );
  }

  function handleChangeValidation(id: string, validation: boolean) {
    updateMutation.mutate(
      { id, validation },
      { onSuccess: invalidateList, onError: () => toast.error("Une erreur est survenue. Réessayez.") },
    );
  }

  function handleAddUpdate(id: string, texte: string) {
    setLocalUpdates((prev) => ({
      ...prev,
      [id]: [
        ...(prev[id] ?? []),
        { date: new Date().toLocaleDateString("fr-FR"), auteur: "Vous", texte },
      ],
    }));
  }

  return (
    <div className="flex max-w-[1320px] flex-col gap-5.5">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold tracking-[0.13em] text-orange-700 uppercase">
            Application mobile
          </span>
          <h1 className="text-[1.75rem] leading-[1.12] font-semibold tracking-[-0.028em] text-ink">
            Signalements
          </h1>
          <p className="text-[0.9375rem] text-muted-foreground">
            {data.meta.total} signalement{data.meta.total > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <Tag
          tone="outline"
          size="md"
          active={tab === "tous"}
          onClick={() => {
            setTab("tous");
            setPage(1);
          }}
        >
          Tous
        </Tag>
        {TAB_ORDER.map((t) => (
          <Tag
            key={t}
            tone="outline"
            size="md"
            active={tab === t}
            onClick={() => {
              setTab(t);
              setPage(1);
            }}
          >
            {SIGNALEMENT_TAB_META[t].label}
          </Tag>
        ))}
        <span className="ml-auto w-57.5">
          <Select
            value={categorieId}
            onChange={(e) => {
              setCategorieId(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Toutes les catégories</option>
            {initialCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom}
              </option>
            ))}
          </Select>
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border-subtle bg-surface-card">
        <div className="min-w-[900px]">
          <div className="grid grid-cols-[minmax(200px,1fr)_158px_112px_140px_96px] gap-3.5 border-b border-border-subtle bg-n-50 px-4 py-2.5 text-[0.6875rem] font-semibold tracking-[0.09em] text-muted-foreground uppercase">
            <span>Signalement</span>
            <span>Catégorie</span>
            <span>Reçu</span>
            <span>Statut</span>
            <span>App</span>
          </div>
          {data.data.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setOpenId(r.id)}
              className="grid w-full grid-cols-[minmax(200px,1fr)_158px_112px_140px_96px] items-center gap-3.5 border-b border-border-subtle px-4 py-3 text-left text-sm last:border-b-0 hover:bg-n-50"
            >
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate font-medium text-ink">{r.titre}</span>
                <span className="truncate text-xs text-muted-foreground">{r.adresse}</span>
              </span>
              <span className="truncate text-[0.8125rem] text-muted-foreground">
                {r.categorie?.nom ?? "—"}
              </span>
              <span className="text-[0.8125rem] text-muted-foreground tabular-nums">
                {new Date(r.createdAt).toLocaleDateString("fr-FR")}
              </span>
              <span>
                <Tag tone={SIGNALEMENT_TAB_META[signalementTab(r.statut)].tone}>
                  {SIGNALEMENT_TAB_META[signalementTab(r.statut)].label}
                </Tag>
              </span>
              <span>
                <Tag tone={r.validation ? "blue" : "neutral"} icon={r.validation ? Eye : EyeOff}>
                  {r.validation ? "Publié" : "Masqué"}
                </Tag>
              </span>
            </button>
          ))}
        </div>
      </div>

      <LibrairiePagination page={data.meta.page} totalPages={data.meta.totalPages} onChange={setPage} />

      <SignalementDrawer
        signalement={openSignalement}
        onClose={() => setOpenId(null)}
        onChangeStatut={handleChangeStatut}
        onChangeValidation={handleChangeValidation}
        pending={updateMutation.isPending || !shell.canSig}
        updates={openId ? (localUpdates[openId] ?? []) : []}
        onAddUpdate={handleAddUpdate}
      />
    </div>
  );
}
```

Note : `data.data.length === 0` n'affiche pas d'état vide dédié (le mock d'origine ne le faisait pas non plus pour cet écran) — un tableau vide avec juste l'en-tête reste acceptable, cohérent avec le comportement précédent.

- [ ] **Step 2: Vérifier**

Run: `pnpm run typecheck && pnpm run lint`
Expected: aucune erreur.

- [ ] **Step 3: Commit**

```bash
git add components/features/signalements-admin/signalements-admin-client.tsx
git commit -m "$(cat <<'EOF'
feat(signalements-admin): composant client liste/filtres/pagination

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Dsm1DM4UcgZ1gh2QDKfDPf
EOF
)"
```

---

### Task 9: Server Component page.tsx, nettoyage, vérification finale

**Files:**
- Modify: `app/admin/(shell)/signalements/page.tsx` (réécriture complète en Server Component)
- Delete: `components/features/admin/signalement-drawer.tsx`
- Delete: `components/features/admin/signalement-moderation-panel.tsx`
- Delete: `components/features/admin/signalement-updates-panel.tsx`

**Interfaces:**
- Consumes: `listSignalements`, `listSignalementCategories` (Task 2), `SignalementsAdminClient` (Task 8), `STATUT_BY_TAB`, `SignalementTab` (Task 1).

- [ ] **Step 1: Réécrire `app/admin/(shell)/signalements/page.tsx`**

```tsx
import { listSignalements } from "@/features/signalements-admin/requests/list-signalements";
import { listSignalementCategories } from "@/features/signalements-admin/requests/list-signalement-categories";
import { SignalementsAdminClient } from "@/components/features/signalements-admin/signalements-admin-client";
import { STATUT_BY_TAB, type SignalementTab } from "@/features/signalements-admin/types/signalement-admin";

interface PageProps {
  searchParams: Promise<{
    tab?: string;
    categorieId?: string;
    page?: string;
    open?: string;
  }>;
}

const VALID_TABS: SignalementTab[] = ["validation", "encours", "resolu", "rejete"];

export default async function SignalementsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const tab: SignalementTab | "tous" = VALID_TABS.includes(params.tab as SignalementTab)
    ? (params.tab as SignalementTab)
    : "tous";
  const categorieId = params.categorieId ?? "";
  const page = params.page ? Number(params.page) : 1;

  const [signalements, categories] = await Promise.all([
    listSignalements({
      statut: tab === "tous" ? undefined : STATUT_BY_TAB[tab],
      categorieId: categorieId || undefined,
      page,
    }),
    listSignalementCategories(),
  ]);

  return (
    <SignalementsAdminClient
      initialTab={tab}
      initialCategorieId={categorieId}
      initialPageNum={page}
      initialData={signalements}
      initialCategories={categories}
      initialOpenId={params.open ?? null}
    />
  );
}
```

- [ ] **Step 2: Supprimer les anciens composants mockés**

```bash
git rm components/features/admin/signalement-drawer.tsx components/features/admin/signalement-moderation-panel.tsx components/features/admin/signalement-updates-panel.tsx
```

- [ ] **Step 3: Vérifier qu'il ne reste aucune référence cassée**

Run: `grep -rn "features/admin/signalement-drawer\|features/admin/signalement-moderation-panel\|features/admin/signalement-updates-panel" app components features`
Expected: aucun résultat (les seules références étaient l'ancien `page.tsx`, réécrit à l'étape 1, et les fichiers entre eux, supprimés à l'étape 2).

- [ ] **Step 4: Typecheck et lint complets**

Run: `pnpm run typecheck`
Expected: aucune erreur.

Run: `pnpm run lint`
Expected: aucune erreur.

- [ ] **Step 5: Vérification manuelle serveur de dev**

Démarrer `pnpm run dev` si non déjà lancé, puis :

Run: `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/admin/signalements --max-time 15`
Expected: `307` (redirection d'authentification attendue pour un accès non authentifié — confirme que la page compile et répond sans erreur serveur, même pattern de vérification que pour `quiz-admin`/`membres-admin` dans ce projet).

Si une session admin est disponible dans le navigateur (via Claude in Chrome ou manuellement), naviguer vers `/admin/signalements`, vérifier que la liste réelle s'affiche, que les onglets de statut et le filtre catégorie changent le contenu sans afficher le skeleton plein écran de `loading.tsx`, qu'ouvrir un signalement affiche le tiroir avec les vraies données, et que changer le statut ou le toggle "Afficher dans l'app / Masquer" persiste après réouverture (recharger la page).

- [ ] **Step 6: Commit**

```bash
git add app/admin/\(shell\)/signalements/page.tsx
git commit -m "$(cat <<'EOF'
feat(signalements-admin): page admin branchée sur l'API réelle

Remplace le mock local par le module signalement-citoyen du backend.
Le panneau "Mises à jour" reste en state local (gap backend transmis
séparément, cf. docs/superpowers/specs/2026-08-29-signalements-admin-design.md).

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Dsm1DM4UcgZ1gh2QDKfDPf
EOF
)"
```
