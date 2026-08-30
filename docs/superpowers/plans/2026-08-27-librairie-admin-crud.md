# CRUD admin Librairie (upload R2 présigné) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer le mock « soumission → validation → en ligne » de `/admin/ressources` par un
vrai CRUD (upload, édition, suppression) branché sur le module backend `Librairie`, avec upload de
fichier par URL présignée Cloudflare R2 (le serveur onmec-site ne reçoit jamais les octets).

**Architecture:** Deux route handlers (`app/api/admin/librairie/*`) proxient les appels
authentifiés vers le backend (`apiFetch`, cookie httpOnly). L'upload de fichier ne passe **pas** par
ces route handlers : le navigateur demande une URL présignée via un des route handlers, puis envoie
le fichier **directement** à R2 par `fetch` brut — exception délibérée au patron BFF habituel de ce
projet, documentée dans `docs/superpowers/specs/2026-08-27-librairie-frontend-design.md`.

**Tech Stack:** Next.js App Router (route handlers), React 19, TanStack Query, TypeScript strict,
Vitest.

**Spec:** `docs/superpowers/specs/2026-08-27-librairie-frontend-design.md`

## Global Constraints

- BFF strict pour tout ce qui n'est **pas** le transfert d'octets vers R2 : `apiFetch()` côté
  serveur pour parler à `api.mec-ci.org`, `fetch-json.ts` côté client pour parler aux route
  handlers de onmec-site. Le seul `fetch` brut vers une URL tierce autorisé dans ce plan est
  `putFileToUploadUrl` (Task 2) — isolé dans un seul fichier, jamais dupliqué ailleurs.
- Ce plan dépend de `features/librairie/types/document.ts`
  (`docs/superpowers/plans/2026-08-27-librairie-public-catalog.md`, Task 1) — l'exécuter d'abord, ou
  au minimum sa Task 1.
- Fichiers de 200 lignes maximum sauf nécessité réelle documentée.
- Le backend n'accepte que le PDF pour le document principal, jpg/jpeg/png/webp pour la couverture —
  validé côté backend (`LibrairieService.buildUploadUrl`), mais l'UI doit refuser en amont les
  fichiers visiblement incompatibles pour ne pas gaspiller un aller-retour réseau.
- Édition (`PATCH`) : texte seul (titre/description/catégorie), pas de re-upload de fichier/
  couverture dans ce plan (hors scope, voir spec).
- Aucune modification du repo `onmec_backend`/`onmec_backend-r2-storage`.
- `R2StorageService.isConfigured()` renvoie 503 tant que les credentials R2 ne sont pas
  configurées côté backend — la vérification manuelle de bout en bout (Task 12) peut être bloquée
  jusque-là ; le signaler explicitement plutôt que de contourner.

---

## Task 1: Requête de liste admin

**Files:**

- Create: `features/librairie-admin/requests/list-librairie-admin.ts`

**Interfaces:**

- Consumes: `apiFetch` (`lib/api-client.ts`), `AdminLibrairieDocument`
  (`features/librairie/types/document.ts`).
- Produces: `listLibrairieAdmin(): Promise<LibrairieAdminListResponse>` — consommé par
  `app/admin/(shell)/ressources/page.tsx` (Task 10).

Pas de test : wrapper `apiFetch` fin, même convention que `list-actualites-admin.ts` (non testé).

- [ ] **Step 1: Implementer**

```ts
// features/librairie-admin/requests/list-librairie-admin.ts
import { apiFetch } from "@/lib/api-client";
import type {
  AdminLibrairieDocument,
  LibrairieListMeta,
} from "@/features/librairie/types/document";

export interface LibrairieAdminListResponse {
  data: AdminLibrairieDocument[];
  meta: LibrairieListMeta;
}

// ponytail: limit=50 recupere toute la liste admin en un appel, comme list-actualites-admin.ts —
// pas de pagination serveur cote UI admin tant que le nombre de documents reste modeste.
export function listLibrairieAdmin(): Promise<LibrairieAdminListResponse> {
  return apiFetch<LibrairieAdminListResponse>("/librairie?limit=50");
}
```

- [ ] **Step 2: Verifier le typecheck**

Run: `pnpm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add features/librairie-admin/requests/list-librairie-admin.ts
git commit -m "feat(librairie-admin): requete de liste admin"
```

---

## Task 2: Upload direct vers R2 (`putFileToUploadUrl`)

**Files:**

- Create: `features/librairie-admin/lib/upload-to-r2.ts`
- Test: `features/librairie-admin/lib/upload-to-r2.test.ts`

**Interfaces:**

- Produces: `putFileToUploadUrl(uploadUrl: string, file: File, contentType: string): Promise<void>`
  — consommé par `create-document-with-upload.ts` (Task 4).

- [ ] **Step 1: Ecrire le test**

