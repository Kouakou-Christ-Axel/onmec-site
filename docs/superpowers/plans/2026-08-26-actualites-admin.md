# Actualités admin (CRUD back-office) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Branch the admin dashboard's `/admin/actualites` screen onto the real `onmec_backend` `actualites` module — real list, real creation/edition (with a Tiptap-based body editor and image upload), publish/unpublish, and soft-delete — replacing the fully mocked `features/admin/data/articles.ts`.

**Architecture:** New `features/actualites-admin/` domain (types/schemas/requests/queries/mutations) mirrors the existing `features/admin-auth/` layering. The list page becomes an async Server Component that reads via `apiFetch()` directly (authenticated read, no TanStack Query, per the project's RSC-vs-client-fetch boundary). Creation/edition/publish/unpublish/delete are TanStack Query mutations that call new BFF routes under `app/api/admin/actualites/*`, which proxy to the backend using the session cookie. `lib/api-client.ts` and `lib/fetch-json.ts` gain small, additive capabilities (`FormData` passthrough, `PATCH`/`DELETE`/`GET` helpers) needed for image upload and the new verbs — nothing existing changes behavior.

**Tech Stack:** Next.js App Router on vinext 1.0.0-beta.8 (Cloudflare Workers target), React 19, TypeScript strict, Zod 4, TanStack Query 5, Tailwind CSS v4, Vitest, Tiptap 3.30.3 (`@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`, `@tiptap/core`).

**Spec:** `docs/superpowers/specs/2026-08-26-actualites-admin-design.md`

## Global Constraints

- Tiptap packages pinned to exact version `3.30.3` (`@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`, `@tiptap/core`) — never `"latest"`, matching the project's exact-pin rule.
- `StarterKit` in Tiptap v3 already bundles `Bold`, `Italic`, `Link`, `BulletList`, `OrderedList`, `Heading`, etc. — do not add `@tiptap/extension-link` or any other extension package separately.
- Never set a `Content-Type` header manually on a request whose body is a `FormData` — let `fetch` set `multipart/form-data; boundary=...` itself.
- The backend's `publier` endpoint (`PATCH /actualites/:id/publier`) is documented as idempotent and notification-safe (the backend only sends the "new article" notification on the _first_ publish, gated on `publishedAt === null`). This plan always calls create-or-update **then** unconditionally calls `publier` — do not branch on the article's current `statut` before calling it. This is a deliberate simplification over the spec's phrasing ("PATCH seul suffit" for an already-published edit) — strictly simpler, provably equally correct, ruling recorded here so no implementer re-litigates it.
- The `StatutActualite` values are `BROUILLON | PUBLIEE | ARCHIVEE` — never invent `"En relecture"` or `"Programmé"` anywhere in new code (the old mock's 4-state workflow is gone).
- Reuse `AdminRole` from `@/features/admin-auth/types/admin-auth` for `ActualiteAuthor.role` — do not redeclare a second role union type.
- No pagination UI this round: `listActualitesAdmin()` always requests `limit=50`. Do not build a pager.
- No tags UI, no inline category creation, no "restore archived article" action this round — out of scope per the spec.
- Kebab-case file names, ≤200 lines per file.
- `pnpm run typecheck` and `pnpm run lint` must be clean before every commit in this plan.
- Do not touch `app/(public)/actualites/**` or `features/actualites/**` (the public site) — separate round, out of scope.

---

## Task 1: Shared transport layer — `FormData` support and new HTTP verbs

**Files:**

- Modify: `lib/api-client.ts`
- Modify: `lib/fetch-json.ts`
- Test: `lib/api-client.test.ts`
- Test: `lib/fetch-json.test.ts`

**Interfaces:**

- Produces: `apiFetch<T>(path, options)` (existing signature, unchanged) now skips its automatic `Content-Type: application/json` when `options.body instanceof FormData`. New browser-safe helpers from `@/lib/fetch-json`: `getJson<T>(path): Promise<T>`, `postJson<T>(path, body): Promise<T>` (existing, behavior unchanged), `patchJson<T>(path, body): Promise<T>`, `deleteJson<T>(path): Promise<T>`, `sendFormData<T>(path, method: "POST" | "PATCH", formData: FormData): Promise<T>`.

Both files stay server/browser split exactly as today — `api-client.ts` remains server-only (depends on `next/headers`), `fetch-json.ts` remains browser-safe (no `next/headers` import).

- [ ] **Step 1: Write the failing tests for `lib/fetch-json.ts`**

```ts
// lib/fetch-json.test.ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { deleteJson, getJson, patchJson, postJson, sendFormData } from "@/lib/fetch-json";
import { ApiError } from "@/lib/api-error";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetch-json helpers", () => {
  it("getJson effectue un GET et retourne le JSON parse", async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ id: "1" }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await getJson<{ id: string }>("/api/x");
    expect(result).toEqual({ id: "1" });
    expect(fetchMock).toHaveBeenCalledWith("/api/x");
  });

  it("postJson envoie un Content-Type JSON et le corps serialise", async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      expect(headers.get("Content-Type")).toBe("application/json");
      expect(init?.body).toBe(JSON.stringify({ a: 1 }));
      return jsonResponse({ ok: true });
    });
    vi.stubGlobal("fetch", fetchMock);

    await postJson("/api/x", { a: 1 });
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("patchJson utilise la methode PATCH", async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      expect(init?.method).toBe("PATCH");
      return jsonResponse({ ok: true });
    });
    vi.stubGlobal("fetch", fetchMock);

    await patchJson("/api/x", { a: 1 });
  });

  it("deleteJson utilise la methode DELETE sans corps", async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      expect(init?.method).toBe("DELETE");
      expect(init?.body).toBeUndefined();
      return jsonResponse({ ok: true });
    });
    vi.stubGlobal("fetch", fetchMock);

    await deleteJson("/api/x");
  });

  it("sendFormData envoie le FormData tel quel, sans poser de Content-Type", async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      expect(init?.body).toBeInstanceOf(FormData);
      const headers = new Headers(init?.headers);
      expect(headers.has("Content-Type")).toBe(false);
      return jsonResponse({ ok: true });
    });
    vi.stubGlobal("fetch", fetchMock);

    const formData = new FormData();
    formData.set("a", "1");
    await sendFormData("/api/x", "POST", formData);
  });

  it("leve une ApiError quand la reponse n'est pas ok", async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ message: "Erreur" }, 400));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getJson("/api/x")).rejects.toBeInstanceOf(ApiError);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm run test -- fetch-json`
Expected: FAIL — `getJson`, `patchJson`, `deleteJson`, `sendFormData` are not exported yet.

- [ ] **Step 3: Rewrite `lib/fetch-json.ts`**

```ts
import { ApiError } from "@/lib/api-error";

/**
 * Transport browser-safe : appelle les route handlers de onmec-site lui-meme
 * (meme origine), jamais le backend directement. Zero dependance next/headers.
 */
export async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(path);
  return parseJsonResponse<T>(response);
}

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  return sendJson<T>(path, "POST", body);
}

export async function patchJson<T>(path: string, body: unknown): Promise<T> {
  return sendJson<T>(path, "PATCH", body);
}

export async function deleteJson<T>(path: string): Promise<T> {
  const response = await fetch(path, { method: "DELETE" });
  return parseJsonResponse<T>(response);
}

/** Ne jamais poser Content-Type ici : fetch doit fixer lui-meme le boundary multipart. */
export async function sendFormData<T>(
  path: string,
  method: "POST" | "PATCH",
  formData: FormData,
): Promise<T> {
  const response = await fetch(path, { method, body: formData });
  return parseJsonResponse<T>(response);
}

async function sendJson<T>(path: string, method: "POST" | "PATCH", body: unknown): Promise<T> {
  const response = await fetch(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseJsonResponse<T>(response);
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";
  const data: unknown = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new ApiError(response.status, data);
  }

  return data as T;
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `pnpm run test -- fetch-json`
Expected: PASS, 6 tests.

- [ ] **Step 5: Write the failing tests for `lib/api-client.ts`**

```ts
// lib/api-client.test.ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "@/lib/api-client";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("apiFetch", () => {
  it("laisse fetch poser son propre Content-Type pour un corps FormData", async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      expect(headers.has("Content-Type")).toBe(false);
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const formData = new FormData();
    formData.set("title", "Test");

    const result = await apiFetch("/actualites", { method: "POST", body: formData, auth: false });
    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("pose toujours Content-Type: application/json pour un corps chaine classique", async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      expect(headers.get("Content-Type")).toBe("application/json");
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    await apiFetch("/actualites", { method: "POST", body: JSON.stringify({ a: 1 }), auth: false });
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});
```

Both tests pass `auth: false` deliberately — it skips `readTokenCookie()`, which calls `cookies()` from `next/headers` and requires a real Next.js request context that a plain Vitest run does not provide. This is not a workaround for a bug; it is how this test isolates the header-setting logic under test from the unrelated cookie-reading logic.

- [ ] **Step 6: Run it to verify it fails**

Run: `pnpm run test -- api-client`
Expected: FAIL on the first test — the current code sets `Content-Type: application/json` even for a `FormData` body.

- [ ] **Step 7: Fix `lib/api-client.ts`**

In `apiFetch`, change:

```ts
const requestHeaders = new Headers(headers);
if (!requestHeaders.has("Content-Type") && init.body) {
  requestHeaders.set("Content-Type", "application/json");
}
```

to:

```ts
const requestHeaders = new Headers(headers);
if (!requestHeaders.has("Content-Type") && init.body && !(init.body instanceof FormData)) {
  requestHeaders.set("Content-Type", "application/json");
}
```

- [ ] **Step 8: Run it to verify it passes**

Run: `pnpm run test -- api-client`
Expected: PASS, 2 tests.

- [ ] **Step 9: Typecheck and lint**

Run: `pnpm run typecheck && pnpm run lint`
Expected: both clean.

- [ ] **Step 10: Commit**

```bash
git add lib/api-client.ts lib/api-client.test.ts lib/fetch-json.ts lib/fetch-json.test.ts
git commit -m "feat(actualites-admin): FormData passthrough and PATCH/DELETE/GET transport helpers

Needed for the actualites admin CRUD: image upload requires a raw
FormData body (no forced Content-Type), and publier/depublier/delete
need PATCH/DELETE verbs that lib/fetch-json.ts didn't expose yet."
```

---

## Task 2: `features/actualites-admin` — types and form schema

**Files:**

- Create: `features/actualites-admin/types/actualite-admin.ts`
- Create: `features/actualites-admin/schemas/actualite-form-schema.ts`
- Test: `features/actualites-admin/schemas/actualite-form-schema.test.ts`

**Interfaces:**

- Produces: types `StatutActualite`, `ActualiteAuthor`, `ActualiteTaxon`, `Categorie`, `ActualiteAdmin`, `ActualiteAdminListResponse` from `@/features/actualites-admin/types/actualite-admin`. Schema `actualiteFormSchema`/`ActualiteFormInput` from `@/features/actualites-admin/schemas/actualite-form-schema`.
- Consumes: `AdminRole` from `@/features/admin-auth/types/admin-auth` (existing).

- [ ] **Step 1: Create `features/actualites-admin/types/actualite-admin.ts`**

```ts
import type { AdminRole } from "@/features/admin-auth/types/admin-auth";

export type StatutActualite = "BROUILLON" | "PUBLIEE" | "ARCHIVEE";

export interface ActualiteAuthor {
  id: string;
  fullname: string;
  role: AdminRole;
}

export interface ActualiteTaxon {
  id: string;
  nom: string;
  slug: string;
}

export interface Categorie extends ActualiteTaxon {
  description: string | null;
  actualitesCount: number;
}

export interface ActualiteAdmin {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  imageUrl: string | null;
  statut: StatutActualite;
  publishedAt: string | null;
  author: ActualiteAuthor | null;
  categorie: ActualiteTaxon | null;
  tags: ActualiteTaxon[];
  likesCount: number;
  commentsCount: number;
  likedByMe: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ActualiteAdminListResponse {
  data: ActualiteAdmin[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

- [ ] **Step 2: Write the failing test for the form schema**

```ts
// features/actualites-admin/schemas/actualite-form-schema.test.ts
import { describe, expect, it } from "vitest";
import { actualiteFormSchema } from "@/features/actualites-admin/schemas/actualite-form-schema";

describe("actualiteFormSchema", () => {
  const valid = {
    title: "Un titre",
    excerpt: "Un chapô",
    content: "<p>Un corps</p>",
    date: "2026-08-26",
    categorieId: "20000000-0000-0000-0000-000000000001",
  };

  it("accepte des champs valides", () => {
    expect(actualiteFormSchema.safeParse(valid).success).toBe(true);
  });

  it("rejette un titre vide (espaces seuls)", () => {
    const result = actualiteFormSchema.safeParse({ ...valid, title: "   " });
    expect(result.success).toBe(false);
  });

  it("rejette un chapô manquant", () => {
    const result = actualiteFormSchema.safeParse({ ...valid, excerpt: "" });
    expect(result.success).toBe(false);
  });

  it("rejette un corps manquant", () => {
    const result = actualiteFormSchema.safeParse({ ...valid, content: "" });
    expect(result.success).toBe(false);
  });

  it("rejette une categorie manquante", () => {
    const result = actualiteFormSchema.safeParse({ ...valid, categorieId: "" });
    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm run test -- actualite-form-schema`
Expected: FAIL — module does not exist yet.

- [ ] **Step 4: Create `features/actualites-admin/schemas/actualite-form-schema.ts`**

```ts
import { z } from "zod";

export const actualiteFormSchema = z.object({
  title: z.string().trim().min(1, "Le titre est requis.").max(200),
  excerpt: z.string().trim().min(1, "Le chapô est requis.").max(500),
  content: z.string().trim().min(1, "Le corps de l'article est requis."),
  date: z.string().min(1, "La date est requise."),
  categorieId: z.string().min(1, "La catégorie est requise."),
});

export type ActualiteFormInput = z.infer<typeof actualiteFormSchema>;
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm run test -- actualite-form-schema`
Expected: PASS, 5 tests.

- [ ] **Step 6: Typecheck and lint**

Run: `pnpm run typecheck && pnpm run lint`
Expected: both clean.

- [ ] **Step 7: Commit**

```bash
git add features/actualites-admin/types features/actualites-admin/schemas
git commit -m "feat(actualites-admin): types mirroring the backend DTOs and a form validation schema"
```

---

## Task 3: `features/actualites-admin` — server requests and FormData builder

**Files:**

- Create: `features/actualites-admin/requests/list-actualites-admin.ts`
- Create: `features/actualites-admin/requests/list-categories.ts`
- Create: `features/actualites-admin/requests/create-actualite.ts`
- Create: `features/actualites-admin/requests/update-actualite.ts`
- Create: `features/actualites-admin/requests/publier-actualite.ts`
- Create: `features/actualites-admin/requests/depublier-actualite.ts`
- Create: `features/actualites-admin/requests/delete-actualite.ts`
- Create: `features/actualites-admin/lib/build-actualite-form-data.ts`
- Test: `features/actualites-admin/lib/build-actualite-form-data.test.ts`

**Interfaces:**

- Consumes: `apiFetch<T>(path, options)` from `@/lib/api-client` (Task 1). `ActualiteAdmin`, `ActualiteAdminListResponse`, `Categorie` from `@/features/actualites-admin/types/actualite-admin` (Task 2).
- Produces: `listActualitesAdmin(): Promise<ActualiteAdminListResponse>`, `listCategoriesAdmin(): Promise<Categorie[]>`, `createActualiteAdmin(formData: FormData): Promise<ActualiteAdmin>`, `updateActualiteAdmin(id: string, formData: FormData): Promise<ActualiteAdmin>`, `publierActualiteAdmin(id: string): Promise<ActualiteAdmin>`, `depublierActualiteAdmin(id: string): Promise<ActualiteAdmin>`, `deleteActualiteAdmin(id: string): Promise<ActualiteAdmin>` — all server-only. `buildActualiteFormData(fields, categorieId, image): FormData` — pure, no server dependency.

All of these are server-only files (transitively depend on `next/headers` via `apiFetch`) except `build-actualite-form-data.ts`, which is pure and gets called from a client component in Task 7.

- [ ] **Step 1: Create `features/actualites-admin/requests/list-actualites-admin.ts`**

```ts
import { apiFetch } from "@/lib/api-client";
import type { ActualiteAdminListResponse } from "@/features/actualites-admin/types/actualite-admin";

export function listActualitesAdmin(): Promise<ActualiteAdminListResponse> {
  return apiFetch<ActualiteAdminListResponse>("/actualites/admin?limit=50");
}
```

- [ ] **Step 2: Create `features/actualites-admin/requests/list-categories.ts`**

```ts
import { apiFetch } from "@/lib/api-client";
import type { Categorie } from "@/features/actualites-admin/types/actualite-admin";

export function listCategoriesAdmin(): Promise<Categorie[]> {
  return apiFetch<Categorie[]>("/categorie-actualite");
}
```

- [ ] **Step 3: Create `features/actualites-admin/requests/create-actualite.ts`**

```ts
import { apiFetch } from "@/lib/api-client";
import type { ActualiteAdmin } from "@/features/actualites-admin/types/actualite-admin";

export function createActualiteAdmin(formData: FormData): Promise<ActualiteAdmin> {
  return apiFetch<ActualiteAdmin>("/actualites", {
    method: "POST",
    body: formData,
  });
}
```

- [ ] **Step 4: Create `features/actualites-admin/requests/update-actualite.ts`**

```ts
import { apiFetch } from "@/lib/api-client";
import type { ActualiteAdmin } from "@/features/actualites-admin/types/actualite-admin";

export function updateActualiteAdmin(id: string, formData: FormData): Promise<ActualiteAdmin> {
  return apiFetch<ActualiteAdmin>(`/actualites/${id}`, {
    method: "PATCH",
    body: formData,
  });
}
```

- [ ] **Step 5: Create `features/actualites-admin/requests/publier-actualite.ts`**

```ts
import { apiFetch } from "@/lib/api-client";
import type { ActualiteAdmin } from "@/features/actualites-admin/types/actualite-admin";

export function publierActualiteAdmin(id: string): Promise<ActualiteAdmin> {
  return apiFetch<ActualiteAdmin>(`/actualites/${id}/publier`, { method: "PATCH" });
}
```

- [ ] **Step 6: Create `features/actualites-admin/requests/depublier-actualite.ts`**

```ts
import { apiFetch } from "@/lib/api-client";
import type { ActualiteAdmin } from "@/features/actualites-admin/types/actualite-admin";

export function depublierActualiteAdmin(id: string): Promise<ActualiteAdmin> {
  return apiFetch<ActualiteAdmin>(`/actualites/${id}/depublier`, { method: "PATCH" });
}
```

- [ ] **Step 7: Create `features/actualites-admin/requests/delete-actualite.ts`**

```ts
import { apiFetch } from "@/lib/api-client";
import type { ActualiteAdmin } from "@/features/actualites-admin/types/actualite-admin";

export function deleteActualiteAdmin(id: string): Promise<ActualiteAdmin> {
  return apiFetch<ActualiteAdmin>(`/actualites/${id}`, { method: "DELETE" });
}
```

- [ ] **Step 8: Write the failing test for the FormData builder**

```ts
// features/actualites-admin/lib/build-actualite-form-data.test.ts
import { describe, expect, it } from "vitest";
import { buildActualiteFormData } from "@/features/actualites-admin/lib/build-actualite-form-data";

describe("buildActualiteFormData", () => {
  it("inclut tous les champs texte et la categorie", () => {
    const formData = buildActualiteFormData(
      { title: "Titre", excerpt: "Chapo", content: "<p>Corps</p>", date: "2026-08-26" },
      "cat-1",
      null,
    );
    expect(formData.get("title")).toBe("Titre");
    expect(formData.get("excerpt")).toBe("Chapo");
    expect(formData.get("content")).toBe("<p>Corps</p>");
    expect(formData.get("date")).toBe("2026-08-26");
    expect(formData.get("categorieId")).toBe("cat-1");
    expect(formData.has("image")).toBe(false);
  });

  it("inclut l'image seulement si fournie", () => {
    const file = new File(["contenu"], "photo.jpg", { type: "image/jpeg" });
    const formData = buildActualiteFormData(
      { title: "T", excerpt: "E", content: "C", date: "2026-08-26" },
      "cat-1",
      file,
    );
    expect(formData.get("image")).toBe(file);
  });
});
```

- [ ] **Step 9: Run it to verify it fails**

Run: `pnpm run test -- build-actualite-form-data`
Expected: FAIL — module does not exist yet.

- [ ] **Step 10: Create `features/actualites-admin/lib/build-actualite-form-data.ts`**

```ts
export interface ActualiteFormFields {
  title: string;
  excerpt: string;
  content: string;
  date: string;
}

export function buildActualiteFormData(
  fields: ActualiteFormFields,
  categorieId: string,
  image: File | null,
): FormData {
  const formData = new FormData();
  formData.set("title", fields.title);
  formData.set("excerpt", fields.excerpt);
  formData.set("content", fields.content);
  formData.set("date", fields.date);
  formData.set("categorieId", categorieId);
  if (image) {
    formData.set("image", image);
  }
  return formData;
}
```

- [ ] **Step 11: Run it to verify it passes**

Run: `pnpm run test -- build-actualite-form-data`
Expected: PASS, 2 tests.

- [ ] **Step 12: Typecheck and lint**

Run: `pnpm run typecheck && pnpm run lint`
Expected: both clean.

- [ ] **Step 13: Commit**

```bash
git add features/actualites-admin/requests features/actualites-admin/lib
git commit -m "feat(actualites-admin): server requests for list/create/update/publier/depublier/delete"
```

---

## Task 4: `features/actualites-admin` — client query and mutations

**Files:**

- Create: `features/actualites-admin/queries/use-categories.ts`
- Create: `features/actualites-admin/mutations/use-create-actualite.ts`
- Create: `features/actualites-admin/mutations/use-update-actualite.ts`
- Create: `features/actualites-admin/mutations/use-publier-actualite.ts`
- Create: `features/actualites-admin/mutations/use-depublier-actualite.ts`
- Create: `features/actualites-admin/mutations/use-delete-actualite.ts`

**Interfaces:**

- Consumes: `getJson`, `patchJson`, `deleteJson`, `sendFormData` from `@/lib/fetch-json` (Task 1). `ActualiteAdmin`, `Categorie` from `@/features/actualites-admin/types/actualite-admin` (Task 2).
- Produces: `useCategories()` → `useQuery` whose `.data` resolves to `Categorie[]`. `useCreateActualite()` → `mutate(formData: FormData)` / `mutateAsync(formData: FormData)` resolving to `ActualiteAdmin`. `useUpdateActualite()` → `mutateAsync({id, formData})` resolving to `ActualiteAdmin`. `usePublierActualite()`, `useDepublierActualite()` → `mutateAsync(id: string)` resolving to `ActualiteAdmin`. `useDeleteActualite()` → `mutateAsync(id: string)` resolving to `ActualiteAdmin`.

These call the BFF routes built in Task 5. The paths are just strings, so this task's typecheck passes without the routes existing yet — same pattern as the auth-admin plan's Task 4/5 split.

- [ ] **Step 1: Create `features/actualites-admin/queries/use-categories.ts`**

```ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { getJson } from "@/lib/fetch-json";
import type { Categorie } from "@/features/actualites-admin/types/actualite-admin";

export function useCategories() {
  return useQuery({
    queryKey: ["actualites-admin-categories"],
    queryFn: () => getJson<Categorie[]>("/api/admin/actualites/categories"),
  });
}
```

- [ ] **Step 2: Create `features/actualites-admin/mutations/use-create-actualite.ts`**

```ts
"use client";

import { useMutation } from "@tanstack/react-query";
import { sendFormData } from "@/lib/fetch-json";
import type { ActualiteAdmin } from "@/features/actualites-admin/types/actualite-admin";

export function useCreateActualite() {
  return useMutation({
    mutationFn: (formData: FormData) =>
      sendFormData<ActualiteAdmin>("/api/admin/actualites", "POST", formData),
  });
}
```

- [ ] **Step 3: Create `features/actualites-admin/mutations/use-update-actualite.ts`**

```ts
"use client";

import { useMutation } from "@tanstack/react-query";
import { sendFormData } from "@/lib/fetch-json";
import type { ActualiteAdmin } from "@/features/actualites-admin/types/actualite-admin";

interface UpdateActualiteVariables {
  id: string;
  formData: FormData;
}

export function useUpdateActualite() {
  return useMutation({
    mutationFn: ({ id, formData }: UpdateActualiteVariables) =>
      sendFormData<ActualiteAdmin>(`/api/admin/actualites/${id}`, "PATCH", formData),
  });
}
```

- [ ] **Step 4: Create `features/actualites-admin/mutations/use-publier-actualite.ts`**

```ts
"use client";

import { useMutation } from "@tanstack/react-query";
import { patchJson } from "@/lib/fetch-json";
import type { ActualiteAdmin } from "@/features/actualites-admin/types/actualite-admin";

export function usePublierActualite() {
  return useMutation({
    mutationFn: (id: string) =>
      patchJson<ActualiteAdmin>(`/api/admin/actualites/${id}/publier`, {}),
  });
}
```

- [ ] **Step 5: Create `features/actualites-admin/mutations/use-depublier-actualite.ts`**

```ts
"use client";

import { useMutation } from "@tanstack/react-query";
import { patchJson } from "@/lib/fetch-json";
import type { ActualiteAdmin } from "@/features/actualites-admin/types/actualite-admin";

export function useDepublierActualite() {
  return useMutation({
    mutationFn: (id: string) =>
      patchJson<ActualiteAdmin>(`/api/admin/actualites/${id}/depublier`, {}),
  });
}
```

- [ ] **Step 6: Create `features/actualites-admin/mutations/use-delete-actualite.ts`**

```ts
"use client";

import { useMutation } from "@tanstack/react-query";
import { deleteJson } from "@/lib/fetch-json";
import type { ActualiteAdmin } from "@/features/actualites-admin/types/actualite-admin";

export function useDeleteActualite() {
  return useMutation({
    mutationFn: (id: string) => deleteJson<ActualiteAdmin>(`/api/admin/actualites/${id}`),
  });
}
```

- [ ] **Step 7: Typecheck and lint**

Run: `pnpm run typecheck && pnpm run lint`
Expected: both clean.

- [ ] **Step 8: Commit**

```bash
git add features/actualites-admin/queries features/actualites-admin/mutations
git commit -m "feat(actualites-admin): TanStack Query hooks for categories, CRUD and publication"
```

---

## Task 5: BFF routes `app/api/admin/actualites/*`

**Files:**

- Create: `app/api/admin/actualites/route.ts`
- Create: `app/api/admin/actualites/categories/route.ts`
- Create: `app/api/admin/actualites/[id]/route.ts`
- Create: `app/api/admin/actualites/[id]/publier/route.ts`
- Create: `app/api/admin/actualites/[id]/depublier/route.ts`

**Interfaces:**

- Consumes: `createActualiteAdmin`, `updateActualiteAdmin`, `publierActualiteAdmin`, `depublierActualiteAdmin`, `deleteActualiteAdmin`, `listCategoriesAdmin` (Task 3). `toErrorResponse` from `@/lib/to-error-response` (existing, from the auth-admin plan).
- Produces: `POST /api/admin/actualites` (multipart body → 201 `ActualiteAdmin`), `GET /api/admin/actualites/categories` (→ 200 `Categorie[]`), `PATCH /api/admin/actualites/:id` (multipart body → 200 `ActualiteAdmin`), `DELETE /api/admin/actualites/:id` (→ 200 `ActualiteAdmin`), `PATCH /api/admin/actualites/:id/publier` (→ 200 `ActualiteAdmin`), `PATCH /api/admin/actualites/:id/depublier` (→ 200 `ActualiteAdmin`).

These routes are pure relays: read the incoming body (`request.formData()` where relevant), forward it, translate errors. No Zod validation here — the client-side form schema (Task 2) validates before a `FormData` is ever built, and the backend's own `class-validator` DTOs are the second, authoritative gate. Re-validating the same rules a third time here would be pure duplication.

- [ ] **Step 1: Create `app/api/admin/actualites/route.ts`**

```ts
import { NextResponse } from "next/server";
import { createActualiteAdmin } from "@/features/actualites-admin/requests/create-actualite";
import { toErrorResponse } from "@/lib/to-error-response";

export async function POST(request: Request) {
  const formData = await request.formData();
  try {
    const actualite = await createActualiteAdmin(formData);
    return NextResponse.json(actualite, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
```

- [ ] **Step 2: Create `app/api/admin/actualites/categories/route.ts`**

```ts
import { NextResponse } from "next/server";
import { listCategoriesAdmin } from "@/features/actualites-admin/requests/list-categories";
import { toErrorResponse } from "@/lib/to-error-response";

export async function GET() {
  try {
    const categories = await listCategoriesAdmin();
    return NextResponse.json(categories);
  } catch (error) {
    return toErrorResponse(error);
  }
}
```

- [ ] **Step 3: Create `app/api/admin/actualites/[id]/route.ts`**

```ts
import { NextResponse } from "next/server";
import { updateActualiteAdmin } from "@/features/actualites-admin/requests/update-actualite";
import { deleteActualiteAdmin } from "@/features/actualites-admin/requests/delete-actualite";
import { toErrorResponse } from "@/lib/to-error-response";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const formData = await request.formData();
  try {
    const actualite = await updateActualiteAdmin(id, formData);
    return NextResponse.json(actualite);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const actualite = await deleteActualiteAdmin(id);
    return NextResponse.json(actualite);
  } catch (error) {
    return toErrorResponse(error);
  }
}
```

- [ ] **Step 4: Create `app/api/admin/actualites/[id]/publier/route.ts`**

```ts
import { NextResponse } from "next/server";
import { publierActualiteAdmin } from "@/features/actualites-admin/requests/publier-actualite";
import { toErrorResponse } from "@/lib/to-error-response";

export async function PATCH(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const actualite = await publierActualiteAdmin(id);
    return NextResponse.json(actualite);
  } catch (error) {
    return toErrorResponse(error);
  }
}
```

- [ ] **Step 5: Create `app/api/admin/actualites/[id]/depublier/route.ts`**

```ts
import { NextResponse } from "next/server";
import { depublierActualiteAdmin } from "@/features/actualites-admin/requests/depublier-actualite";
import { toErrorResponse } from "@/lib/to-error-response";

export async function PATCH(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const actualite = await depublierActualiteAdmin(id);
    return NextResponse.json(actualite);
  } catch (error) {
    return toErrorResponse(error);
  }
}
```

- [ ] **Step 6: Typecheck and lint**

Run: `pnpm run typecheck && pnpm run lint`
Expected: both clean.

- [ ] **Step 7: Manual smoke test — categories and list against the local backend**

Ensure `onmec_backend` is running on `localhost:8081`, the dev server is running (`pnpm run dev`), and you have a valid `onmec_token` cookie for an editorial account (log in via `/admin/connexion` in a browser first, or reuse a cookie from the auth-admin plan's smoke tests). Then run:

```bash
curl -s http://localhost:3000/api/admin/actualites/categories
```

Expected: `200` with a JSON array (possibly empty if no categories are seeded yet — that's fine, it proves the relay works).

- [ ] **Step 8: Commit**

```bash
git add app/api/admin/actualites
git commit -m "feat(actualites-admin): BFF routes proxying CRUD and publication to onmec_backend"
```

---

## Task 6: Tiptap body editor

**Files:**

- Create: `components/features/admin/article-body-editor.tsx`
- Modify: `package.json` (new dependencies)

**Interfaces:**

- Produces: `ArticleBodyEditor` component with props `{ initialContent?: string; onChange: (html: string, text: string) => void }`. `onChange` fires once on mount (via Tiptap's `onCreate`) and again on every edit (via `onUpdate`), so a caller always has an accurate word count from the very first render — including when `initialContent` is pre-filled for an edit.

- [ ] **Step 1: Install Tiptap, pinned to the exact version already resolved**

```bash
pnpm add @tiptap/react@3.30.3 @tiptap/pm@3.30.3 @tiptap/starter-kit@3.30.3 @tiptap/core@3.30.3
```

- [ ] **Step 2: Create `components/features/admin/article-body-editor.tsx`**

```tsx
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, Heading2, List, ListOrdered, Link as LinkIcon } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";

interface ArticleBodyEditorProps {
  initialContent?: string;
  onChange: (html: string, text: string) => void;
}

export function ArticleBodyEditor({ initialContent = "", onChange }: ArticleBodyEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
    immediatelyRender: false,
    onCreate: ({ editor }) => onChange(editor.getHTML(), editor.getText()),
    onUpdate: ({ editor }) => onChange(editor.getHTML(), editor.getText()),
    editorProps: {
      attributes: {
        class: "min-h-[44vh] font-sans text-lg leading-relaxed text-[#2b3646] outline-none",
      },
    },
  });

  if (!editor) return null;

  function setLink() {
    const url = window.prompt("URL du lien");
    if (url) {
      editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    } else {
      editor?.chain().focus().unsetLink().run();
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-1 border-b border-border-subtle pb-2.5">
        <IconButton
          icon={Bold}
          label="Gras"
          size="sm"
          variant={editor.isActive("bold") ? "outline" : "ghost"}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <IconButton
          icon={Italic}
          label="Italique"
          size="sm"
          variant={editor.isActive("italic") ? "outline" : "ghost"}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <IconButton
          icon={Heading2}
          label="Titre de section"
          size="sm"
          variant={editor.isActive("heading", { level: 2 }) ? "outline" : "ghost"}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        />
        <IconButton
          icon={List}
          label="Liste à puces"
          size="sm"
          variant={editor.isActive("bulletList") ? "outline" : "ghost"}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <IconButton
          icon={ListOrdered}
          label="Liste numérotée"
          size="sm"
          variant={editor.isActive("orderedList") ? "outline" : "ghost"}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <IconButton
          icon={LinkIcon}
          label="Lien"
          size="sm"
          variant={editor.isActive("link") ? "outline" : "ghost"}
          onClick={setLink}
        />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
```

- [ ] **Step 3: Typecheck and lint**

Run: `pnpm run typecheck && pnpm run lint`
Expected: both clean.

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml components/features/admin/article-body-editor.tsx
git commit -m "feat(actualites-admin): Tiptap-based rich text editor for the article body"
```

---

## Task 7: Wire the editor, publish popover, and the real list page

This task is deliberately one unit, not two: rewriting `ArticleEditor`'s prop contract
(`onPublished` → `onSaved`, adding `existing`) breaks its only caller, the list page, until
that caller is rewritten too. Splitting these into separate tasks would leave a commit where
`pnpm run typecheck` fails — which the Global Constraints forbid. Doing both in one task keeps
every commit green, per that constraint.

**Files:**

- Modify: `components/features/admin/article-editor.tsx`
- Modify: `components/features/admin/publish-popover.tsx`
- Create: `components/features/admin/actualites-admin-client.tsx`
- Modify: `app/admin/(shell)/actualites/page.tsx`
- Delete: `features/admin/data/articles.ts`

**Interfaces:**

- Consumes: `ArticleBodyEditor` (Task 6). `useCategories` (Task 4). `useCreateActualite`, `useUpdateActualite`, `usePublierActualite`, `useDepublierActualite`, `useDeleteActualite` (Task 4). `buildActualiteFormData` (Task 3). `actualiteFormSchema` (Task 2). `listActualitesAdmin` (Task 3). `useAdminShell` from `@/components/features/admin/admin-shell-context` (existing, exposes `canEdito`). `ActualiteAdmin`, `StatutActualite` (Task 2).
- Produces: `ArticleEditor` with props `{ existing: ActualiteAdmin | null; onClose: () => void; onSaved: (actualite: ActualiteAdmin) => void }`. `PublishPopover` with props `{ existing: ActualiteAdmin | null; fields: { title: string; excerpt: string; content: string; date: string }; image: File | null; onClose: () => void; onPublished: (actualite: ActualiteAdmin) => void }`. `ActualitesAdminClient` with props `{ initialActualites: ActualiteAdmin[] }` — the interactive table + editor host for `/admin/actualites`.

`PublishPopover` composes two mutations sequentially (create-or-update, then publier) behind
one button. Rather than reading `.error` off either individual mutation (ambiguous — which one
failed?), it keeps one local `error` string covering the whole composed operation, cleared at
the start of each attempt. This is a deliberate, narrower substitute for the
`mutation.reset()`-on-retry pattern used in `connexion-view.tsx` / `changer-mot-de-passe-view.tsx`
(both of which only ever have one mutation in flight) — not an oversight.

- [ ] **Step 1: Rewrite `components/features/admin/publish-popover.tsx`**

```tsx
"use client";

import { useState } from "react";
import { Select } from "@/components/ui/select";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { useCategories } from "@/features/actualites-admin/queries/use-categories";
import { useCreateActualite } from "@/features/actualites-admin/mutations/use-create-actualite";
import { useUpdateActualite } from "@/features/actualites-admin/mutations/use-update-actualite";
import { usePublierActualite } from "@/features/actualites-admin/mutations/use-publier-actualite";
import { buildActualiteFormData } from "@/features/actualites-admin/lib/build-actualite-form-data";
import { actualiteFormSchema } from "@/features/actualites-admin/schemas/actualite-form-schema";
import type { ActualiteAdmin } from "@/features/actualites-admin/types/actualite-admin";

interface PublishPopoverProps {
  existing: ActualiteAdmin | null;
  fields: { title: string; excerpt: string; content: string; date: string };
  image: File | null;
  onClose: () => void;
  onPublished: (actualite: ActualiteAdmin) => void;
}

export function PublishPopover({
  existing,
  fields,
  image,
  onClose,
  onPublished,
}: PublishPopoverProps) {
  const categoriesQuery = useCategories();
  const createMutation = useCreateActualite();
  const updateMutation = useUpdateActualite();
  const publierMutation = usePublierActualite();

  const [categorieId, setCategorieId] = useState(existing?.categorie?.id ?? "");
  const [error, setError] = useState<string | null>(null);

  const categories = categoriesQuery.data ?? [];
  const submitting =
    createMutation.isPending || updateMutation.isPending || publierMutation.isPending;

  async function handlePublish() {
    const parsed = actualiteFormSchema.safeParse({ ...fields, categorieId });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Formulaire invalide.");
      return;
    }
    setError(null);
    try {
      const formData = buildActualiteFormData(fields, categorieId, image);
      const saved = existing
        ? await updateMutation.mutateAsync({ id: existing.id, formData })
        : await createMutation.mutateAsync(formData);
      const published = await publierMutation.mutateAsync(saved.id);
      onPublished(published);
    } catch {
      setError("Une erreur est survenue. Réessayez.");
    }
  }

  return (
    <div className="absolute inset-0 z-10">
      <button
        type="button"
        aria-label="Fermer"
        onClick={onClose}
        className="absolute inset-0 bg-blue-900/28"
      />
      <div className="absolute top-18.5 right-4 flex w-[min(360px,92vw)] flex-col gap-4 rounded-[10px] border border-border-strong bg-surface-card p-5 shadow-overlay md:right-8">
        <span className="text-[0.6875rem] font-semibold tracking-[0.13em] text-muted-foreground uppercase">
          Publication
        </span>
        {error ? <Alert tone="danger">{error}</Alert> : null}
        <Field label="Rubrique">
          <Select
            value={categorieId}
            onChange={(event) => setCategorieId(event.target.value)}
            disabled={categoriesQuery.isLoading}
          >
            <option value="">Sélectionner...</option>
            {categories.map((categorie) => (
              <option key={categorie.id} value={categorie.id}>
                {categorie.nom}
              </option>
            ))}
          </Select>
        </Field>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Les membres de l'app seront notifiés automatiquement à la publication.
        </p>
        <Button
          variant="primary"
          full
          disabled={submitting || !categorieId}
          onClick={handlePublish}
        >
          {submitting ? "Publication..." : "Publier l'article"}
        </Button>
        <span className="text-xs leading-relaxed text-muted-foreground">
          L'article part sur la page Actualités du site. Vous pourrez le dépublier à tout moment.
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Rewrite `components/features/admin/article-editor.tsx`**

```tsx
"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { Button } from "@/components/ui/button";
import { ArticleBodyEditor } from "@/components/features/admin/article-body-editor";
import { PublishPopover } from "@/components/features/admin/publish-popover";
import type { ActualiteAdmin } from "@/features/actualites-admin/types/actualite-admin";

interface ArticleEditorProps {
  existing: ActualiteAdmin | null;
  onClose: () => void;
  onSaved: (actualite: ActualiteAdmin) => void;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ArticleEditor({ existing, onClose, onSaved }: ArticleEditorProps) {
  const [titre, setTitre] = useState(existing?.title ?? "");
  const [chapo, setChapo] = useState(existing?.excerpt ?? "");
  const [date, setDate] = useState(existing?.date.slice(0, 10) ?? todayIso());
  const [corps, setCorps] = useState(existing?.content ?? "");
  const [motCount, setMotCount] = useState(0);
  const [image, setImage] = useState<File | null>(null);
  const [showPublish, setShowPublish] = useState(false);

  return (
    <div className="fixed inset-0 z-95 flex flex-col bg-surface-page">
      <div className="flex h-16 flex-none items-center gap-3.5 border-b border-border-subtle bg-[#faf8f5]/94 px-4 backdrop-blur-md md:px-8">
        <IconButton icon={ArrowLeft} label="Retour aux actualités" onClick={onClose} />
        <span className="text-[0.8125rem] font-semibold whitespace-nowrap text-ink">Rédaction</span>
        <span className="ml-auto flex items-center gap-3">
          <span className="text-xs whitespace-nowrap text-muted-foreground tabular-nums">
            {motCount} mots
          </span>
          <Button
            variant="primary"
            size="sm"
            disabled={!titre.trim()}
            onClick={() => setShowPublish(true)}
          >
            Publier
          </Button>
        </span>
      </div>

      <div className="relative flex-1 overflow-auto px-6 py-14 pb-30">
        <div className="mx-auto flex max-w-180 flex-col gap-3.5">
          <span className="text-[0.6875rem] font-semibold tracking-[0.13em] text-orange-700 uppercase">
            Terrain
          </span>
          <input
            value={titre}
            onChange={(event) => setTitre(event.target.value)}
            placeholder="Titre"
            aria-label="Titre de l'article"
            className="border-0 bg-transparent p-0 font-sans text-[clamp(2rem,4vw,2.75rem)] leading-[1.05] font-semibold tracking-[-0.032em] text-ink outline-none placeholder:text-n-300"
          />
          <input
            value={chapo}
            onChange={(event) => setChapo(event.target.value)}
            placeholder="Chapô — une à deux phrases, 30 mots maximum"
            aria-label="Chapô"
            className="border-0 bg-transparent p-0 font-serif text-[clamp(1.125rem,2vw,1.5rem)] leading-snug text-muted-foreground italic outline-none placeholder:text-n-300"
          />
          <div className="flex flex-wrap items-center gap-4">
            <label
              htmlFor="article-date"
              className="text-[0.8125rem] font-medium text-muted-foreground"
            >
              Date
              <input
                id="article-date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="ml-2 rounded-control border border-border-subtle bg-white px-2.5 py-1.5 text-sm text-ink outline-none focus:border-blue-500"
              />
            </label>
            <label
              htmlFor="article-image"
              className="text-[0.8125rem] font-medium text-muted-foreground"
            >
              Image de couverture
              <input
                id="article-image"
                type="file"
                accept="image/*"
                onChange={(event) => setImage(event.target.files?.[0] ?? null)}
                className="ml-2 text-[0.8125rem] text-muted-foreground"
              />
            </label>
          </div>
          <ArticleBodyEditor
            initialContent={corps}
            onChange={(html, text) => {
              setCorps(html);
              setMotCount(text.trim() ? text.trim().split(/\s+/).length : 0);
            }}
          />
        </div>

        {showPublish ? (
          <PublishPopover
            existing={existing}
            fields={{ title: titre, excerpt: chapo, content: corps, date }}
            image={image}
            onClose={() => setShowPublish(false)}
            onPublished={(actualite) => {
              setShowPublish(false);
              onSaved(actualite);
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
```

Note: the previous mock's "Brouillon enregistré automatiquement" label and non-functional "Aperçu" button are removed — neither reflects real behavior (there is no autosave, and preview was never implemented), and shipping fake status text to real editorial staff would be actively misleading.

- [ ] **Step 3: Confirm `features/admin/data/articles.ts` has no importers left besides the two files this task rewrites**

Run: `grep -rn "features/admin/data/articles" app components features --include="*.tsx" --include="*.ts"`

Expected: only `app/admin/(shell)/actualites/page.tsx` (rewritten in Step 5 below) and, if it still shows up, `components/features/admin/publish-popover.tsx` (already rewritten in Step 1 above and no longer importing it — if it still does, that rewrite is incomplete, stop and fix it first). Do not delete the file in Step 6 if anything else references it — stop and investigate instead.

- [ ] **Step 4: Create `components/features/admin/actualites-admin-client.tsx`**

```tsx
"use client";

import { useState } from "react";
import { PenLine, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Tag } from "@/components/ui/tag";
import { ArticleEditor } from "@/components/features/admin/article-editor";
import { useAdminShell } from "@/components/features/admin/admin-shell-context";
import { usePublierActualite } from "@/features/actualites-admin/mutations/use-publier-actualite";
import { useDepublierActualite } from "@/features/actualites-admin/mutations/use-depublier-actualite";
import { useDeleteActualite } from "@/features/actualites-admin/mutations/use-delete-actualite";
import type {
  ActualiteAdmin,
  StatutActualite,
} from "@/features/actualites-admin/types/actualite-admin";

const STATUT_LABELS: Record<StatutActualite, string> = {
  BROUILLON: "Brouillon",
  PUBLIEE: "Publiée",
  ARCHIVEE: "Archivée",
};

const STATUT_TONES: Record<StatutActualite, "orange" | "blue" | "neutral"> = {
  BROUILLON: "orange",
  PUBLIEE: "blue",
  ARCHIVEE: "neutral",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR");
}

interface ActualitesAdminClientProps {
  initialActualites: ActualiteAdmin[];
}

export function ActualitesAdminClient({ initialActualites }: ActualitesAdminClientProps) {
  const shell = useAdminShell();
  const [actualites, setActualites] = useState(initialActualites);
  const [editing, setEditing] = useState<ActualiteAdmin | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  const publier = usePublierActualite();
  const depublier = useDepublierActualite();
  const removeMutation = useDeleteActualite();

  function openCreate() {
    setEditing(null);
    setShowEditor(true);
  }

  function openEdit(actualite: ActualiteAdmin) {
    setEditing(actualite);
    setShowEditor(true);
  }

  function handleSaved(actualite: ActualiteAdmin) {
    setActualites((prev) => {
      const exists = prev.some((item) => item.id === actualite.id);
      return exists
        ? prev.map((item) => (item.id === actualite.id ? actualite : item))
        : [actualite, ...prev];
    });
    setShowEditor(false);
  }

  function handleTogglePublication(actualite: ActualiteAdmin) {
    const mutation = actualite.statut === "PUBLIEE" ? depublier : publier;
    mutation.mutate(actualite.id, {
      onSuccess: (updated) => {
        setActualites((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      },
    });
  }

  function handleDelete(actualite: ActualiteAdmin) {
    if (!window.confirm(`Supprimer « ${actualite.title} » ?`)) return;
    removeMutation.mutate(actualite.id, {
      onSuccess: () => {
        setActualites((prev) => prev.filter((item) => item.id !== actualite.id));
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
            Actualités et blog
          </h1>
          <p className="text-[0.9375rem] text-muted-foreground">
            Brouillon → Publié · rédaction par l'équipe communication
          </p>
        </div>
        {shell.canEdito ? (
          <Button variant="primary" icon={PenLine} onClick={openCreate}>
            Nouvel article
          </Button>
        ) : null}
      </div>

      <div className="overflow-x-auto rounded-lg border border-border-subtle bg-surface-card">
        <div className="min-w-[860px]">
          <div className="grid grid-cols-[minmax(0,1fr)_120px_156px_116px_140px_150px] gap-3.5 border-b border-border-subtle bg-n-50 px-4 py-2.5 text-[0.6875rem] font-semibold tracking-[0.09em] text-muted-foreground uppercase">
            <span>Titre</span>
            <span>Statut</span>
            <span>Auteur</span>
            <span>Date</span>
            <span>Engagement</span>
            <span className="text-right">Actions</span>
          </div>
          {actualites.map((actualite) => (
            <div
              key={actualite.id}
              className="grid grid-cols-[minmax(0,1fr)_120px_156px_116px_140px_150px] items-center gap-3.5 border-b border-border-subtle px-4 py-3 text-sm last:border-b-0"
            >
              <span className="font-medium text-ink">{actualite.title}</span>
              <span>
                <Tag tone={STATUT_TONES[actualite.statut]}>{STATUT_LABELS[actualite.statut]}</Tag>
              </span>
              <span className="text-[0.8125rem] text-muted-foreground">
                {actualite.author?.fullname ?? "—"}
              </span>
              <span className="text-[0.8125rem] text-muted-foreground tabular-nums">
                {formatDate(actualite.date)}
              </span>
              <span className="text-[0.8125rem] text-muted-foreground tabular-nums">
                {actualite.likesCount} ❤ · {actualite.commentsCount} 💬
              </span>
              <span className="flex justify-end gap-1.5">
                {shell.canEdito ? (
                  <>
                    <IconButton
                      icon={Pencil}
                      label="Modifier"
                      size="sm"
                      onClick={() => openEdit(actualite)}
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleTogglePublication(actualite)}
                    >
                      {actualite.statut === "PUBLIEE" ? "Dépublier" : "Publier"}
                    </Button>
                    <IconButton
                      icon={Trash2}
                      label="Supprimer"
                      size="sm"
                      onClick={() => handleDelete(actualite)}
                    />
                  </>
                ) : null}
              </span>
            </div>
          ))}
        </div>
      </div>

      {showEditor ? (
        <ArticleEditor
          existing={editing}
          onClose={() => setShowEditor(false)}
          onSaved={handleSaved}
        />
      ) : null}
    </div>
  );
}
```

- [ ] **Step 5: Rewrite `app/admin/(shell)/actualites/page.tsx`**

```tsx
import { listActualitesAdmin } from "@/features/actualites-admin/requests/list-actualites-admin";
import { ActualitesAdminClient } from "@/components/features/admin/actualites-admin-client";

export default async function ActualitesPage() {
  const { data } = await listActualitesAdmin();
  return <ActualitesAdminClient initialActualites={data} />;
}
```

- [ ] **Step 6: Delete the now-unused mock data file**

```bash
rm features/admin/data/articles.ts
```

- [ ] **Step 7: Typecheck and lint**

Run: `pnpm run typecheck && pnpm run lint`
Expected: both clean — no more references to `features/admin/data/articles`, no prop-mismatch errors on `ArticleEditor`'s only caller.

- [ ] **Step 8: Manual smoke test — full CRUD flow in the browser**

With `onmec_backend` and the dev server running, log in as `national@mec-ci.org` (see the auth-admin plan's ledger for the current password) and go to `/admin/actualites`.

1. Click "Nouvel article", fill in a title, chapô, pick today's date, write a short body using the bold/link toolbar, pick an existing category in the publish popover (seed one via `POST /categorie-actualite` first if none exist), click "Publier l'article". Expected: redirected back to the list, the new article appears with statut "Publiée".
2. Click "Dépublier" on it. Expected: statut badge switches to "Brouillon" without a page reload.
3. Click "Modifier", change the title, click "Publier" again. Expected: the row's title updates, statut returns to "Publiée".
4. Click "Supprimer", confirm. Expected: the row disappears from the list.
5. Reload `/admin/actualites` from scratch. Expected: the deleted article does not reappear (soft-deleted, excluded by `deletedAt: null` in the backend's default admin list filter); any article left in a Brouillon/Publiée state from steps 1-3 does.
6. Switch to a `MODERATEUR` account (or use the shell's demo role switcher). Expected: neither "Nouvel article" nor the row actions (Modifier/Publier/Supprimer) are visible.

- [ ] **Step 9: Commit**

```bash
git add components/features/admin/article-editor.tsx components/features/admin/publish-popover.tsx
git add components/features/admin/actualites-admin-client.tsx "app/admin/(shell)/actualites/page.tsx"
git add -u features/admin/data
git commit -m "feat(actualites-admin): wire the editor, popover, and list page to the real backend

Single commit for editor+popover+list together: ArticleEditor's prop
contract change (onPublished -> onSaved, new existing prop) breaks its
only caller until the list page is rewritten too, so splitting these
into separate commits would leave typecheck broken in between."
```

---

## Final verification (after all tasks)

- [ ] Run `pnpm run typecheck && pnpm run lint && pnpm run test` once more from a clean state — all green.
- [ ] Run the `convention-drift-check` agent against the full diff (`git diff master`) before considering this plan done — required by `CLAUDE.md`.
- [ ] Full manual regression pass with the local `onmec_backend` running: repeat Task 7 Step 8's flow once more end-to-end without stopping partway, and confirm `/admin/connexion` → `/admin` → `/admin/actualites` navigation (built in the auth-admin plan) still works unaffected — this plan touches no auth files.
