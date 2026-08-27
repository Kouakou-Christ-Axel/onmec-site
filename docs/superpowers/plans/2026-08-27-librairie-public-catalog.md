# Catalogue public Librairie — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Brancher `/ressources` (catalogue) et `/ressources/[id]` (fiche détail) sur le vrai module
backend `Librairie` (`GET /librairie/public*`), en remplaçant les données statiques actuelles.

**Architecture:** Une Server Component (`app/(public)/ressources/page.tsx`) récupère la liste et les
catégories via `apiFetch(..., { auth: false })`, les passe à un orchestrateur client
(`LibrairieCatalog`) qui reproduit le filtre/tri/pagination actuels en mémoire (même principe
qu'aujourd'hui, sur des données réelles). La fiche détail est une seconde Server Component qui
appelle `GET /librairie/public/{id}`.

**Tech Stack:** Next.js App Router (Server Components), React 19, TypeScript strict, Tailwind v4,
Vitest.

**Spec:** `docs/superpowers/specs/2026-08-27-librairie-frontend-design.md`

## Global Constraints

- BFF strict : tout appel à `api.mec-ci.org` passe par `apiFetch()` (`lib/api-client.ts`), jamais de
  `fetch` direct. Lecture publique : toujours `{ auth: false }`.
- Fichiers de 200 lignes maximum sauf nécessité réelle documentée.
- Kebab-case pour tous les noms de fichiers.
- `pageCount` peut être absent de la réponse backend au moment de l'implémentation (ajout en cours
  côté `onmec_backend-r2-storage`, hors périmètre de ce repo) : toujours lire `doc.pageCount ?? null`,
  jamais supposer sa présence.
- Le backend n'accepte que des documents PDF — aucune UI de filtre par format n'existe ni ne doit
  être ajoutée dans ce plan.
- Aucune modification du repo `onmec_backend`/`onmec_backend-r2-storage`.

---

## Task 1: Modèle de données `LibrairieDocument`

**Files:**
- Create: `features/librairie/types/document.ts`

**Interfaces:**
- Produces: `LibrairieDocument`, `PublicLibrairieDocument`, `AdminLibrairieDocument` — types
  consommés par toutes les tâches suivantes (ce plan et le plan admin séparé).

Pas de test : fichier de déclarations de types uniquement, aucune logique runtime.

- [ ] **Step 1: Créer le fichier de types**

```ts
// features/librairie/types/document.ts

export type LibrairieDocument = {
  id: string;
  title: string;
  description: string | null;
  categorie: string | null;
  fileType: string; // ex: ".pdf"
  fileUrl: string;
  coverImage: string | null;
  /** Absent de la reponse tant que le backend n'a pas ajoute le champ — toujours lire `?? null`. */
  pageCount: number | null;
  uploadedAt: string; // ISO 8601
};

export type PublicLibrairieDocument = LibrairieDocument & { auteur: string };

export type AdminLibrairieDocument = LibrairieDocument & {
  uploadedBy: { id: string; fullname: string; email: string };
};

export interface LibrairieListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PublicLibrairieListResponse {
  data: PublicLibrairieDocument[];
  meta: LibrairieListMeta;
}
```

- [ ] **Step 2: Verifier le typecheck**

Run: `pnpm run typecheck`
Expected: PASS (aucun fichier ne consomme encore ce type, donc aucune erreur possible ici — sert
juste a confirmer que le fichier est syntaxiquement valide).

- [ ] **Step 3: Commit**

```bash
git add features/librairie/types/document.ts
git commit -m "feat(librairie): types partages du document Librairie"
```

---

## Task 2: Tri des documents (`sort-documents`)

**Files:**
- Create: `features/librairie/lib/sort-documents.ts`
- Test: `features/librairie/lib/sort-documents.test.ts`

**Interfaces:**
- Consumes: `PublicLibrairieDocument` (Task 1).
- Produces: `sortDocuments(list, sort): PublicLibrairieDocument[]`, `SortKey`, `SORT_OPTIONS` —
  consommes par `LibrairieToolbar` et `LibrairieCatalog` (Task 5, Task 9).

- [ ] **Step 1: Ecrire le test**

```ts
// features/librairie/lib/sort-documents.test.ts
import { describe, expect, it } from "vitest";
import { sortDocuments } from "@/features/librairie/lib/sort-documents";
import type { PublicLibrairieDocument } from "@/features/librairie/types/document";

function doc(overrides: Partial<PublicLibrairieDocument>): PublicLibrairieDocument {
  return {
    id: "id",
    title: "Titre",
    description: null,
    categorie: null,
    fileType: ".pdf",
    fileUrl: "https://cdn.example/doc.pdf",
    coverImage: null,
    pageCount: null,
    uploadedAt: "2026-01-01T00:00:00.000Z",
    auteur: "Auteur",
    ...overrides,
  };
}

describe("sortDocuments", () => {
  it("trie par date d'upload decroissante pour 'recent'", () => {
    const list = [
      doc({ id: "a", uploadedAt: "2026-01-01T00:00:00.000Z" }),
      doc({ id: "b", uploadedAt: "2026-06-01T00:00:00.000Z" }),
    ];
    expect(sortDocuments(list, "recent").map((d) => d.id)).toEqual(["b", "a"]);
  });

  it("trie par titre en respectant les accents francais pour 'az'", () => {
    const list = [doc({ id: "a", title: "Zoo" }), doc({ id: "b", title: "École" })];
    expect(sortDocuments(list, "az").map((d) => d.id)).toEqual(["b", "a"]);
  });

  it("trie par pageCount decroissant pour 'pages', valeurs null en dernier", () => {
    const list = [
      doc({ id: "a", pageCount: null }),
      doc({ id: "b", pageCount: 40 }),
      doc({ id: "c", pageCount: 10 }),
    ];
    expect(sortDocuments(list, "pages").map((d) => d.id)).toEqual(["b", "c", "a"]);
  });

  it("ne mute pas le tableau d'origine", () => {
    const list = [doc({ id: "a", title: "B" }), doc({ id: "b", title: "A" })];
    sortDocuments(list, "az");
    expect(list.map((d) => d.id)).toEqual(["a", "b"]);
  });
});
```