```ts
// features/librairie-admin/lib/upload-to-r2.test.ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { putFileToUploadUrl } from "@/features/librairie-admin/lib/upload-to-r2";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("putFileToUploadUrl", () => {
  it("envoie un PUT avec le Content-Type et le fichier en corps", async () => {
    const file = new File(["contenu"], "guide.pdf", { type: "application/pdf" });
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      expect(init?.method).toBe("PUT");
      const headers = new Headers(init?.headers);
      expect(headers.get("Content-Type")).toBe("application/pdf");
      expect(init?.body).toBe(file);
      return new Response(null, { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);

    await putFileToUploadUrl("https://r2.example/upload-url", file, "application/pdf");
    expect(fetchMock).toHaveBeenCalledWith("https://r2.example/upload-url", expect.anything());
  });

  it("leve une erreur si la reponse n'est pas ok", async () => {
    const file = new File(["contenu"], "guide.pdf", { type: "application/pdf" });
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(null, { status: 403 })),
    );

    await expect(
      putFileToUploadUrl("https://r2.example/upload-url", file, "application/pdf"),
    ).rejects.toThrow("403");
  });
});
```

- [ ] **Step 2: Lancer le test, verifier qu'il echoue**

Run: `pnpm run test upload-to-r2`
Expected: FAIL avec "Failed to resolve import" ou "putFileToUploadUrl is not a function".

- [ ] **Step 3: Implementer**

```ts
// features/librairie-admin/lib/upload-to-r2.ts

/**
 * PUT direct vers une URL presignee R2 — exception documentee au patron BFF de ce projet : le
 * serveur onmec-site ne recoit jamais les octets du fichier, seule cette fonction parle a un hote
 * tiers (voir docs/superpowers/specs/2026-08-27-librairie-frontend-design.md).
 */
export async function putFileToUploadUrl(
  uploadUrl: string,
  file: File | Blob,
  contentType: string,
): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: file,
  });
  if (!response.ok) {
    throw new Error(`Échec de l'envoi du fichier vers le stockage (${response.status})`);
  }
}
```

- [ ] **Step 4: Lancer le test, verifier qu'il passe**

Run: `pnpm run test upload-to-r2`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add features/librairie-admin/lib/upload-to-r2.ts features/librairie-admin/lib/upload-to-r2.test.ts
git commit -m "feat(librairie-admin): PUT direct vers une url presignee R2"
```

---

## Task 3: Demande d'URL présignée (requête + route handler)

**Files:**

- Create: `features/librairie-admin/requests/request-upload-url.ts`
- Create: `app/api/admin/librairie/upload-url/route.ts`

**Interfaces:**

- Consumes: `apiFetch` (`lib/api-client.ts`), `toErrorResponse` (`lib/to-error-response.ts`).
- Produces: `requestUploadUrl(body): Promise<UploadUrlResult>` (server), route `POST
/api/admin/librairie/upload-url` — consommés par `create-document-with-upload.ts` (Task 4).

Pas de test dédié : wrapper `apiFetch` fin + route handler proxy, même convention que
`create-actualite.ts`/`app/api/admin/actualites/route.ts` (non testés isolément — couverts par la
vérification manuelle, Task 12).

- [ ] **Step 1: `request-upload-url.ts`**

```ts
// features/librairie-admin/requests/request-upload-url.ts
import { apiFetch } from "@/lib/api-client";

export interface UploadUrlRequest {
  filename: string;
  contentType: string;
  kind: "fichier" | "cover";
  documentId?: string;
}

export interface UploadUrlResult {
  key: string;
  uploadUrl: string;
  expiresIn: number;
  documentId: string;
}

export function requestUploadUrl(body: UploadUrlRequest): Promise<UploadUrlResult> {
  return apiFetch<UploadUrlResult>("/librairie/upload-url", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
```

- [ ] **Step 2: Route handler**

```ts
// app/api/admin/librairie/upload-url/route.ts
import { NextResponse } from "next/server";
import { requestUploadUrl } from "@/features/librairie-admin/requests/request-upload-url";
import { toErrorResponse } from "@/lib/to-error-response";

export async function POST(request: Request) {
  const body = await request.json();
  try {
    const result = await requestUploadUrl(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
```

- [ ] **Step 3: Verifier le typecheck**

Run: `pnpm run typecheck`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add features/librairie-admin/requests/request-upload-url.ts "app/api/admin/librairie/upload-url/route.ts"
git commit -m "feat(librairie-admin): demande d'url presignee (fichier ou couverture)"
```

---

## Task 4: Orchestration de la création (upload + finalisation)

**Files:**

- Create: `features/librairie-admin/requests/create-librairie-admin.ts`
- Create: `features/librairie-admin/lib/create-document-with-upload.ts`
- Test: `features/librairie-admin/lib/create-document-with-upload.test.ts`
- Create: `app/api/admin/librairie/route.ts`

**Interfaces:**

- Consumes: `requestUploadUrl` (Task 3, via la route `/api/admin/librairie/upload-url`),
  `putFileToUploadUrl` (Task 2), `postJson` (`lib/fetch-json.ts`), `apiFetch`
  (`lib/api-client.ts`), `AdminLibrairieDocument` (`features/librairie/types/document.ts`).
- Produces: `createLibrairieAdmin(payload)` (server, utilisé par la route),
  `createDocumentWithUpload(input): Promise<AdminLibrairieDocument>`, `CreateDocumentStep` — ce
  dernier consommé par `useCreateDocument` (Task 6) et `UploadDocumentDialog` (Task 7).

- [ ] **Step 1: `create-librairie-admin.ts`** (server, utilisé uniquement par le route handler)

```ts
// features/librairie-admin/requests/create-librairie-admin.ts
import { apiFetch } from "@/lib/api-client";
import type { AdminLibrairieDocument } from "@/features/librairie/types/document";

