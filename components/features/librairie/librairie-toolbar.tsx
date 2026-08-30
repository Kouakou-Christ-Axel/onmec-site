import Link from "next/link";
import { Search } from "lucide-react";
import { SORT_OPTIONS, type SortKey } from "@/features/librairie/lib/sort-documents";
import { buildRessourcesHref } from "@/components/features/librairie/librairie-href";

const pillClass = (isActive: boolean) =>
  `inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide uppercase transition-colors duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring ${
    isActive ? "bg-ink text-surface-page" : "bg-n-100 text-text-body hover:bg-n-200"
  }`;

/**
 * Serveur : filtres, tri et recherche passent par l'URL (`<Link>` + formulaire GET natif), plus de
 * `useState`. Le champ de recherche reste utilisable sans JavaScript — un `<form method="GET">` se
 * soumet nativement à l'appui sur Entrée.
 */
export function LibrairieToolbar({
  query,
  categorie,
  categories,
  sort,
  resultCount,
}: {
  query: string;
  categorie?: string;
  categories: string[];
  sort: SortKey;
  resultCount: number;
}) {
  return (
    <div className="sticky top-[72px] z-40 border-b border-ink/10 bg-surface-blur py-4 backdrop-blur-sm">
      <div className="flex flex-wrap items-center gap-3">
        <form
          action="/ressources"
          method="GET"
          role="search"
          className="relative flex h-10 min-w-[220px] flex-1 items-center sm:flex-none sm:basis-[280px]"
        >
          <Search className="pointer-events-none absolute left-3 h-4 w-4 text-n-400" aria-hidden />
          <label htmlFor="ressources-search" className="sr-only">
            Rechercher un guide
          </label>
          <input
            id="ressources-search"
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Rechercher un guide"
            className="h-10 w-full rounded-full border border-ink/10 bg-surface-card pr-4 pl-9 text-sm text-ink outline-none placeholder:text-n-400 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/25"
          />
          {categorie ? <input type="hidden" name="categorie" value={categorie} /> : null}
          {sort !== "recent" ? <input type="hidden" name="sort" value={sort} /> : null}
        </form>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href={buildRessourcesHref({ q: query, sort })}
            aria-current={!categorie ? "page" : undefined}
            className={pillClass(!categorie)}
          >
            Toutes les catégories
          </Link>
          {categories.map((c) => (
            <Link
              key={c}
              href={buildRessourcesHref({ categorie: c, q: query, sort })}
              aria-current={categorie === c ? "page" : undefined}
              className={pillClass(categorie === c)}
            >
              {c}
            </Link>
          ))}
        </div>

        <div className="flex flex-none flex-wrap items-center gap-1.5">
          <span className="sr-only">Trier :</span>
          {SORT_OPTIONS.map((opt) => (
            <Link
              key={opt.value}
              href={buildRessourcesHref({ categorie, q: query, sort: opt.value })}
              aria-current={sort === opt.value ? "page" : undefined}
              className={pillClass(sort === opt.value)}
            >
              {opt.label}
            </Link>
          ))}
        </div>

        <span className="ml-auto text-[13px] text-text-muted">
          {resultCount} {resultCount > 1 ? "guides" : "guide"}
        </span>
      </div>
    </div>
  );
}
