import Link from "next/link";
import type { SortKey } from "@/features/librairie/lib/sort-documents";
import { buildRessourcesHref } from "@/components/features/librairie/librairie-href";

const navButtonClass =
  "inline-flex h-9 items-center rounded-sm border border-ink/24 px-3 text-sm font-semibold text-ink transition-colors hover:bg-n-100";
const navButtonDisabledClass =
  "inline-flex h-9 items-center rounded-sm border border-ink/24 px-3 text-sm font-semibold text-ink/40 pointer-events-none";

/**
 * Pagination du catalogue public `/ressources`, en vrais `<Link>` vers `?page=N` — pas le composant
 * `LibrairiePagination` générique (celui-ci est partagé par plusieurs tableaux d'admin pilotés par
 * un `onChange` client, ne pas le toucher ni le réutiliser ici).
 */
export function RessourcesCatalogPagination({
  page,
  totalPages,
  categorie,
  query,
  sort,
}: {
  page: number;
  totalPages: number;
  categorie?: string;
  query: string;
  sort: SortKey;
}) {
  if (totalPages <= 1) return null;

  const hrefFor = (p: number) => buildRessourcesHref({ categorie, q: query, sort, page: p });

  return (
    <nav
      aria-label="Pagination des ressources"
      className="mt-9 flex items-center justify-center gap-2"
    >
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className={navButtonClass}>
          Précédent
        </Link>
      ) : (
        <span aria-disabled="true" className={navButtonDisabledClass}>
          Précédent
        </span>
      )}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
        <Link
          key={n}
          href={hrefFor(n)}
          aria-current={n === page ? "page" : undefined}
          className={`inline-flex h-9 w-9 items-center justify-center rounded-sm text-sm font-semibold transition-colors ${
            n === page ? "bg-ink text-surface-page" : "text-ink hover:bg-n-100"
          }`}
        >
          {n}
        </Link>
      ))}
      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} className={navButtonClass}>
          Suivant
        </Link>
      ) : (
        <span aria-disabled="true" className={navButtonDisabledClass}>
          Suivant
        </span>
      )}
    </nav>
  );
}