- [ ] **Step 2: Lancer le test, verifier qu'il echoue**

Run: `pnpm run test sort-documents`
Expected: FAIL avec "Failed to resolve import" ou "sortDocuments is not a function".

- [ ] **Step 3: Implementer**

```ts
// features/librairie/lib/sort-documents.ts
import type { PublicLibrairieDocument } from "@/features/librairie/types/document";

export type SortKey = "recent" | "az" | "pages";

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "recent", label: "Plus récents" },
  { value: "az", label: "A → Z" },
  { value: "pages", label: "Nombre de pages" },
];

export function sortDocuments(
  list: PublicLibrairieDocument[],
  sort: SortKey,
): PublicLibrairieDocument[] {
  const sorted = [...list];
  switch (sort) {
    case "recent":
      return sorted.sort(
        (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
      );
    case "az":
      return sorted.sort((a, b) => a.title.localeCompare(b.title, "fr"));
    case "pages":
      return sorted.sort((a, b) => (b.pageCount ?? -1) - (a.pageCount ?? -1));
    default:
      return sorted;
  }
}
```

- [ ] **Step 4: Lancer le test, verifier qu'il passe**

Run: `pnpm run test sort-documents`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add features/librairie/lib/sort-documents.ts features/librairie/lib/sort-documents.test.ts
git commit -m "feat(librairie): tri des documents (recent/az/pages)"
```

---

## Task 3: Requêtes publiques (server-only)

**Files:**
- Create: `features/librairie/requests/list-librairie-public.ts`
- Create: `features/librairie/requests/get-librairie-public.ts`
- Create: `features/librairie/requests/list-librairie-categories.ts`

**Interfaces:**
- Consumes: `apiFetch` (`lib/api-client.ts`), `PublicLibrairieDocument`,
  `PublicLibrairieListResponse` (Task 1).
- Produces: `listLibrairiePublic({ categorie?, limit? })`, `getLibrairiePublic(id): Promise<PublicLibrairieDocument | null>`,
  `listLibrairieCategories()` — consommés par les pages Server Component (Task 11).

Pas de test : wrappers `apiFetch` fins, sans logique — même convention que
`features/actualites/requests/list-actualites.ts` (non testé).

- [ ] **Step 1: `list-librairie-public.ts`**

```ts
// features/librairie/requests/list-librairie-public.ts
import { apiFetch } from "@/lib/api-client";
import type { PublicLibrairieListResponse } from "@/features/librairie/types/document";

// ponytail: 100 par defaut recupere tout le catalogue en un appel plutot que de refaire la
// pagination serveur cote client (le catalogue reste petit) ; passer a une pagination server-side
// si le nombre de documents publies depasse ce seuil.
const CATALOG_LIMIT = 100;

interface ListLibrairiePublicParams {
  categorie?: string;
  limit?: number;
}

/**
 * Liste publique : le backend n'expose que les documents, sans donnees sensibles.
 *
 * `auth: false` volontairement — sans lui `apiFetch` appelle `cookies()`, ce qui rendrait la page
 * dynamique alors qu'elle est publique et cacheable (meme raison que `list-actualites.ts`).
 */
export async function listLibrairiePublic({
  categorie,
  limit = CATALOG_LIMIT,
}: ListLibrairiePublicParams = {}): Promise<PublicLibrairieListResponse> {
  const query = new URLSearchParams({ limit: String(limit) });
  if (categorie) query.set("categorie", categorie);
  const response = await apiFetch<PublicLibrairieListResponse>(`/librairie/public?${query}`, {
    auth: false,
  });
  // Normalisation defensive : le backend peut omettre pageCount plutot que de le poser a `null`
  // (champ pas encore livre au moment de l'implementation) — sans ce mapping, `undefined` passerait
  // le check `!== null` cote UI et s'afficherait litteralement comme "undefined p.".
  return {
    ...response,
    data: response.data.map((doc) => ({ ...doc, pageCount: doc.pageCount ?? null })),
  };
}
```

- [ ] **Step 2: `get-librairie-public.ts`**

```ts
// features/librairie/requests/get-librairie-public.ts
import { apiFetch } from "@/lib/api-client";
import { ApiError } from "@/lib/api-error";
import type { PublicLibrairieDocument } from "@/features/librairie/types/document";

/**
 * Detail public par id. Renvoie `null` sur 404 pour que l'appelant decide (`notFound()`), plutot
 * que de laisser remonter une ApiError jusqu'a la frontiere d'erreur — meme patron que
 * `get-actualite-by-slug.ts`.
 */
