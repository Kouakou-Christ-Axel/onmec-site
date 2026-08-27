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
