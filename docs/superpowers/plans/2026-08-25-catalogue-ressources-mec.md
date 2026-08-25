# Plan — Refonte du catalogue /ressources (grille → tableau)

> **Pour un exécutant agentique :** ce plan est conçu pour être suivi en session directe (édition
> immédiate + vérification), comme les deux plans précédents de cette session
> (`2026-08-24-theme-sombre-mec.md`, `2026-08-25-pages-systeme-mec.md`). Hors de cette session,
> utiliser `superpowers:executing-plans` ou `superpowers:subagent-driven-development`.

**Goal:** Remplacer la grille de cartes `/ressources` par un tableau desktop (avec cartes en repli
mobile), des filtres format/accès en plus du thème/recherche existants, un tri, une pagination, et
un aperçu plein écran — sans toucher au backend ni à la page détail.

**Architecture:** Décomposition de l'actuel `ressource-filter.tsx` (106 lignes) en un orchestrateur
client (`ressource-catalog.tsx`) qui pilote l'état filtre/tri/page et rend en parallèle un tableau
desktop (`ressource-table.tsx`, `hidden`/`lg:table`) et la grille `RessourceCard` existante en repli
mobile (`lg:hidden`), les deux consommant la même page de la même liste filtrée/triée. Le tri est
extrait en fonction pure testable (`sort-ressources.ts`).

**Tech Stack:** React 19 (Server/Client Components), Tailwind v4, TypeScript strict, vitest.

**Spec:** `docs/superpowers/specs/2026-08-25-catalogue-ressources-mec-design.md`

## Global Constraints