export interface CreateLibrairiePayload {
  title: string;
  description?: string;
  categorie?: string;
  fichierKey: string;
  coverKey?: string;
}

export function createLibrairieAdmin(
  payload: CreateLibrairiePayload,
): Promise<AdminLibrairieDocument> {
  return apiFetch<AdminLibrairieDocument>("/librairie", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
```

- [ ] **Step 2: Route handler**

```ts
// app/api/admin/librairie/route.ts
import { NextResponse } from "next/server";
import { createLibrairieAdmin } from "@/features/librairie-admin/requests/create-librairie-admin";
import { toErrorResponse } from "@/lib/to-error-response";

export async function POST(request: Request) {
  const body = await request.json();
  try {
    const document = await createLibrairieAdmin(body);
    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
```

- [ ] **Step 3: Ecrire le test de l'orchestration**

```ts
// features/librairie-admin/lib/create-document-with-upload.test.ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { createDocumentWithUpload } from "@/features/librairie-admin/lib/create-document-with-upload";

afterEach(() => {
  vi.unstubAllGlobals();
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("createDocumentWithUpload", () => {
  it("upload le fichier puis finalise, sans couverture", async () => {
    const calls: string[] = [];
    const file = new File(["pdf"], "guide.pdf", { type: "application/pdf" });

    const fetchMock = vi.fn(async (url: string | URL, init?: RequestInit) => {
      const href = String(url);
      calls.push(href);
      if (href === "/api/admin/librairie/upload-url") {
        return jsonResponse({
          key: "librairie/doc-1/fichier.pdf",
          uploadUrl: "https://r2.example/fichier",
          expiresIn: 300,
          documentId: "doc-1",
        });
      }
      if (href === "https://r2.example/fichier") {
        expect(init?.method).toBe("PUT");
        return new Response(null, { status: 200 });
      }
      if (href === "/api/admin/librairie") {
        const body = JSON.parse(String(init?.body));
        expect(body).toEqual({
          title: "Guide",
          description: undefined,
          categorie: undefined,
          fichierKey: "librairie/doc-1/fichier.pdf",
          coverKey: undefined,
        });
        return jsonResponse({ id: "doc-1", title: "Guide" });
      }
      throw new Error(`URL inattendue: ${href}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    const steps: string[] = [];
    const result = await createDocumentWithUpload({
      title: "Guide",
      description: "",
      categorie: "",
      file,
      cover: null,
      onStep: (step) => steps.push(step),
    });

    expect(result).toEqual({ id: "doc-1", title: "Guide" });
    expect(steps).toEqual(["upload-fichier", "finalisation"]);
    expect(calls).toEqual([
      "/api/admin/librairie/upload-url",
      "https://r2.example/fichier",
      "/api/admin/librairie",
    ]);
  });

  it("upload aussi la couverture quand elle est fournie, en reutilisant le documentId", async () => {
    const file = new File(["pdf"], "guide.pdf", { type: "application/pdf" });
    const cover = new File(["img"], "cover.png", { type: "image/png" });
    const uploadUrlCalls: unknown[] = [];

    const fetchMock = vi.fn(async (url: string | URL, init?: RequestInit) => {
      const href = String(url);
      if (href === "/api/admin/librairie/upload-url") {
        const body = JSON.parse(String(init?.body));
        uploadUrlCalls.push(body);
        if (body.kind === "fichier") {
          return jsonResponse({
            key: "librairie/doc-2/fichier.pdf",
            uploadUrl: "https://r2.example/fichier",
            expiresIn: 300,
            documentId: "doc-2",
          });
        }
        return jsonResponse({
          key: "librairie/doc-2/cover.png",
          uploadUrl: "https://r2.example/cover",
          expiresIn: 300,
          documentId: "doc-2",
        });
      }
      if (href === "https://r2.example/fichier" || href === "https://r2.example/cover") {
        return new Response(null, { status: 200 });
      }
      if (href === "/api/admin/librairie") {
        return jsonResponse({ id: "doc-2", title: "Guide" });
      }
      throw new Error(`URL inattendue: ${href}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    const steps: string[] = [];
    await createDocumentWithUpload({
      title: "Guide",
      description: "",
      categorie: "",
      file,
      cover,
      onStep: (step) => steps.push(step),
    });

    expect(steps).toEqual(["upload-fichier", "upload-cover", "finalisation"]);
    expect(uploadUrlCalls).toEqual([
      { filename: "guide.pdf", contentType: "application/pdf", kind: "fichier" },
      { filename: "cover.png", contentType: "image/png", kind: "cover", documentId: "doc-2" },
    ]);
  });
});
```

- [ ] **Step 4: Lancer le test, verifier qu'il echoue**

Run: `pnpm run test create-document-with-upload`
Expected: FAIL avec "Failed to resolve import".

- [ ] **Step 5: Implementer**

```ts
// features/librairie-admin/lib/create-document-with-upload.ts
import { postJson } from "@/lib/fetch-json";
import { putFileToUploadUrl } from "@/features/librairie-admin/lib/upload-to-r2";
import type { AdminLibrairieDocument } from "@/features/librairie/types/document";
// import type est efface a la compilation : reutiliser ces formes n'importe pas apiFetch
// (server-only) dans ce fichier client, seulement la forme des donnees echangees avec la route.
import type {
  UploadUrlRequest,
  UploadUrlResult,
} from "@/features/librairie-admin/requests/request-upload-url";

export type CreateDocumentStep = "upload-fichier" | "upload-cover" | "finalisation";

export interface CreateDocumentInput {
  title: string;
  description: string;
  categorie: string;
  file: File;
  cover: File | null;
  onStep?: (step: CreateDocumentStep) => void;
}

function requestUploadUrl(body: UploadUrlRequest): Promise<UploadUrlResult> {
  return postJson<UploadUrlResult>("/api/admin/librairie/upload-url", body);
}

export async function createDocumentWithUpload(
  input: CreateDocumentInput,
): Promise<AdminLibrairieDocument> {
  input.onStep?.("upload-fichier");
  const fichierUpload = await requestUploadUrl({
    filename: input.file.name,
    contentType: input.file.type,
    kind: "fichier",
  });
  await putFileToUploadUrl(fichierUpload.uploadUrl, input.file, input.file.type);

  let coverKey: string | undefined;
  if (input.cover) {
    input.onStep?.("upload-cover");
    const coverUpload = await requestUploadUrl({
      filename: input.cover.name,
      contentType: input.cover.type,
      kind: "cover",
      documentId: fichierUpload.documentId,
    });
    await putFileToUploadUrl(coverUpload.uploadUrl, input.cover, input.cover.type);
    coverKey = coverUpload.key;
  }

  input.onStep?.("finalisation");
  return postJson<AdminLibrairieDocument>("/api/admin/librairie", {
    title: input.title,
    description: input.description || undefined,
    categorie: input.categorie || undefined,
    fichierKey: fichierUpload.key,
    coverKey,
  });
}
```

- [ ] **Step 6: Lancer le test, verifier qu'il passe**

Run: `pnpm run test create-document-with-upload`
Expected: PASS (2 tests)

- [ ] **Step 7: Verifier le typecheck**

Run: `pnpm run typecheck`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add features/librairie-admin/requests/create-librairie-admin.ts features/librairie-admin/lib/create-document-with-upload.ts features/librairie-admin/lib/create-document-with-upload.test.ts "app/api/admin/librairie/route.ts"
git commit -m "feat(librairie-admin): orchestration creation (upload url + PUT R2 + finalisation)"
```

---

## Task 5: Édition et suppression

**Files:**

- Create: `features/librairie-admin/requests/update-librairie-admin.ts`
- Create: `features/librairie-admin/requests/delete-librairie-admin.ts`
- Create: `app/api/admin/librairie/[id]/route.ts`

**Interfaces:**

- Consumes: `apiFetch` (`lib/api-client.ts`), `toErrorResponse` (`lib/to-error-response.ts`),
  `AdminLibrairieDocument` (`features/librairie/types/document.ts`).
- Produces: `updateLibrairieAdmin(id, payload)`, `deleteLibrairieAdmin(id)`, routes `PATCH`/`DELETE
/api/admin/librairie/{id}` — consommés par les mutations (Task 6).

Pas de test dédié : même convention que `update-actualite.ts`/`delete-actualite.ts` et leurs routes
(non testés isolément).

- [ ] **Step 1: `update-librairie-admin.ts`**

```ts
// features/librairie-admin/requests/update-librairie-admin.ts
import { apiFetch } from "@/lib/api-client";
import type { AdminLibrairieDocument } from "@/features/librairie/types/document";

export interface UpdateLibrairiePayload {
  title?: string;
  description?: string;
  categorie?: string;
}

export function updateLibrairieAdmin(
  id: string,
  payload: UpdateLibrairiePayload,
): Promise<AdminLibrairieDocument> {
  return apiFetch<AdminLibrairieDocument>(`/librairie/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
```

- [ ] **Step 2: `delete-librairie-admin.ts`**

```ts
// features/librairie-admin/requests/delete-librairie-admin.ts
import { apiFetch } from "@/lib/api-client";

export function deleteLibrairieAdmin(id: string): Promise<{ id: string }> {
  return apiFetch<{ id: string }>(`/librairie/${id}`, { method: "DELETE" });
}
```

- [ ] **Step 3: Route handler**

```ts
// app/api/admin/librairie/[id]/route.ts
import { NextResponse } from "next/server";
import { updateLibrairieAdmin } from "@/features/librairie-admin/requests/update-librairie-admin";
import { deleteLibrairieAdmin } from "@/features/librairie-admin/requests/delete-librairie-admin";
import { toErrorResponse } from "@/lib/to-error-response";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  try {
    const document = await updateLibrairieAdmin(id, body);
    return NextResponse.json(document);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const result = await deleteLibrairieAdmin(id);
    return NextResponse.json(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
```

- [ ] **Step 4: Verifier le typecheck**

Run: `pnpm run typecheck`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add features/librairie-admin/requests/update-librairie-admin.ts features/librairie-admin/requests/delete-librairie-admin.ts "app/api/admin/librairie/[id]/route.ts"
git commit -m "feat(librairie-admin): edition et suppression"
```

---

## Task 6: Mutations client (TanStack Query)

**Files:**

- Create: `features/librairie-admin/mutations/use-create-document.ts`
- Create: `features/librairie-admin/mutations/use-update-document.ts`
- Create: `features/librairie-admin/mutations/use-delete-document.ts`

**Interfaces:**

- Consumes: `createDocumentWithUpload`/`CreateDocumentInput` (Task 4), `patchJson`/`deleteJson`
  (`lib/fetch-json.ts`), `AdminLibrairieDocument` (`features/librairie/types/document.ts`).
- Produces: `useCreateDocument()`, `useUpdateDocument()`, `useDeleteDocument()` — consommés par
  `UploadDocumentDialog` (Task 7), `EditDocumentDialog` (Task 8), `LibrairieAdminClient` (Task 9).

Pas de test : hooks TanStack Query, même convention que `use-create-actualite.ts`/
`use-delete-actualite.ts` (non testés — la logique qu'ils orchestrent est déjà testée en Task 2 et
Task 4).

- [ ] **Step 1: `use-create-document.ts`**

```ts
// features/librairie-admin/mutations/use-create-document.ts
"use client";

import { useMutation } from "@tanstack/react-query";
import {
  createDocumentWithUpload,
  type CreateDocumentInput,
} from "@/features/librairie-admin/lib/create-document-with-upload";

export function useCreateDocument() {
  return useMutation({
    mutationFn: (input: CreateDocumentInput) => createDocumentWithUpload(input),
  });
}
```

- [ ] **Step 2: `use-update-document.ts`**

```ts
// features/librairie-admin/mutations/use-update-document.ts
"use client";

import { useMutation } from "@tanstack/react-query";
import { patchJson } from "@/lib/fetch-json";
import type { AdminLibrairieDocument } from "@/features/librairie/types/document";
import type { UpdateLibrairiePayload } from "@/features/librairie-admin/requests/update-librairie-admin";

interface UpdateDocumentInput extends UpdateLibrairiePayload {
  id: string;
}

export function useUpdateDocument() {
  return useMutation({
    mutationFn: ({ id, ...payload }: UpdateDocumentInput) =>
      patchJson<AdminLibrairieDocument>(`/api/admin/librairie/${id}`, payload),
  });
}
```

- [ ] **Step 3: `use-delete-document.ts`**

```ts
// features/librairie-admin/mutations/use-delete-document.ts
"use client";

import { useMutation } from "@tanstack/react-query";
import { deleteJson } from "@/lib/fetch-json";

export function useDeleteDocument() {
  return useMutation({
    mutationFn: (id: string) => deleteJson(`/api/admin/librairie/${id}`),
  });
}
```

- [ ] **Step 4: Verifier le typecheck**

Run: `pnpm run typecheck`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add features/librairie-admin/mutations/
git commit -m "feat(librairie-admin): mutations create/update/delete"
```

---

## Task 7: `UploadDocumentDialog`

**Files:**

- Create: `components/features/librairie-admin/upload-document-dialog.tsx`

**Interfaces:**

- Consumes: `useCreateDocument` (Task 6), `CreateDocumentStep` (Task 4), `Dialog`/`DialogTitle`
  (`components/ui/dialog.tsx`), `Button`/`IconButton`/`Field`/`Input`
  (`components/ui/*`), `AdminLibrairieDocument` (`features/librairie/types/document.ts`).
- Produces: `<UploadDocumentDialog open onClose categories onCreated />` — consommé par
  `LibrairieAdminClient` (Task 9).

Pas de test : formulaire avec état local, même convention que les autres dialogs admin (non
testés).

- [ ] **Step 1: Implementer**

```tsx
// components/features/librairie-admin/upload-document-dialog.tsx
"use client";

import { useState, type ChangeEvent } from "react";
import { X } from "lucide-react";
import { Dialog, DialogTitle } from "@/components/ui/dialog";
import { IconButton } from "@/components/ui/icon-button";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useCreateDocument } from "@/features/librairie-admin/mutations/use-create-document";
import type { CreateDocumentStep } from "@/features/librairie-admin/lib/create-document-with-upload";
import type { AdminLibrairieDocument } from "@/features/librairie/types/document";

const STEP_LABELS: Record<CreateDocumentStep, string> = {
  "upload-fichier": "Envoi du document…",
  "upload-cover": "Envoi de la couverture…",
  finalisation: "Enregistrement…",
};

interface UploadDocumentDialogProps {
  open: boolean;
  onClose: () => void;
  categories: string[];
  onCreated: (document: AdminLibrairieDocument) => void;
}

export function UploadDocumentDialog({
  open,
  onClose,
  categories,
  onCreated,
}: UploadDocumentDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categorie, setCategorie] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [step, setStep] = useState<CreateDocumentStep | null>(null);

  const createDocument = useCreateDocument();

  function reset() {
    setTitle("");
    setDescription("");
    setCategorie("");
    setFile(null);
    setCover(null);
    setStep(null);
    createDocument.reset();
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setFile(event.target.files?.[0] ?? null);
  }

  function handleCoverChange(event: ChangeEvent<HTMLInputElement>) {
    setCover(event.target.files?.[0] ?? null);
  }

  function submit() {
    if (!title.trim() || !file) return;
    createDocument.mutate(
      { title: title.trim(), description, categorie, file, cover, onStep: setStep },
      {
        onSuccess: (document) => {
          onCreated(document);
          handleClose();
        },
      },
    );
  }

  const pending = createDocument.isPending;

  return (
    <Dialog open={open} onClose={handleClose}>
      <div className="flex items-start justify-between gap-3.5 rounded-t-[10px] border-b border-border-subtle bg-surface-card px-5.5 py-5">
        <span className="flex flex-col gap-1">
          <span className="text-[0.6875rem] font-semibold tracking-[0.13em] text-muted-foreground uppercase">
            Site public
          </span>
          <DialogTitle asChild>
            <span className="text-xl font-semibold tracking-[-0.026em] text-ink">
              Nouveau document
            </span>
          </DialogTitle>
        </span>
        <IconButton icon={X} label="Fermer" onClick={handleClose} />
      </div>
      <div className="flex flex-col gap-4.5 p-5.5">
        <Field label="Titre">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} disabled={pending} />
        </Field>
        <Field label="Description" hint="Facultatif">
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={pending}
          />
        </Field>
        <Field label="Catégorie" hint="Libre — tapez une nouvelle catégorie ou choisissez-en une">
          <Input
            value={categorie}
            onChange={(e) => setCategorie(e.target.value)}
            disabled={pending}
            list="librairie-categories"
          />
          <datalist id="librairie-categories">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Field>
        <Field label="Fichier PDF" hint="Obligatoire">
          <Input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            disabled={pending}
          />
        </Field>
        <Field label="Couverture" hint="Facultatif — jpg, png ou webp">
          <Input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleCoverChange}
            disabled={pending}
          />
        </Field>
        {step ? <p className="text-sm text-muted-foreground">{STEP_LABELS[step]}</p> : null}
        {createDocument.isError ? (
          <p className="text-sm text-verdict-false">
            Échec{step ? ` pendant : ${STEP_LABELS[step]}` : ""} — réessayez.
          </p>
        ) : null}
      </div>
      <div className="flex items-center gap-2.5 rounded-b-[10px] border-t border-border-subtle bg-surface-card px-5.5 py-4">
        <Button variant="primary" disabled={!title.trim() || !file || pending} onClick={submit}>
          {pending ? "Envoi…" : "Créer le document"}
        </Button>
        <Button variant="ghost" onClick={handleClose} disabled={pending}>
          Annuler
        </Button>
      </div>
    </Dialog>
  );
}
```

- [ ] **Step 2: Verifier le typecheck**

Run: `pnpm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add components/features/librairie-admin/upload-document-dialog.tsx
git commit -m "feat(librairie-admin): dialogue d'upload multi-etapes"
```

---

## Task 8: `EditDocumentDialog`

**Files:**

- Create: `components/features/librairie-admin/edit-document-dialog.tsx`

**Interfaces:**

- Consumes: `useUpdateDocument` (Task 6), `Dialog`/`DialogTitle`, `Button`/`IconButton`/`Field`/
  `Input`, `AdminLibrairieDocument` (`features/librairie/types/document.ts`).
- Produces: `<EditDocumentDialog document onClose categories onUpdated />` — consommé par
  `LibrairieAdminClient` (Task 9). `document={null}` ferme le dialogue (même patron que
  `RessourcePreviewOverlay` : piloté par une valeur nullable plutôt qu'un booléen `open` séparé).

- [ ] **Step 1: Implementer**

```tsx
// components/features/librairie-admin/edit-document-dialog.tsx
"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Dialog, DialogTitle, useLastNonNull } from "@/components/ui/dialog";
import { IconButton } from "@/components/ui/icon-button";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useUpdateDocument } from "@/features/librairie-admin/mutations/use-update-document";
import type { AdminLibrairieDocument } from "@/features/librairie/types/document";

interface EditDocumentDialogProps {
  document: AdminLibrairieDocument | null;
  categories: string[];
  onClose: () => void;
  onUpdated: (document: AdminLibrairieDocument) => void;
}

export function EditDocumentDialog({
  document,
  categories,
  onClose,
  onUpdated,
}: EditDocumentDialogProps) {
  const shown = useLastNonNull(document);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categorie, setCategorie] = useState("");
  const updateDocument = useUpdateDocument();

  // Re-initialise les champs a chaque nouveau document edite — comportement attendu d'un formulaire
  // controle par une prop externe, pas une derivation a bannir.
  useEffect(() => {
    if (!document) return;
    setTitle(document.title);
    setDescription(document.description ?? "");
    setCategorie(document.categorie ?? "");
  }, [document]);

  if (!shown) return null;

  function submit() {
    if (!document || !title.trim()) return;
    updateDocument.mutate(
      { id: document.id, title: title.trim(), description, categorie },
      { onSuccess: (updated) => onUpdated(updated) },
    );
  }

  const pending = updateDocument.isPending;

  return (
    <Dialog open={document !== null} onClose={onClose}>
      <div className="flex items-start justify-between gap-3.5 rounded-t-[10px] border-b border-border-subtle bg-surface-card px-5.5 py-5">
        <DialogTitle asChild>
          <span className="text-xl font-semibold tracking-[-0.026em] text-ink">
            Modifier « {shown.title} »
          </span>
        </DialogTitle>
        <IconButton icon={X} label="Fermer" onClick={onClose} />
      </div>
      <div className="flex flex-col gap-4.5 p-5.5">
        <Field label="Titre">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} disabled={pending} />
        </Field>
        <Field label="Description" hint="Facultatif">
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={pending}
          />
        </Field>
        <Field label="Catégorie">
          <Input
            value={categorie}
            onChange={(e) => setCategorie(e.target.value)}
            disabled={pending}
            list="librairie-categories-edit"
          />
          <datalist id="librairie-categories-edit">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Field>
        {updateDocument.isError ? (
          <p className="text-sm text-verdict-false">Échec de la mise à jour — réessayez.</p>
        ) : null}
      </div>
      <div className="flex items-center gap-2.5 rounded-b-[10px] border-t border-border-subtle bg-surface-card px-5.5 py-4">
        <Button variant="primary" disabled={!title.trim() || pending} onClick={submit}>
          {pending ? "Enregistrement…" : "Enregistrer"}
        </Button>
        <Button variant="ghost" onClick={onClose} disabled={pending}>
          Annuler
        </Button>
      </div>
    </Dialog>
  );
}
```

- [ ] **Step 2: Verifier le typecheck**

Run: `pnpm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add components/features/librairie-admin/edit-document-dialog.tsx
git commit -m "feat(librairie-admin): dialogue d'edition (titre/description/categorie)"
```

---

## Task 9: `LibrairieAdminClient` (liste + actions)

**Files:**

- Create: `components/features/librairie-admin/librairie-admin-client.tsx`

**Interfaces:**

- Consumes: `useDeleteDocument` (Task 6), `UploadDocumentDialog` (Task 7), `EditDocumentDialog`
  (Task 8), `ConfirmDialog` (`components/ui/alert-dialog.tsx`), `Button`/`IconButton`,
  `useAdminShell` (`components/features/admin/admin-shell-context.tsx`), `AdminLibrairieDocument`
  (`features/librairie/types/document.ts`), `toast` (`sonner`).
- Produces: `<LibrairieAdminClient initialDocuments categories />` — consommé par
  `app/admin/(shell)/ressources/page.tsx` (Task 10).

Pas de test : composant orchestrateur avec effets de bord (mutations réseau), même convention que
`ActualitesAdminClient` (non testé — vérifié manuellement, Task 12).

- [ ] **Step 1: Implementer**

```tsx
// components/features/librairie-admin/librairie-admin-client.tsx
"use client";

import { useState } from "react";
import { Upload, Pencil, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { ConfirmDialog } from "@/components/ui/alert-dialog";
import { useAdminShell } from "@/components/features/admin/admin-shell-context";
import { useDeleteDocument } from "@/features/librairie-admin/mutations/use-delete-document";
import { UploadDocumentDialog } from "@/components/features/librairie-admin/upload-document-dialog";
import { EditDocumentDialog } from "@/components/features/librairie-admin/edit-document-dialog";
import type { AdminLibrairieDocument } from "@/features/librairie/types/document";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR");
}

interface LibrairieAdminClientProps {
  initialDocuments: AdminLibrairieDocument[];
  categories: string[];
}

export function LibrairieAdminClient({ initialDocuments, categories }: LibrairieAdminClientProps) {
  const shell = useAdminShell();
  const [documents, setDocuments] = useState(initialDocuments);
  const [showUpload, setShowUpload] = useState(false);
  const [editing, setEditing] = useState<AdminLibrairieDocument | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminLibrairieDocument | null>(null);

  const removeMutation = useDeleteDocument();

  function handleConfirmDelete() {
    if (!pendingDelete) return;
    removeMutation.mutate(pendingDelete.id, {
      onSuccess: () => {
        setDocuments((prev) => prev.filter((item) => item.id !== pendingDelete.id));
        setPendingDelete(null);
      },
      onError: () => {
        toast.error("Une erreur est survenue. Réessayez.");
      },
    });
  }

  return (
    <div className="flex max-w-[1320px] flex-col gap-5.5">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold tracking-[0.13em] text-orange-700 uppercase">
            Site public
          </span>
          <h1 className="text-[1.75rem] leading-[1.12] font-semibold tracking-[-0.028em] text-ink">
            Ressources pédagogiques
          </h1>
          <p className="text-[0.9375rem] text-muted-foreground">
            {documents.length} document{documents.length > 1 ? "s" : ""}
          </p>
        </div>
        {shell.canEdito ? (
          <Button variant="primary" icon={Upload} onClick={() => setShowUpload(true)}>
            Ajouter un document
          </Button>
        ) : null}
      </div>

      <div className="overflow-x-auto rounded-lg border border-border-subtle bg-surface-card">
        <div className="min-w-[760px]">
          <div className="grid grid-cols-[minmax(0,1fr)_140px_100px_140px_120px] gap-3.5 border-b border-border-subtle bg-n-50 px-4 py-2.5 text-[0.6875rem] font-semibold tracking-[0.09em] text-muted-foreground uppercase">
            <span>Titre</span>
            <span>Catégorie</span>
            <span>Pages</span>
            <span>Ajouté le</span>
            <span className="text-right">Actions</span>
          </div>
          {documents.map((document) => {
            const deletePending =
              removeMutation.isPending && removeMutation.variables === document.id;
            return (
              <div
                key={document.id}
                className="grid grid-cols-[minmax(0,1fr)_140px_100px_140px_120px] items-center gap-3.5 border-b border-border-subtle px-4 py-3 text-sm last:border-b-0"
              >
                <span className="flex items-center gap-2 font-medium text-ink">
                  <FileText className="h-4 w-4 text-muted-foreground" aria-hidden />
                  {document.title}
                </span>
                <span className="text-[0.8125rem] text-muted-foreground">
                  {document.categorie ?? "—"}
                </span>
                <span className="text-[0.8125rem] text-muted-foreground tabular-nums">
                  {document.pageCount ?? "—"}
                </span>
                <span className="text-[0.8125rem] text-muted-foreground tabular-nums">
                  {formatDate(document.uploadedAt)}
                </span>
                <span className="flex justify-end gap-1.5">
                  {shell.canEdito ? (
                    <>
                      <IconButton
                        icon={Pencil}
                        label="Modifier"
                        size="sm"
                        disabled={deletePending}
                        onClick={() => setEditing(document)}
                      />
                      <IconButton
                        icon={Trash2}
                        label="Supprimer"
                        size="sm"
                        disabled={deletePending}
                        onClick={() => setPendingDelete(document)}
                      />
                    </>
                  ) : null}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <UploadDocumentDialog
        open={showUpload}
        onClose={() => setShowUpload(false)}
        categories={categories}
        onCreated={(document) => setDocuments((prev) => [document, ...prev])}
      />

      <EditDocumentDialog
        document={editing}
        categories={categories}
        onClose={() => setEditing(null)}
        onUpdated={(updated) => {
          setDocuments((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
          setEditing(null);
        }}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(next) => {
          if (!next) setPendingDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title={`Supprimer « ${pendingDelete?.title ?? ""} » ?`}
        description="Cette action est définitive."
        confirmLabel="Supprimer"
        destructive
        confirmPending={removeMutation.isPending}
      />
    </div>
  );
}
```

- [ ] **Step 2: Verifier le typecheck**

Run: `pnpm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add components/features/librairie-admin/librairie-admin-client.tsx
git commit -m "feat(librairie-admin): liste, upload, edition et suppression"
```

---

## Task 10: Page admin + nettoyage du mock

**Files:**

- Modify: `app/admin/(shell)/ressources/page.tsx`
- Delete: `features/admin/data/ressources.ts`
- Delete: `components/features/admin/new-ressource-dialog.tsx`

**Interfaces:**

- Consumes: `listLibrairieAdmin` (Task 1), `listLibrairieCategories`
  (`features/librairie/requests/list-librairie-categories.ts`, plan catalogue public — endpoint
  public, réutilisable tel quel côté admin), `LibrairieAdminClient` (Task 9).

- [ ] **Step 1: Reecrire la page**

```tsx
// app/admin/(shell)/ressources/page.tsx
import { listLibrairieAdmin } from "@/features/librairie-admin/requests/list-librairie-admin";
import { listLibrairieCategories } from "@/features/librairie/requests/list-librairie-categories";
import { LibrairieAdminClient } from "@/components/features/librairie-admin/librairie-admin-client";

export default async function RessourcesPage() {
  const [{ data: documents }, categories] = await Promise.all([
    listLibrairieAdmin(),
    listLibrairieCategories(),
  ]);

  return <LibrairieAdminClient initialDocuments={documents} categories={categories} />;
}
```

- [ ] **Step 2: Verifier qu'aucun autre fichier ne reference le mock**

Run: `grep -rn "features/admin/data/ressources\|new-ressource-dialog" app components features --include=*.ts --include=*.tsx`
Expected: aucune sortie.

- [ ] **Step 3: Supprimer le mock**

```bash
git rm features/admin/data/ressources.ts components/features/admin/new-ressource-dialog.tsx
```

- [ ] **Step 4: Verification complete**

Run: `pnpm run typecheck && pnpm run lint && pnpm run test`
Expected: PASS sur les trois commandes.

- [ ] **Step 5: Commit**

```bash
git add "app/admin/(shell)/ressources/page.tsx"
git commit -m "feat(librairie-admin): brancher la page admin sur l'API, supprimer le mock"
```

---

## Task 11: Vérification manuelle

Pas de fichier modifié — vérification humaine/chrome-devtools avant de considérer le plan terminé.

- [ ] **Step 1: Lancer le serveur de dev, se connecter en back-office**

Run: `pnpm run dev`, se connecter avec un compte ayant `canEdito` (tout rôle sauf Modérateur).

- [ ] **Step 2: Upload d'un document réel**

Sur `/admin/ressources`, cliquer « Ajouter un document », remplir titre + choisir un vrai fichier
PDF (+ une couverture optionnelle), valider. Vérifier que le document apparaît dans la liste sans
recharger la page, et que le message de progression change bien d'étape pendant l'envoi.

**Si `R2StorageService` n'est pas configuré côté backend** (variables d'env R2 absentes), l'appel à
`POST /librairie/upload-url` échoue en 503 — le signaler explicitement plutôt que de considérer la
vérification comme faite.

- [ ] **Step 3: Édition et suppression**

Modifier le titre/description/catégorie d'un document existant, vérifier la mise à jour immédiate
dans la liste. Supprimer un document, vérifier la modale de confirmation Radix puis sa disparition
de la liste.

- [ ] **Step 4: Vérifier le catalogue public**

Retourner sur `/ressources` (site public) et confirmer que le document uploadé y apparaît avec sa
vraie couverture et son lien de téléchargement fonctionnel.

- [ ] **Step 5: `convention-drift-check`**

Lancer l'agent `convention-drift-check` sur le diff complet avant de considérer le plan terminé.
