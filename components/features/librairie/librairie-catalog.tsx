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