- Kebab-case partout, fichiers ≤200 lignes sauf nécessité réelle documentée (`CLAUDE.md`).
- Aucune donnée dynamique/backend : tout reste statique dans
  `features/ressources/data/ressources.ts` (spec, décision validée avec l'utilisateur).
- Le tag "accès" (`Public`/`Adhérents`) est purement informatif — aucune logique d'auth/gate.
- Tableau desktop (`lg`+) / cartes en repli mobile, **même page courante** pour les deux vues.
- L'overlay d'aperçu affiche un placeholder + lien vers la fiche détail, pas de vrai feuilletage
  page par page.
- La page détail `/ressources/[slug]` (`ressource-header.tsx`/`ressource-body.tsx`/
  `download-dialog.tsx`) n'est pas modifiée par ce plan.
- `convention-drift-check` obligatoire sur le diff avant tout commit (`CLAUDE.md`).

---

## 1. Modèle de données

- [x] **Étendre le type `Ressource`** dans `features/ressources/types/ressource.ts` :

```ts
export type Theme =
  "Droits et devoirs" | "Vote et élections" | "Désinformation" | "Institutions" | "Vie de club";

export type Format = "PDF" | "DOCX" | "PNG";

export type Acces = "Public" | "Adhérents";

export type Ressource = {
  slug: string;
  title: string;
  theme: Theme;
  format: Format;
  acces: Acces;
  pages: number;
  weight: string;
  date: string;
  downloads: number;
  excerpt: string;
  body: string;
};
```

- [x] **Ajouter `format`/`acces` aux 9 entrées de `RESSOURCES`** dans
      `features/ressources/data/ressources.ts`, et exporter `FORMATS`/`ACCES_VALUES` juste après
      l'export existant de `THEMES` :

```ts
export const FORMATS: Format[] = ["PDF", "DOCX", "PNG"];
export const ACCES_VALUES: Acces[] = ["Public", "Adhérents"];
```

  Valeurs par guide (import `Format`/`Acces` en tête de fichier à ajouter à côté de l'import
  `Ressource, Theme` existant) :

  | slug | format | acces |
  | --- | --- | --- |
  | g1 | `"PDF"` | `"Public"` |
  | g2 | `"PDF"` | `"Public"` |
  | g3 | `"PDF"` | `"Adhérents"` |
  | g4 | `"PDF"` | `"Public"` |
  | g5 | `"PDF"` | `"Public"` |
  | g6 | `"DOCX"` | `"Adhérents"` |
  | g7 | `"PNG"` | `"Public"` |
  | g8 | `"PDF"` | `"Public"` |
  | g9 | `"PDF"` | `"Public"` |

  (g3 = guide encadreur remis en formation, g6 = trame de séance éditable, g7 = infographie image —
  ces trois choix justifient naturellement les valeurs non-`"PDF"`/non-`"Public"` demandées par la
  spec, pas de contrainte narrative au-delà.)

- [x] **Vérifier** : `pnpm run typecheck` — doit passer sans erreur (aucune ressource ne doit
      manquer `format`/`acces`, sinon TypeScript le signale immédiatement sur la déclaration du
      littéral `RESSOURCES`).

## 2. Logique de tri (TDD)

- [x] **Écrire le test qui échoue** dans `features/ressources/lib/sort-ressources.test.ts` (le
      fichier `sort-ressources.ts` n'existe pas encore) :

```ts
import { describe, expect, it } from "vitest";
import { sortRessources } from "./sort-ressources";
import type { Ressource } from "@/features/ressources/types/ressource";

const base: Omit<Ressource, "slug" | "title" | "date" | "downloads" | "pages"> = {
  theme: "Institutions",
  format: "PDF",
  acces: "Public",
  weight: "1 Mo",
  excerpt: "",
  body: "",
};

const items: Ressource[] = [
  { ...base, slug: "a", title: "Bravo", date: "01/01/2026", downloads: 100, pages: 20 },
  { ...base, slug: "b", title: "Alpha", date: "15/03/2026", downloads: 500, pages: 5 },
  { ...base, slug: "c", title: "Charlie", date: "10/02/2026", downloads: 10, pages: 40 },
];

describe("sortRessources", () => {
  it('trie par date décroissante pour "recent"', () => {
    expect(sortRessources(items, "recent").map((r) => r.slug)).toEqual(["b", "c", "a"]);
  });

  it('trie par titre alphabétique pour "az"', () => {
    expect(sortRessources(items, "az").map((r) => r.slug)).toEqual(["b", "a", "c"]);
  });

  it('trie par téléchargements décroissants pour "downloads"', () => {
    expect(sortRessources(items, "downloads").map((r) => r.slug)).toEqual(["b", "a", "c"]);
  });

  it('trie par nombre de pages décroissant pour "pages"', () => {
    expect(sortRessources(items, "pages").map((r) => r.slug)).toEqual(["c", "a", "b"]);
  });

  it("ne mute pas le tableau d'entrée", () => {
    const copy = [...items];
    sortRessources(items, "az");
    expect(items).toEqual(copy);
  });
});
```

- [x] **Lancer les tests, vérifier l'échec** : `pnpm run test` → échoue avec "Cannot find module
      './sort-ressources'".

- [x] **Implémenter** `features/ressources/lib/sort-ressources.ts` :

```ts
import type { Ressource } from "@/features/ressources/types/ressource";

export type SortKey = "recent" | "az" | "downloads" | "pages";

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "recent", label: "Plus récents" },
  { value: "az", label: "A → Z" },
  { value: "downloads", label: "Plus téléchargés" },
  { value: "pages", label: "Nombre de pages" },
];

function parseFrenchDate(date: string): number {
  const [day, month, year] = date.split("/").map(Number);
  return new Date(year, month - 1, day).getTime();
}

/** Trie une copie de `list` — l'ordre du tableau `RESSOURCES` n'est pas chronologique, donc
 * "recent" doit comparer les dates explicitement plutôt que se reposer sur l'ordre d'entrée. */
export function sortRessources(list: Ressource[], sort: SortKey): Ressource[] {
  const sorted = [...list];
  switch (sort) {
    case "recent":
      return sorted.sort((a, b) => parseFrenchDate(b.date) - parseFrenchDate(a.date));
    case "az":
      return sorted.sort((a, b) => a.title.localeCompare(b.title, "fr"));
    case "downloads":
      return sorted.sort((a, b) => b.downloads - a.downloads);
    case "pages":
      return sorted.sort((a, b) => b.pages - a.pages);
    default:
      return sorted;
  }
}
```

- [x] **Lancer les tests, vérifier le succès** : `pnpm run test` → 5/5 passent dans
      `sort-ressources.test.ts`.

## 3. `ressource-card.tsx` — badge format (édition mineure)

- [x] Ajouter un badge format en haut à droite de la miniature, à côté du badge thème existant en
      bas à gauche (fichier `components/features/ressources/ressource-card.tsx`) :

```tsx
<div className="relative">
  <PhotoPlaceholder ratio="3/4" label="Couverture à fournir" />
  <span className="absolute top-3 right-3 inline-flex items-center rounded-full bg-surface-card px-2.5 py-1 text-[10px] font-semibold tracking-wide text-text-muted uppercase">
    {ressource.format}
  </span>
  <span className="absolute bottom-3 left-3 inline-flex items-center rounded-full bg-ink px-3 py-1 text-[11px] font-semibold tracking-wide text-surface-page uppercase">
    {ressource.theme}
  </span>
</div>
```

  Reste du fichier inchangé (le composant est utilisé tel quel par `related-ressources.tsx`, aucune
  prop supplémentaire n'est nécessaire — `ressource.format` existe déjà sur toutes les données
  depuis l'étape 1).

- [x] **Vérifier** : `pnpm run typecheck` + `pnpm run lint` passent.

## 4. `ressource-toolbar.tsx` (nouveau)

- [x] Créer `components/features/ressources/ressource-toolbar.tsx` — reprend la recherche et les
      pastilles thème telles quelles depuis l'actuel `ressource-filter.tsx`, ajoute les selects
      format/accès/tri. Entièrement contrôlé par props (aucun état local) :

```tsx
"use client";

import { Search } from "lucide-react";
import type { Theme, Format, Acces } from "@/features/ressources/types/ressource";
import { THEMES, FORMATS, ACCES_VALUES } from "@/features/ressources/data/ressources";
import { SORT_OPTIONS, type SortKey } from "@/features/ressources/lib/sort-ressources";
import { SelectInput } from "@/components/features/site/form-controls";

export const ALL_THEMES = "Tous les thèmes" as const;
export const ALL_FORMATS = "Tous les formats" as const;
export const ALL_ACCES = "Tous les accès" as const;

export type ThemeFilter = Theme | typeof ALL_THEMES;
export type FormatFilter = Format | typeof ALL_FORMATS;
export type AccesFilter = Acces | typeof ALL_ACCES;

export function RessourceToolbar({
  query,
  onQueryChange,
  theme,
  onThemeChange,
  format,
  onFormatChange,
  acces,
  onAccesChange,
  sort,
  onSortChange,
  resultCount,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  theme: ThemeFilter;
  onThemeChange: (value: ThemeFilter) => void;
  format: FormatFilter;
  onFormatChange: (value: FormatFilter) => void;
  acces: AccesFilter;
  onAccesChange: (value: AccesFilter) => void;
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
            onClick={() => onThemeChange(ALL_THEMES)}
            className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide uppercase transition-colors ${
              theme === ALL_THEMES
                ? "bg-ink text-surface-page"
                : "bg-n-100 text-text-body hover:bg-n-200"
            }`}
          >
            {ALL_THEMES}
          </button>
          {THEMES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onThemeChange(t)}
              className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide uppercase transition-colors ${
                theme === t ? "bg-ink text-surface-page" : "bg-n-100 text-text-body hover:bg-n-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <SelectInput
          aria-label="Filtrer par format"
          value={format}
          onChange={(e) => onFormatChange(e.target.value as FormatFilter)}
        >
          <option value={ALL_FORMATS}>{ALL_FORMATS}</option>
          {FORMATS.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </SelectInput>

        <SelectInput
          aria-label="Filtrer par accès"
          value={acces}
          onChange={(e) => onAccesChange(e.target.value as AccesFilter)}
        >
          <option value={ALL_ACCES}>{ALL_ACCES}</option>
          {ACCES_VALUES.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </SelectInput>

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

        <span className="ml-auto text-[13px] text-text-muted">
          {resultCount} {resultCount > 1 ? "guides" : "guide"}
        </span>
      </div>
    </div>
  );
}
```

  Note : `SelectInput` (`components/features/site/form-controls.tsx`) impose déjà sa propre
  hauteur/style (`h-11 ${inputClass}`) et ignore tout `className` qu'on lui passerait (le composant
  l'écrase) — ne pas essayer de le personnaliser ici, l'utiliser tel quel comme partout ailleurs
  dans le site (formulaire de contact, etc.).

- [x] **Vérifier** : `pnpm run typecheck` + `pnpm run lint` passent (le composant n'est pas encore
      monté nulle part, donc pas de vérification visuelle à ce stade).

## 5. `ressource-table.tsx` (nouveau)

- [x] Créer `components/features/ressources/ressource-table.tsx` :

```tsx
import Link from "next/link";
import type { Ressource } from "@/features/ressources/types/ressource";
import { PhotoPlaceholder } from "@/components/features/site/photo-placeholder";
import { formatCount } from "@/features/ressources/lib/format-count";

export function RessourceTable({
  ressources,
  onPreview,
}: {
  ressources: Ressource[];
  onPreview: (slug: string) => void;
}) {
  return (
    <table className="hidden w-full border-collapse text-sm lg:table">
      <thead>
        <tr className="border-b border-ink/10 text-left text-[11px] font-semibold tracking-wide text-text-muted uppercase">
          <th className="w-20 py-3 pr-4 font-semibold">Couverture</th>
          <th className="py-3 pr-4 font-semibold">Titre</th>
          <th className="py-3 pr-4 font-semibold">Thème</th>
          <th className="py-3 pr-4 font-semibold">Format</th>
          <th className="py-3 pr-4 font-semibold">Accès</th>
          <th className="py-3 pr-4 font-semibold">Téléchargements</th>
          <th className="py-3 pr-4 font-semibold">
            <span className="sr-only">Aperçu</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {ressources.map((ressource) => (
          <tr key={ressource.slug} className="border-b border-ink/10 align-middle">
            <td className="py-3 pr-4">
              <PhotoPlaceholder ratio="3/4" label="Couverture" className="w-14" />
            </td>
            <td className="py-3 pr-4">
              <Link
                href={`/ressources/${ressource.slug}`}
                className="font-semibold text-ink transition-colors hover:text-orange-700"
              >
                {ressource.title}
              </Link>
              <p className="mt-1 line-clamp-1 text-xs text-text-muted">{ressource.excerpt}</p>
            </td>
            <td className="py-3 pr-4 text-text-muted">{ressource.theme}</td>
            <td className="py-3 pr-4 text-text-muted">{ressource.format}</td>
            <td className="py-3 pr-4 text-text-muted">{ressource.acces}</td>
            <td className="py-3 pr-4 text-text-muted">{formatCount(ressource.downloads)}</td>
            <td className="py-3 pr-4 text-right">
              <button
                type="button"
                onClick={() => onPreview(ressource.slug)}
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

- [x] **Vérifier** : `pnpm run typecheck` + `pnpm run lint` passent.

## 6. `ressource-preview-overlay.tsx` (nouveau)

- [x] Créer `components/features/ressources/ressource-preview-overlay.tsx` — même patron que
      `download-dialog.tsx` (scrim, `role="dialog"`, fermeture Échap, focus renvoyé à la fermeture) :

```tsx
"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import type { Ressource } from "@/features/ressources/types/ressource";
import { PhotoPlaceholder } from "@/components/features/site/photo-placeholder";

export function RessourcePreviewOverlay({
  ressource,
  onClose,
}: {
  ressource: Ressource;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-overlay-scrim p-5"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ressource-preview-title"
        className="relative grid w-full max-w-[640px] grid-cols-1 gap-6 rounded-md border border-ink bg-surface-card p-7 shadow-stamp sm:grid-cols-[200px_1fr]"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Fermer l'aperçu"
          className="absolute top-4 right-4 grid h-8 w-8 place-items-center rounded-full text-text-muted transition-colors hover:bg-n-100"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>

        <PhotoPlaceholder ratio="3/4" label="Couverture à fournir" />

        <div className="flex flex-col gap-3">
          <span className="text-[11px] font-semibold tracking-wide text-text-muted uppercase">
            {ressource.theme}
          </span>
          <h2 id="ressource-preview-title" className="text-xl font-semibold text-ink">
            {ressource.title}
          </h2>
          <p className="text-sm leading-relaxed text-text-muted">{ressource.excerpt}</p>
          <div className="flex flex-wrap gap-3 text-xs text-text-muted">
            <span>{ressource.format}</span>
            <span>·</span>
            <span>{ressource.pages} p.</span>
            <span>·</span>
            <span>{ressource.weight}</span>
            <span>·</span>
            <span>{ressource.acces}</span>
          </div>
          <Link
            href={`/ressources/${ressource.slug}`}
            className="mt-2 inline-flex h-11 w-fit items-center rounded-sm bg-orange-500 px-6 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
          >
            Voir la fiche complète →
          </Link>
        </div>
      </div>
    </div>
  );
}
```

- [x] **Vérifier** : `pnpm run typecheck` + `pnpm run lint` passent.

## 7. `ressource-pagination.tsx` (nouveau)

- [x] Créer `components/features/ressources/ressource-pagination.tsx` — présentationnel pur, pas de
      troncature/ellipse (le catalogue actuel tient sur une page ; à revisiter seulement si le
      nombre de pages devient réellement gênant) :

```tsx
export function RessourcePagination({
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

- [x] **Vérifier** : `pnpm run typecheck` + `pnpm run lint` passent.

## 8. `ressource-catalog.tsx` (orchestrateur) + branchement + suppression de l'ancien filtre

- [x] Créer `components/features/ressources/ressource-catalog.tsx` :

```tsx
"use client";

import { useMemo, useState } from "react";
import type { Ressource } from "@/features/ressources/types/ressource";
import { sortRessources, type SortKey } from "@/features/ressources/lib/sort-ressources";
import {
  RessourceToolbar,
  ALL_THEMES,
  ALL_FORMATS,
  ALL_ACCES,
  type ThemeFilter,
  type FormatFilter,
  type AccesFilter,
} from "@/components/features/ressources/ressource-toolbar";
import { RessourceTable } from "@/components/features/ressources/ressource-table";
import { RessourceCard } from "@/components/features/ressources/ressource-card";
import { RessourcePagination } from "@/components/features/ressources/ressource-pagination";
import { RessourcePreviewOverlay } from "@/components/features/ressources/ressource-preview-overlay";

const PAGE_SIZE = 9;

export function RessourceCatalog({ ressources }: { ressources: Ressource[] }) {
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState<ThemeFilter>(ALL_THEMES);
  const [format, setFormat] = useState<FormatFilter>(ALL_FORMATS);
  const [acces, setAcces] = useState<AccesFilter>(ALL_ACCES);
  const [sort, setSort] = useState<SortKey>("recent");
  const [page, setPage] = useState(1);
  const [previewSlug, setPreviewSlug] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matches = ressources.filter((r) => {
      const matchesTheme = theme === ALL_THEMES || r.theme === theme;
      const matchesFormat = format === ALL_FORMATS || r.format === format;
      const matchesAcces = acces === ALL_ACCES || r.acces === acces;
      const matchesQuery =
        !needle ||
        r.title.toLowerCase().includes(needle) ||
        r.excerpt.toLowerCase().includes(needle) ||
        r.theme.toLowerCase().includes(needle);
      return matchesTheme && matchesFormat && matchesAcces && matchesQuery;
    });
    return sortRessources(matches, sort);
  }, [ressources, theme, format, acces, query, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const previewRessource = ressources.find((r) => r.slug === previewSlug) ?? null;

  const handleThemeChange = (value: ThemeFilter) => {
    setTheme(value);
    setPage(1);
  };
  const handleFormatChange = (value: FormatFilter) => {
    setFormat(value);
    setPage(1);
  };
  const handleAccesChange = (value: AccesFilter) => {
    setAcces(value);
    setPage(1);
  };
  const handleQueryChange = (value: string) => {
    setQuery(value);
    setPage(1);
  };

  const clearFilters = () => {
    setTheme(ALL_THEMES);
    setFormat(ALL_FORMATS);
    setAcces(ALL_ACCES);
    setQuery("");
    setPage(1);
  };

  return (
    <>
      <RessourceToolbar
        query={query}
        onQueryChange={handleQueryChange}
        theme={theme}
        onThemeChange={handleThemeChange}
        format={format}
        onFormatChange={handleFormatChange}
        acces={acces}
        onAccesChange={handleAccesChange}
        sort={sort}
        onSortChange={setSort}
        resultCount={filtered.length}
      />

      {pageItems.length ? (
        <>
          <RessourceTable ressources={pageItems} onPreview={setPreviewSlug} />
          <div className="mt-9 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:hidden">
            {pageItems.map((ressource) => (
              <RessourceCard key={ressource.slug} ressource={ressource} />
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

      <RessourcePagination page={currentPage} totalPages={totalPages} onChange={setPage} />

      {previewRessource ? (
        <RessourcePreviewOverlay
          ressource={previewRessource}
          onClose={() => setPreviewSlug(null)}
        />
      ) : null}
    </>
  );
}
```

- [x] **Brancher dans la page** — `app/(public)/ressources/page.tsx` :

```tsx
import { RessourcesHero } from "@/components/features/ressources/hero";
import { RessourceCatalog } from "@/components/features/ressources/ressource-catalog";
import { RessourceCta } from "@/components/features/ressources/ressource-cta";
import { RESSOURCES } from "@/features/ressources/data/ressources";

export default function RessourcesPage() {
  return (
    <main>
      <RessourcesHero />
      <div className="mx-auto max-w-[1280px] px-5 pb-14 sm:px-8 sm:pb-18 lg:px-16 lg:pb-24">
        <RessourceCatalog ressources={RESSOURCES} />
      </div>
      <RessourceCta />
    </main>
  );
}
```

- [x] **Supprimer** `components/features/ressources/ressource-filter.tsx` (son contenu est
      redistribué entre `ressource-catalog.tsx` et `ressource-toolbar.tsx`, plus aucun import ne le
      référence après le branchement ci-dessus).

- [x] **Vérifier** : `pnpm run typecheck`, `pnpm run lint`, `pnpm run test` — tous verts.

  (Pas de commit automatique ici — comme pour les deux plans précédents de cette session, le commit
  reste une action manuelle demandée explicitement par l'utilisateur, jamais déclenchée par
  l'exécution du plan elle-même.)

## 9. Vérification finale

- [x] `pnpm run dev`, puis via chrome-devtools (clair + sombre, desktop ≥1024px + mobile ~390px) :
  - Le tableau s'affiche en desktop, la grille de cartes en mobile (même contenu, même page).
  - Filtre thème, puis format, puis accès (cumulés) → le compteur "N guides" et la liste se
    mettent à jour ; changer un filtre revient à la page 1.
  - Recherche texte sur titre/extrait/thème.
  - Chaque option de tri (récent/A→Z/plus téléchargés/pages) change effectivement l'ordre affiché.
  - "Aucun guide ne correspond" + "Effacer les filtres" fonctionne toujours en combinant des
    filtres qui ne matchent rien.
  - Pagination : avec 9 ressources et `PAGE_SIZE = 9`, une seule page s'affiche et
    `RessourcePagination` ne rend rien (`totalPages <= 1`) — vérifier que rien ne casse dans ce cas
    (pas de bloc vide visible).
  - Overlay "Aperçu" (desktop uniquement) : ouverture au clic, fermeture Échap, fermeture clic sur
    le fond, fermeture bouton, focus renvoyé correctement.
  - `/ressources/[slug]` (page détail) inchangée et toujours fonctionnelle.
  - `/admin` non affecté (aucun fichier admin touché par ce plan).
- [x] `convention-drift-check` sur l'ensemble du diff de la fonctionnalité.
- [x] Mettre à jour ce plan avec les `[x]` et une section "Écarts vs la spec initiale" si des
      ajustements sont apparus pendant l'implémentation (même patron que les deux plans précédents).

## Écarts vs la spec initiale (découverts pendant l'implémentation)

- **Défauts trouvés par la revue finale de branche (opus)**, tous deux réels et corrigés avant
  clôture (commit `90d0ad1`) :
  - `PhotoPlaceholder ratio="3/4" className="w-14"` (miniature de couverture du tableau) rendait
    cassé — l'icône et le libellé "COUVERTURE" débordaient du `p-6` interne fixe à 56px de large et
    étaient rognés par `overflow-hidden`. Corrigé en ajoutant un mode `compact?: boolean` à
    `PhotoPlaceholder` (`components/features/site/photo-placeholder.tsx`) qui saute le bloc icône/
    libellé et pose `role="img"`/`aria-label` à la place — additif, aucun des 12 autres usages du
    composant dans le repo n'est affecté.
  - L'overlay d'aperçu ne renvoyait jamais le focus au bouton "Aperçu" déclencheur à la fermeture
    (retombait sur `<body>`), alors que la spec l'exige explicitement. Le `useEffect` unique du plan
    ci-dessus (§6) a été scindé en deux effets dans l'implémentation finale : un premier en deps
    vides `[]` qui capture `document.activeElement` à l'ouverture et le restaure au démontage, un
    second en deps `[onClose]` pour l'écouteur Échap seul — la fusion en un seul effet aurait
    redéclenché la restauration à chaque re-rendu du parent tant que l'overlay reste ouvert.
- **Écart avec la spec, introduit par ce plan lui-même** (pas une erreur d'implémentation) : le
  code de l'orchestrateur ci-dessus (§8) câblait `onSortChange={setSort}` directement, sans
  réinitialiser `page` à 1 — alors que la spec (§ Comportement filtre/tri/pagination) exige la
  réinitialisation "quand un filtre ou le tri change". Corrigé par un `handleSortChange` symétrique
  aux 4 autres handlers de filtre. Sans impact observable avec les 9 ressources actuelles (1 seule
  page), mais la divergence spec/code aurait été trompeuse pour la croissance future du catalogue.
- **Écarts de fidélité à la maquette originale signalés par l'utilisateur en cours de revue finale**
  (la spec de cette session avait sous-spécifié ces détails visuels — un agent design-fidelity-
  checker a relu le HTML source exact de l'état `isRessources` dans `Site MEC.dc.html` pour obtenir
  les valeurs exactes) :
  - Colonne Thème : la maquette utilise `color: var(--blue-600)`, majuscules, `font-weight:600`,
    letter-spacing — le tableau livré par §5 ci-dessus utilisait du texte gris plat
    (`text-text-muted`). Corrigé en `text-[0.75rem] font-semibold tracking-wide text-blue-600
    uppercase` (token déjà existant, s'adapte déjà au mode sombre).
  - Colonne Format : la maquette combine format + nombre de pages + poids en une seule chaîne (ex.
    "PDF · 48 pages · 3,2 Mo"), pas le code format seul. Corrigé en conséquence — aucune nouvelle
    donnée requise (`pages`/`weight` existaient déjà sur `Ressource`).
  - En-tête de colonnes : constat surprenant — **la maquette originale n'a en fait aucune ligne
    d'en-têtes par colonne** (structure `data-cataloguehaut` = libellé du thème courant + "Affichage
    X sur Y", bordure basse 2px). Le `<thead>` du plan §5 est une invention de cette session, pas
    issue de la maquette. Question posée à l'utilisateur (AskUserQuestion) : garder un en-tête
    visible (accessibilité/UX standard pour un tableau de données) ou suivre la maquette à la
    lettre (pas d'en-tête, juste la barre de section). **Décision : garder l'en-tête.** Le vrai bug
    corrigé était ailleurs : `<table>` n'avait aucune marge au-dessus (`lg:table` seul), donc l'en-
    tête se retrouvait visuellement caché sous la barre de filtres sticky dès qu'elle s'épinglait en
    scroll — corrigé en ajoutant `lg:mt-9`.
  - Différé (non corrigé, noté pour référence future) : la maquette utilise aussi un badge coloré
    pour la colonne Accès (`Tag` orange pour "Adhérents", neutre pour "Public") au lieu du texte
    plat actuel — même famille d'écart que la colonne Thème, mais non signalé par l'utilisateur et
    hors scope du fix wave de clôture.
- **Process (SDD)** : sur les 10 dispatches d'implémenteur de ce plan, 3 ont enfreint la contrainte
  explicite "tu ne dispatches jamais de sous-agent" en lançant spontanément un sous-agent
  convention-drift-check pendant leur auto-revue (aucun impact sur le code livré dans les 3 cas —
  vérifié indépendamment à chaque fois). Le 4e a respecté la contrainte. Comportement à surveiller
  si le pattern se reproduit sur de futurs plans utilisant l'agent `frontend-implementer`.
