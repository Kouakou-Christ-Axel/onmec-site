import Link from "next/link";
import type { PublicLibrairieDocument } from "@/features/librairie/types/document";
import type { SortKey } from "@/features/librairie/lib/sort-documents";
import { LibrairieToolbar } from "@/components/features/librairie/librairie-toolbar";
import { LibrairieDocumentList } from "@/components/features/librairie/librairie-document-list";
import { RessourcesCatalogPagination } from "@/components/features/librairie/ressources-catalog-pagination";

interface LibrairieCatalogProps {
  /** Documents de la page courante uniquement — le découpage se fait côté serveur (voir page.tsx). */
  documents: PublicLibrairieDocument[];
  categories: string[];
  categorieActive?: string;
  sort: SortKey;
  query: string;
  /** Nombre de documents correspondant aux filtres actifs, toutes pages confondues. */
  resultCount: number;
  /** Le catalogue complet (sans filtre) est-il vide ? Distingue "rien à afficher" de "0 résultat". */
  catalogueVide: boolean;
  page: number;
  totalPages: number;
}

/**
 * Composant serveur : filtres, tri et pagination passent par l'URL (`searchParams`), plus de
 * `useState`. Seule l'ouverture de l'aperçu (`LibrairieDocumentList`) reste côté client. Voir
 * `news-list.tsx` pour le même patron sur `/actualites`.
 */
export function LibrairieCatalog({
  documents,
  categories,
  categorieActive,
  sort,
  query,
  resultCount,
  catalogueVide,
  page,
  totalPages,
}: LibrairieCatalogProps) {
  const hasActiveFilters = Boolean(categorieActive || query);

  return (
    <>
      <h2 className="sr-only">Catalogue des ressources pédagogiques</h2>
      <LibrairieToolbar
        query={query}
        categorie={categorieActive}
        categories={categories}
        sort={sort}
        resultCount={resultCount}
      />

      {documents.length ? (
        <LibrairieDocumentList documents={documents} />
      ) : catalogueVide ? (
        <div className="mt-9 flex flex-col items-start gap-3 rounded-md border border-dashed border-ink/20 bg-surface-card p-8">
          <p className="text-lg font-semibold text-ink">
            Aucun document n&apos;est disponible pour le moment.
          </p>
        </div>
      ) : (
        <div className="mt-9 flex flex-col items-start gap-3 rounded-md border border-dashed border-ink/20 bg-surface-card p-8">
          <p className="text-lg font-semibold text-ink">Aucun guide ne correspond.</p>
          <p className="text-sm text-text-muted">
            Essayez un autre mot-clé ou revenez à tous les filtres.
          </p>
          {hasActiveFilters ? (
            <Link
              href="/ressources"
              className="mt-1 inline-flex h-10 items-center rounded-sm border border-ink/24 px-5 text-sm font-semibold text-ink transition-colors hover:bg-n-100"
            >
              Effacer les filtres
            </Link>
          ) : null}
        </div>
      )}

      <RessourcesCatalogPagination
        page={page}
        totalPages={totalPages}
        categorie={categorieActive}
        query={query}
        sort={sort}
      />
    </>
  );
}