export async function getLibrairiePublic(id: string): Promise<PublicLibrairieDocument | null> {
  try {
    const document = await apiFetch<PublicLibrairieDocument>(`/librairie/public/${id}`, {
      auth: false,
    });
    return { ...document, pageCount: document.pageCount ?? null };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}
```

- [ ] **Step 3: `list-librairie-categories.ts`**

```ts
// features/librairie/requests/list-librairie-categories.ts
import { apiFetch } from "@/lib/api-client";

export function listLibrairieCategories(): Promise<string[]> {
  return apiFetch<string[]>("/librairie/public/categories", { auth: false });
}
```

- [ ] **Step 4: Verifier le typecheck**

Run: `pnpm run typecheck`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add features/librairie/requests/
git commit -m "feat(librairie): requetes publiques (liste, detail, categories)"
```

---

## Task 4: `DocumentCover` et `DocumentDownloadLink`

**Files:**
- Create: `components/features/librairie/document-cover.tsx`
- Create: `components/features/librairie/document-download-link.tsx`

**Interfaces:**
- Consumes: `PhotoPlaceholder` (`components/features/site/photo-placeholder.tsx`), patron
  `ArticleCover` (`components/features/site/article-cover.tsx`).
- Produces: `<DocumentCover src ratio? className? label? />`, `<DocumentDownloadLink href children? />`
  — consommés par `LibrairieCard`, `LibrairieTable`, `LibrairiePreviewOverlay`, `DocumentHeader`
  (Task 6, 7, 10).

Pas de test : composants de présentation purs, pas de logique conditionnelle testable isolément
(même convention que `ArticleCover`, non testé).

- [ ] **Step 1: `document-cover.tsx`**

```tsx
// components/features/librairie/document-cover.tsx
import Image from "next/image";
import { PhotoPlaceholder } from "@/components/features/site/photo-placeholder";
import { cn } from "@/components/ui/cn";

interface DocumentCoverProps {
  src: string | null;
  alt: string;
  ratio?: string;
  className?: string;
  compact?: boolean;
}

/** Couverture de document : vraie image R2 quand fournie, repli placeholder sinon. */
export function DocumentCover({
  src,
  alt,
  ratio = "3/4",
  className,
  compact = false,
}: DocumentCoverProps) {
  if (!src) {
    return (
      <PhotoPlaceholder
        ratio={ratio}
        label="Couverture à fournir"
        compact={compact}
        className={className}
      />
    );
  }

  return (
    <div
      style={{ aspectRatio: ratio }}
      className={cn("relative w-full overflow-hidden rounded-sm", className)}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 1024px) 340px, (min-width: 640px) 50vw, 100vw"
        className="object-cover"
      />
    </div>
  );
}
```

- [ ] **Step 2: `document-download-link.tsx`**

```tsx
// components/features/librairie/document-download-link.tsx

/** Lien de telechargement direct — le backend redirige (302) vers le fichier R2. */
export function DocumentDownloadLink({ href }: { href: string }) {
  return (
    <a
      href={href}
      className="inline-flex h-[54px] w-fit items-center gap-2.5 rounded-sm bg-orange-500 px-7 text-[1.0625rem] font-semibold text-white transition-colors duration-150 ease-out hover:bg-orange-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
    >
      Télécharger le guide <span>→</span>
    </a>
  );
}
```

- [ ] **Step 3: Verifier le typecheck**

Run: `pnpm run typecheck`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add components/features/librairie/document-cover.tsx components/features/librairie/document-download-link.tsx
git commit -m "feat(librairie): couverture reelle et lien de telechargement direct"
```

---

## Task 5: `LibrairieToolbar`

**Files:**
- Create: `components/features/librairie/librairie-toolbar.tsx`

**Interfaces:**
- Consumes: `SelectInput` (`components/features/site/form-controls.tsx`), `SortKey`,
  `SORT_OPTIONS` (Task 2).
- Produces: `<LibrairieToolbar query onQueryChange categorie onCategorieChange categories sort
  onSortChange resultCount />` — consommé par `LibrairieCatalog` (Task 9).

Pas de test : composant de présentation avec état contrôlé par le parent, même convention que
`ressource-toolbar.tsx` (non testé).

- [ ] **Step 1: Implementer**

```tsx
// components/features/librairie/librairie-toolbar.tsx
"use client";

import { Search } from "lucide-react";
import { SORT_OPTIONS, type SortKey } from "@/features/librairie/lib/sort-documents";
import { SelectInput } from "@/components/features/site/form-controls";

const pillClass = (isActive: boolean) =>
  `inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide uppercase transition-colors duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring ${
    isActive ? "bg-ink text-surface-page" : "bg-n-100 text-text-body hover:bg-n-200"
  }`;

export const ALL_CATEGORIES = "Toutes les catégories" as const;
export type CategorieFilter = string | typeof ALL_CATEGORIES;

export function LibrairieToolbar({
  query,
  onQueryChange,
  categorie,
  onCategorieChange,
  categories,
  sort,
  onSortChange,
  resultCount,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  categorie: CategorieFilter;
  onCategorieChange: (value: CategorieFilter) => void;
  categories: string[];
  sort: SortKey;
  onSortChange: (value: SortKey) => void;
  resultCount: number;
}) {
  return (
    <div className="sticky top-[72px] z-40 border-b border-ink/10 bg-surface-blur py-4 backdrop-blur-sm">
      <div className="flex flex-wrap items-center gap-3">
        <label className="relative flex h-10 min-w-[220px] flex-1 items-center sm:flex-none sm:basis-[280px]">
          <Search className="pointer-events-none absolute left-3 h-4 w-4 text-n-400" aria-hidden />
          <span className="sr-only">Rechercher un guide</span>
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Rechercher un guide"
            className="h-10 w-full rounded-full border border-ink/10 bg-surface-card pr-4 pl-9 text-sm text-ink outline-none placeholder:text-n-400 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/25"
          />
        </label>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => onCategorieChange(ALL_CATEGORIES)}
            aria-pressed={categorie === ALL_CATEGORIES}
            className={pillClass(categorie === ALL_CATEGORIES)}
          >
            {ALL_CATEGORIES}
          </button>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onCategorieChange(c)}
              aria-pressed={categorie === c}
              className={pillClass(categorie === c)}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="w-[168px] flex-none">
          <SelectInput
            aria-label="Trier"
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortKey)}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </SelectInput>
        </div>

        <span className="ml-auto text-[13px] text-text-muted">
          {resultCount} {resultCount > 1 ? "guides" : "guide"}
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verifier le typecheck**

Run: `pnpm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add components/features/librairie/librairie-toolbar.tsx
git commit -m "feat(librairie): barre de recherche/filtre/tri du catalogue"
```

---

## Task 6: `LibrairieCard` et `LibrairieTable`

**Files:**
- Create: `components/features/librairie/librairie-card.tsx`
- Create: `components/features/librairie/librairie-table.tsx`

**Interfaces:**
- Consumes: `PublicLibrairieDocument` (Task 1), `DocumentCover` (Task 4).
- Produces: `<LibrairieCard document />`, `<LibrairieTable documents onPreview />` — consommés par
  `LibrairieCatalog` (Task 9) et `RelatedDocuments` (Task 10).

Pas de test : composants de présentation purs.

- [ ] **Step 1: `librairie-card.tsx`**

