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
  const handleSortChange = (value: SortKey) => {
    setSort(value);
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
        onSortChange={handleSortChange}
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

      <RessourcePreviewOverlay
        ressource={previewRessource ?? null}
        onClose={() => setPreviewSlug(null)}
      />
    </>
  );
}
