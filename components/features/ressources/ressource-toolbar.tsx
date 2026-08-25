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