```tsx
// components/features/librairie/librairie-card.tsx
import Link from "next/link";
import type { PublicLibrairieDocument } from "@/features/librairie/types/document";
import { DocumentCover } from "@/components/features/librairie/document-cover";

export function LibrairieCard({ document }: { document: PublicLibrairieDocument }) {
  return (
    <Link
      href={`/ressources/${document.id}`}
      className="group flex flex-col gap-4 rounded-sm transition-transform duration-150 ease-out hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
    >
      <div className="relative">
        <DocumentCover src={document.coverImage} alt={document.title} />
        {document.categorie ? (
          <span className="absolute bottom-3 left-3 inline-flex items-center rounded-full bg-ink px-3 py-1 text-[11px] font-semibold tracking-wide text-surface-page uppercase">
            {document.categorie}
          </span>
        ) : null}
      </div>
      <h3 className="text-h3 leading-snug font-semibold text-ink transition-colors group-hover:text-orange-700">
        {document.title}
      </h3>
      {document.description ? (
        <p className="text-sm leading-relaxed text-text-muted">{document.description}</p>
      ) : null}
      <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
        <span>{new Date(document.uploadedAt).toLocaleDateString("fr-FR")}</span>
        {document.pageCount !== null ? (
          <>
            <span>·</span>
            <span>{document.pageCount} p.</span>
          </>
        ) : null}
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: `librairie-table.tsx`**

```tsx
// components/features/librairie/librairie-table.tsx
import Link from "next/link";
import type { PublicLibrairieDocument } from "@/features/librairie/types/document";
import { DocumentCover } from "@/components/features/librairie/document-cover";

export function LibrairieTable({
  documents,
  onPreview,
}: {
  documents: PublicLibrairieDocument[];
  onPreview: (id: string) => void;
}) {
  return (
    <table className="hidden w-full border-collapse text-sm lg:mt-9 lg:table">
      <thead>
        <tr className="border-b border-ink/10 text-left text-[11px] font-semibold tracking-wide text-text-muted uppercase">
          <th className="w-20 py-3 pr-4 font-semibold">Couverture</th>
          <th className="py-3 pr-4 font-semibold">Titre</th>
          <th className="py-3 pr-4 font-semibold">Catégorie</th>
          <th className="py-3 pr-4 font-semibold">Pages</th>
          <th className="py-3 pr-4 font-semibold">
            <span className="sr-only">Aperçu</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {documents.map((document) => (
          <tr key={document.id} className="border-b border-ink/10 align-middle">
            <td className="py-3 pr-4">
              <DocumentCover
                src={document.coverImage}
                alt={document.title}
                className="w-14"
                compact
              />
            </td>
            <td className="py-3 pr-4">
              <Link
                href={`/ressources/${document.id}`}
                className="font-semibold text-ink transition-colors hover:text-orange-700"
              >
                {document.title}
              </Link>
              {document.description ? (
                <p className="mt-1 line-clamp-1 text-xs text-text-muted">{document.description}</p>
              ) : null}
            </td>
            <td className="py-3 pr-4 text-xs font-semibold tracking-wide text-blue-600 uppercase">
              {document.categorie ?? "—"}
            </td>
            <td className="py-3 pr-4 text-text-muted">
              {document.pageCount !== null ? `${document.pageCount} p.` : "—"}
            </td>
            <td className="py-3 pr-4 text-right">
              <button
                type="button"
                onClick={() => onPreview(document.id)}
                className="inline-flex h-8 items-center rounded-sm border border-ink/24 px-3 text-xs font-semibold text-ink transition-colors hover:bg-n-100"
              >
                Aperçu
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

- [ ] **Step 3: Verifier le typecheck**

Run: `pnpm run typecheck`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add components/features/librairie/librairie-card.tsx components/features/librairie/librairie-table.tsx
git commit -m "feat(librairie): carte et tableau du catalogue"
```

---

## Task 7: `LibrairiePagination` et `LibrairiePreviewOverlay`

**Files:**
- Create: `components/features/librairie/librairie-pagination.tsx`
- Create: `components/features/librairie/librairie-preview-overlay.tsx`

**Interfaces:**
- Consumes: `PublicLibrairieDocument` (Task 1), `Dialog`, `DialogTitle`, `useLastNonNull`
  (`components/ui/dialog.tsx`), `DocumentCover` (Task 4).
- Produces: `<LibrairiePagination page totalPages onChange />`, `<LibrairiePreviewOverlay document
  onClose />` — consommés par `LibrairieCatalog` (Task 9).

Pas de test : composants de présentation / overlay Radix, non testés ailleurs dans le projet.

- [ ] **Step 1: `librairie-pagination.tsx`** (copie de `ressource-pagination.tsx`, aucune logique
  ne change)

```tsx
// components/features/librairie/librairie-pagination.tsx
export function LibrairiePagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Pagination" className="mt-9 flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="inline-flex h-9 items-center rounded-sm border border-ink/24 px-3 text-sm font-semibold text-ink transition-colors hover:bg-n-100 disabled:pointer-events-none disabled:opacity-40"
      >
        Précédent
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-current={n === page ? "page" : undefined}
          className={`inline-flex h-9 w-9 items-center justify-center rounded-sm text-sm font-semibold transition-colors ${
            n === page ? "bg-ink text-surface-page" : "text-ink hover:bg-n-100"
          }`}
        >
          {n}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="inline-flex h-9 items-center rounded-sm border border-ink/24 px-3 text-sm font-semibold text-ink transition-colors hover:bg-n-100 disabled:pointer-events-none disabled:opacity-40"
      >
        Suivant
      </button>
    </nav>
  );
}
```

- [ ] **Step 2: `librairie-preview-overlay.tsx`**

```tsx
// components/features/librairie/librairie-preview-overlay.tsx
"use client";

import Link from "next/link";
import { X } from "lucide-react";
import type { PublicLibrairieDocument } from "@/features/librairie/types/document";
import { DocumentCover } from "@/components/features/librairie/document-cover";
import { Dialog, DialogTitle, useLastNonNull } from "@/components/ui/dialog";

export function LibrairiePreviewOverlay({
  document,
  onClose,
}: {
  document: PublicLibrairieDocument | null;
  onClose: () => void;
}) {
  const shown = useLastNonNull(document);
  if (!shown) return null;

  return (
    <Dialog
      open={document !== null}
      onClose={onClose}
      overlayClassName="p-5"
      className="grid max-w-[640px] grid-cols-1 gap-6 rounded-md border-ink bg-surface-card p-7 shadow-stamp sm:grid-cols-[200px_1fr]"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Fermer l'aperçu"
        className="absolute top-4 right-4 grid h-8 w-8 place-items-center rounded-full text-text-muted transition-colors hover:bg-n-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>

      <DocumentCover src={shown.coverImage} alt={shown.title} />

      <div className="flex flex-col gap-3">
        {shown.categorie ? (
          <span className="text-[11px] font-semibold tracking-wide text-text-muted uppercase">
            {shown.categorie}
          </span>
        ) : null}
        <DialogTitle asChild>
          <h2 className="text-xl font-semibold text-ink">{shown.title}</h2>
        </DialogTitle>
        {shown.description ? (
          <p className="text-sm leading-relaxed text-text-muted">{shown.description}</p>
        ) : null}
        <div className="flex flex-wrap gap-3 text-xs text-text-muted">
          {shown.pageCount !== null ? <span>{shown.pageCount} p.</span> : null}
        </div>
        <Link
          href={`/ressources/${shown.id}`}
          className="mt-2 inline-flex h-11 w-fit items-center rounded-sm bg-orange-500 px-6 text-sm font-semibold text-white transition-colors hover:bg-orange-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
        >
          Voir la fiche complète →
        </Link>
      </div>
    </Dialog>
  );
}
```

- [ ] **Step 3: Verifier le typecheck**

Run: `pnpm run typecheck`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add components/features/librairie/librairie-pagination.tsx components/features/librairie/librairie-preview-overlay.tsx
git commit -m "feat(librairie): pagination et apercu plein ecran du catalogue"
```

---

## Task 8: `LibrairieHero` et `LibrairieCta`

**Files:**
- Create: `components/features/librairie/librairie-hero.tsx`
- Create: `components/features/librairie/librairie-cta.tsx`

**Interfaces:**
- Consumes: `Reveal`, `Stat` (`components/features/site/`).
- Produces: `<LibrairieHero total categoriesCount />`, `<LibrairieCta />` — consommés par
  `app/(public)/ressources/page.tsx` (Task 9).

Pas de test : composants de présentation, contenu marketing statique + deux chiffres reçus en props.

- [ ] **Step 1: `librairie-hero.tsx`** (remplace `hero.tsx` — reçoit les totaux en props au lieu de
  les calculer depuis les données statiques ; plus de stat "téléchargements", abandonnée avec le
  champ)

```tsx
// components/features/librairie/librairie-hero.tsx
import { Reveal } from "@/components/features/site/reveal";
import { Stat } from "@/components/features/site/stat";

export function LibrairieHero({
  total,
  categoriesCount,
}: {
  total: number;
  categoriesCount: number;
}) {
  return (
    <section className="py-11 sm:py-14 lg:py-20">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-16">
        <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <Reveal className="flex max-w-[760px] flex-col gap-4">
            <span className="text-xs font-semibold tracking-widest text-orange-700 uppercase">
              Ressources
            </span>
            <h1 className="text-5xl leading-none font-semibold tracking-tight text-ink sm:text-6xl">
              Des guides à <em className="font-serif font-normal italic">utiliser</em>, pas à
              archiver
            </h1>
            <p className="max-w-[60ch] text-lg leading-relaxed text-text-muted">
              Guides pédagogiques écrits avec des enseignants et relus par nos encadreurs.
              Téléchargement gratuit, en un clic.
            </p>
          </Reveal>
          <Reveal delay={80} className="grid grid-cols-2 gap-6 sm:gap-8">
            <Stat value={String(total)} label="guides publiés" />
            <Stat value={String(categoriesCount)} label="thématiques" />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: `librairie-cta.tsx`** (copie de `ressource-cta.tsx`, aucun contenu ne change)

```tsx
// components/features/librairie/librairie-cta.tsx
import Link from "next/link";
import { Reveal } from "@/components/features/site/reveal";

export function LibrairieCta() {
  return (
    <section className="py-14 sm:py-18 lg:py-24">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-16">
        <Reveal className="relative overflow-hidden rounded-lg bg-blue-800 text-white">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 text-white/10"
            style={{ backgroundImage: "var(--pattern-dots)", backgroundSize: "22px 22px" }}
          />
          <div className="relative flex flex-col items-start gap-6 p-8 sm:p-12 lg:p-16">
            <div>
              <span className="text-xs font-semibold tracking-widest text-orange-400 uppercase">
                Écrire avec nous
              </span>
              <h2 className="mt-4 text-4xl leading-tight font-semibold tracking-tight text-white sm:text-5xl">
                Un guide manque à votre classe ?
              </h2>
              <p className="mt-4 max-w-[54ch] text-[1.0625rem] leading-relaxed text-white/80">
                Nous concevons les guides avec les enseignants qui les utilisent. Dites-nous ce dont
                vous avez besoin.
              </p>
            </div>
            <Link
              href="/rejoindre"
              className="inline-flex h-[54px] items-center gap-2.5 rounded-sm bg-orange-500 px-7 text-[1.0625rem] font-semibold text-white transition-colors hover:bg-orange-600"
            >
              Proposer un guide <span>→</span>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Verifier le typecheck**

Run: `pnpm run typecheck`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add components/features/librairie/librairie-hero.tsx components/features/librairie/librairie-cta.tsx
git commit -m "feat(librairie): hero et CTA du catalogue, alimentes par les vraies donnees"
```

---

## Task 9: `LibrairieCatalog` (orchestrateur)

**Files:**
- Create: `components/features/librairie/librairie-catalog.tsx`

**Interfaces:**
- Consumes: `PublicLibrairieDocument` (Task 1), `sortDocuments`/`SortKey` (Task 2),
  `LibrairieToolbar`/`ALL_CATEGORIES`/`CategorieFilter` (Task 5), `LibrairieTable` (Task 6),
  `LibrairieCard` (Task 6), `LibrairiePagination` (Task 7), `LibrairiePreviewOverlay` (Task 7).
- Produces: `<LibrairieCatalog documents categories />` — consommé par
  `app/(public)/ressources/page.tsx` (Task 11).

Pas de test dédié : logique de filtre/tri/pagination en `useMemo`, même convention que
`ressource-catalog.tsx` (non testé directement — `sortDocuments` sous-jacent l'est déjà en Task 2).

- [ ] **Step 1: Implementer**

```tsx
// components/features/librairie/librairie-catalog.tsx
"use client";

import { useMemo, useState } from "react";
import type { PublicLibrairieDocument } from "@/features/librairie/types/document";
import { sortDocuments, type SortKey } from "@/features/librairie/lib/sort-documents";
import {
  LibrairieToolbar,
  ALL_CATEGORIES,
  type CategorieFilter,
} from "@/components/features/librairie/librairie-toolbar";
import { LibrairieTable } from "@/components/features/librairie/librairie-table";
import { LibrairieCard } from "@/components/features/librairie/librairie-card";
import { LibrairiePagination } from "@/components/features/librairie/librairie-pagination";
import { LibrairiePreviewOverlay } from "@/components/features/librairie/librairie-preview-overlay";

const PAGE_SIZE = 9;

export function LibrairieCatalog({
  documents,
  categories,
}: {
  documents: PublicLibrairieDocument[];
  categories: string[];
}) {
  const [query, setQuery] = useState("");
  const [categorie, setCategorie] = useState<CategorieFilter>(ALL_CATEGORIES);
  const [sort, setSort] = useState<SortKey>("recent");
  const [page, setPage] = useState(1);
  const [previewId, setPreviewId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matches = documents.filter((d) => {
      const matchesCategorie = categorie === ALL_CATEGORIES || d.categorie === categorie;
      const matchesQuery =
        !needle ||
        d.title.toLowerCase().includes(needle) ||
        (d.description?.toLowerCase().includes(needle) ?? false);
      return matchesCategorie && matchesQuery;
    });
    return sortDocuments(matches, sort);
  }, [documents, categorie, query, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const previewDocument = documents.find((d) => d.id === previewId) ?? null;

  const handleCategorieChange = (value: CategorieFilter) => {
    setCategorie(value);
    setPage(1);
  };
  const handleQueryChange = (value: string) => {
    setQuery(value);
    setPage(1);
  };
  const handleSortChange = (value: SortKey) => {
    setSort(value);
    setPage(1);
  };

  const clearFilters = () => {
    setCategorie(ALL_CATEGORIES);
    setQuery("");
    setPage(1);
  };

  return (
    <>
      <LibrairieToolbar
        query={query}
        onQueryChange={handleQueryChange}
        categorie={categorie}
        onCategorieChange={handleCategorieChange}
        categories={categories}
        sort={sort}
        onSortChange={handleSortChange}
        resultCount={filtered.length}
      />

      {pageItems.length ? (
        <>
          <LibrairieTable documents={pageItems} onPreview={setPreviewId} />
          <div className="mt-9 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:hidden">
            {pageItems.map((document) => (
              <LibrairieCard key={document.id} document={document} />
            ))}
          </div>
        </>
      ) : (
        <div className="mt-9 flex flex-col items-start gap-3 rounded-md border border-dashed border-ink/20 bg-surface-card p-8">
          <p className="text-lg font-semibold text-ink">Aucun guide ne correspond.</p>
          <p className="text-sm text-text-muted">
            Essayez un autre mot-clé ou revenez à tous les filtres.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-1 inline-flex h-10 items-center rounded-sm border border-ink/24 px-5 text-sm font-semibold text-ink transition-colors hover:bg-n-100"
          >
            Effacer les filtres
          </button>
        </div>
      )}

      <LibrairiePagination page={currentPage} totalPages={totalPages} onChange={setPage} />

      <LibrairiePreviewOverlay document={previewDocument} onClose={() => setPreviewId(null)} />
    </>
  );
}
```

- [ ] **Step 2: Verifier le typecheck**

Run: `pnpm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add components/features/librairie/librairie-catalog.tsx
git commit -m "feat(librairie): orchestrateur du catalogue (filtre/tri/pagination)"
```

---

## Task 10: `DocumentHeader`, `DocumentBody`, `RelatedDocuments`

**Files:**
- Create: `components/features/librairie/document-header.tsx`
- Create: `components/features/librairie/document-body.tsx`
- Create: `components/features/librairie/related-documents.tsx`

**Interfaces:**
- Consumes: `PublicLibrairieDocument` (Task 1), `DocumentCover`/`DocumentDownloadLink` (Task 4),
  `LibrairieCard` (Task 6).
- Produces: `<DocumentHeader document />`, `<DocumentBody document />`, `<RelatedDocuments
  documents />` — consommés par `app/(public)/ressources/[id]/page.tsx` (Task 11).

Pas de test : composants de présentation purs.

- [ ] **Step 1: `document-header.tsx`**

```tsx
// components/features/librairie/document-header.tsx
import Link from "next/link";
import { FileText, Link2, Share2 } from "lucide-react";
import type { PublicLibrairieDocument } from "@/features/librairie/types/document";
import { DocumentCover } from "@/components/features/librairie/document-cover";
import { DocumentDownloadLink } from "@/components/features/librairie/document-download-link";

const SHARE_LINKS = [
  { icon: Share2, label: "Partager sur Facebook" },
  { icon: Share2, label: "Partager sur Twitter" },
  { icon: Share2, label: "Partager sur LinkedIn" },
  { icon: Link2, label: "Copier le lien" },
];

export function DocumentHeader({ document }: { document: PublicLibrairieDocument }) {
  return (
    <>
      <section className="py-7 sm:py-11">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-16">
          <Link href="/ressources" className="text-sm font-semibold text-text-muted">
            ← Toutes les ressources
          </Link>
        </div>
      </section>
      <section className="pb-14 sm:pb-18 lg:pb-24">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-16">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-16">
            <div className="flex flex-col gap-4 lg:sticky lg:top-[100px] lg:self-start">
              <DocumentCover
                src={document.coverImage}
                alt={document.title}
                className="shadow-stamp"
              />
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <FileText className="h-4 w-4" aria-hidden />
                PDF{document.pageCount !== null ? ` · ${document.pageCount} pages` : ""}
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                {document.categorie ? (
                  <span className="text-xs font-semibold tracking-widest text-orange-700 uppercase">
                    {document.categorie}
                  </span>
                ) : null}
                <h1 className="text-4xl leading-[1.02] font-semibold tracking-tight text-ink text-pretty sm:text-5xl">
                  {document.title}
                </h1>
                {document.description ? (
                  <p className="max-w-[62ch] text-xl leading-snug text-text-muted text-pretty">
                    {document.description}
                  </p>
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-6 border-y border-ink/10 py-6 sm:grid-cols-4">
                <div>
                  <div className="text-lg font-semibold tabular-nums text-ink">
                    {new Date(document.uploadedAt).toLocaleDateString("fr-FR")}
                  </div>
                  <div className="mt-1 text-xs text-text-muted">Publié le</div>
                </div>
                {document.pageCount !== null ? (
                  <div>
                    <div className="text-lg font-semibold tabular-nums text-ink">
                      {document.pageCount} p.
                    </div>
                    <div className="mt-1 text-xs text-text-muted">Pages</div>
                  </div>
                ) : null}
              </div>

              <DocumentDownloadLink href={document.fileUrl} />

              <div className="flex items-center gap-3 border-t border-ink/10 pt-6">
                <span className="text-sm font-semibold text-ink">Partager</span>
                <div className="flex items-center gap-2">
                  {SHARE_LINKS.map(({ icon: Icon, label }) => (
                    <span
                      key={label}
                      title={label}
                      className="grid h-9 w-9 place-items-center rounded-full border border-ink/15 text-text-muted"
                    >
                      <Icon className="h-4 w-4" aria-hidden />
                      <span className="sr-only">{label}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 2: `document-body.tsx`**

```tsx
// components/features/librairie/document-body.tsx
import type { PublicLibrairieDocument } from "@/features/librairie/types/document";

export function DocumentBody({ document }: { document: PublicLibrairieDocument }) {
  if (!document.description) return null;

  return (
    <article className="mx-auto max-w-[1280px] px-5 pb-14 sm:px-8 sm:pb-18 lg:px-16 lg:pb-24">
      <div className="max-w-[68ch]">
        <h2 className="mb-5 text-2xl leading-tight font-semibold tracking-tight text-ink">
          À propos de ce guide
        </h2>
        <div className="flex flex-col gap-5 text-lg leading-relaxed text-text-body">
          <p>{document.description}</p>
          <p className="text-base text-text-muted">
            Le guide est libre d’usage en classe et en club, photocopie comprise. Merci de conserver
            la mention du MEC en pied de page. Toute réédition ou traduction demande notre accord
            écrit.
          </p>
        </div>
      </div>
    </article>
  );
}
```

- [ ] **Step 3: `related-documents.tsx`**

```tsx
// components/features/librairie/related-documents.tsx
import Link from "next/link";
import type { PublicLibrairieDocument } from "@/features/librairie/types/document";
import { LibrairieCard } from "@/components/features/librairie/librairie-card";

export function RelatedDocuments({ documents }: { documents: PublicLibrairieDocument[] }) {
  if (!documents.length) return null;

  return (
    <section className="border-t border-ink/10 bg-surface-card py-14 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-2xl leading-tight font-semibold tracking-tight text-ink">
            Ressources liées
          </h2>
          <Link
            href="/ressources"
            className="w-fit border-b-2 border-orange-500 pb-0.5 text-sm font-semibold text-ink"
          >
            Tout le catalogue →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {documents.map((document) => (
            <LibrairieCard key={document.id} document={document} />
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Verifier le typecheck**

Run: `pnpm run typecheck`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/features/librairie/document-header.tsx components/features/librairie/document-body.tsx components/features/librairie/related-documents.tsx
git commit -m "feat(librairie): en-tete, corps et ressources liees de la fiche detail"
```

---

## Task 11: Routes publiques (rename `[slug]` → `[id]`, wiring API)

**Files:**
- Create: `app/(public)/ressources/[id]/page.tsx`
- Create: `app/(public)/ressources/[id]/loading.tsx`
- Modify: `app/(public)/ressources/page.tsx`
- Modify: `app/(public)/ressources/loading.tsx` (ajuster le nombre de colonnes du squelette de
  tableau : 5 au lieu de 6)
- Delete: `app/(public)/ressources/[slug]/page.tsx`
- Delete: `app/(public)/ressources/[slug]/loading.tsx`

**Interfaces:**
- Consumes: `listLibrairiePublic`, `getLibrairiePublic`, `listLibrairieCategories` (Task 3),
  `LibrairieHero`/`LibrairieCta` (Task 8), `LibrairieCatalog` (Task 9),
  `DocumentHeader`/`DocumentBody`/`RelatedDocuments` (Task 10).

Pas de test : Server Components, vérifiées manuellement (Task 13).

- [ ] **Step 1: `app/(public)/ressources/page.tsx`**

```tsx
// app/(public)/ressources/page.tsx
import { LibrairieHero } from "@/components/features/librairie/librairie-hero";
import { LibrairieCatalog } from "@/components/features/librairie/librairie-catalog";
import { LibrairieCta } from "@/components/features/librairie/librairie-cta";
import { listLibrairiePublic } from "@/features/librairie/requests/list-librairie-public";
import { listLibrairieCategories } from "@/features/librairie/requests/list-librairie-categories";

export default async function RessourcesPage() {
  const [{ data: documents, meta }, categories] = await Promise.all([
    listLibrairiePublic(),
    listLibrairieCategories(),
  ]);

  return (
    <main>
      <LibrairieHero total={meta.total} categoriesCount={categories.length} />
      <div className="mx-auto max-w-[1280px] px-5 pb-14 sm:px-8 sm:pb-18 lg:px-16 lg:pb-24">
        <LibrairieCatalog documents={documents} categories={categories} />
      </div>
      <LibrairieCta />
    </main>
  );
}
```

- [ ] **Step 2: `app/(public)/ressources/[id]/page.tsx`**

```tsx
// app/(public)/ressources/[id]/page.tsx
import { notFound } from "next/navigation";
import { getLibrairiePublic } from "@/features/librairie/requests/get-librairie-public";
import { listLibrairiePublic } from "@/features/librairie/requests/list-librairie-public";
import { DocumentHeader } from "@/components/features/librairie/document-header";
import { DocumentBody } from "@/components/features/librairie/document-body";
import { RelatedDocuments } from "@/components/features/librairie/related-documents";

export default async function RessourcePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const document = await getLibrairiePublic(id);
  if (!document) notFound();

  // « Ressources liées » : même catégorie de préférence, en excluant le document courant —
  // même patron que app/(public)/actualites/[slug]/page.tsx.
  const { data: voisins } = await listLibrairiePublic({
    limit: 4,
    categorie: document.categorie ?? undefined,
  });
  const related = voisins.filter((autre) => autre.id !== document.id).slice(0, 3);

  return (
    <main>
      <DocumentHeader document={document} />
      <DocumentBody document={document} />
      <RelatedDocuments documents={related} />
    </main>
  );
}
```

- [ ] **Step 3: `app/(public)/ressources/[id]/loading.tsx`** (copie de `[slug]/loading.tsx`, aucun
  changement de contenu)

```tsx
// app/(public)/ressources/[id]/loading.tsx
import { Skeleton, SkeletonScreen } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <SkeletonScreen label="Chargement du guide…">
      <main className="mx-auto max-w-[1280px] px-5 py-11 sm:px-8 sm:py-14 lg:px-16 lg:py-20">
        <Skeleton className="h-4 w-44" />
        <div className="mt-9 grid grid-cols-1 gap-10 lg:grid-cols-[350px_1fr] lg:gap-16">
          <Skeleton className="aspect-[3/4] w-full rounded-md" />
          <div className="flex flex-col gap-4">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-12 w-full max-w-[560px]" />
            <Skeleton className="h-5 w-full max-w-[480px]" />
            <div className="mt-4 grid grid-cols-2 gap-6 border-y border-ink/10 py-6 sm:grid-cols-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ))}
            </div>
            <Skeleton className="mt-2 h-[54px] w-56 rounded-sm" />
          </div>
        </div>
      </main>
    </SkeletonScreen>
  );
}
```

- [ ] **Step 4: Ajuster `app/(public)/ressources/loading.tsx`** — dans le bloc tableau, remplacer
  `Array.from({ length: 6 })` (en-tête) par `Array.from({ length: 5 })`, et dans chaque ligne
  simulée, retirer un des deux `<Skeleton className="h-4 flex-1" />` (il n'y a plus que
  Couverture/Titre/Catégorie/Pages/Action, 5 colonnes au lieu de 6).

- [ ] **Step 5: Supprimer les anciennes routes**

```bash
git rm -r "app/(public)/ressources/[slug]"
```

- [ ] **Step 6: Verifier le build et le typecheck**

Run: `pnpm run typecheck && pnpm run build`
Expected: PASS (le build echouera si un import vers `features/ressources` ou
`components/features/ressources` subsiste — normal tant que la Task 12 n'a pas nettoye les anciens
fichiers ; si des erreurs d'import apparaissent uniquement depuis les anciens fichiers
`ressources/*`, c'est attendu a ce stade, verifier qu'aucune ne vient des nouveaux fichiers
`librairie/*`).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(librairie): brancher les pages publiques sur l'API, renommer [slug] en [id]"
```

---

## Task 12: Nettoyage de l'ancien feature statique

**Files:**
- Delete: `features/ressources/` (types, data, lib)
- Delete: `components/features/ressources/` (tous les fichiers)

**Interfaces:** Aucune — suppression pure, plus aucun fichier de ce plan n'y fait référence après
la Task 11.

- [ ] **Step 1: Verifier qu'aucun import ne reste**

Run: `grep -rn "features/ressources\|features/librairie-legacy\|components/features/ressources" app components features --include=*.ts --include=*.tsx`
Expected: aucune sortie (aucune référence restante).

- [ ] **Step 2: Supprimer**

```bash
git rm -r features/ressources components/features/ressources
```

- [ ] **Step 3: Verification complete**

Run: `pnpm run typecheck && pnpm run lint && pnpm run test`
Expected: PASS sur les trois commandes.

- [ ] **Step 4: Commit**

```bash
git commit -m "chore(librairie): supprimer l'ancien catalogue statique features/ressources"
```

---

## Task 13: Vérification manuelle

Pas de fichier modifié — vérification humaine/chrome-devtools avant de considérer le plan terminé.

- [ ] **Step 1: Lancer le serveur de dev**

Run: `pnpm run dev`

- [ ] **Step 2: Vérifier `/ressources`**

Ouvrir `/ressources` en clair et sombre, desktop et mobile : la liste des vrais documents
s'affiche (ou un état vide propre s'il n'y en a aucun côté backend), recherche, filtre catégorie,
tri (3 modes), pagination si plus de 9 résultats, bouton aperçu ouvre l'overlay avec Échap qui le
ferme.

- [ ] **Step 3: Vérifier `/ressources/[id]`**

Cliquer un document depuis le catalogue : la fiche détail affiche titre/description/catégorie/pages
(si présent), le bouton de téléchargement pointe vers l'URL réelle du fichier, les ressources liées
s'affichent.

- [ ] **Step 4: `convention-drift-check`**

Lancer l'agent `convention-drift-check` sur le diff complet avant de considérer le plan terminé.
