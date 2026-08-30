import { cache } from "react";
import type { Metadata } from "next";
import { LibrairieHero } from "@/components/features/librairie/librairie-hero";
import { LibrairieCatalog } from "@/components/features/librairie/librairie-catalog";
import { LibrairieCta } from "@/components/features/librairie/librairie-cta";
import { listLibrairiePublic } from "@/features/librairie/requests/list-librairie-public";
import { listLibrairieCategories } from "@/features/librairie/requests/list-librairie-categories";
import { sortDocuments, type SortKey } from "@/features/librairie/lib/sort-documents";
import { buildRessourcesHref } from "@/components/features/librairie/librairie-href";
import type { PublicLibrairieDocument } from "@/features/librairie/types/document";

const PAGE_SIZE = 9;

interface RessourcesPageProps {
  searchParams: Promise<{ categorie?: string; page?: string; q?: string; sort?: string }>;
}

function isSortKey(value: string | undefined): value is SortKey {
  return value === "recent" || value === "az" || value === "pages";
}

// Mémoïsés avec React.cache : generateMetadata et la page appellent chacun ces deux requêtes sans
// argument dans le même rendu. Next dédoublonne les fetch identiques nativement, mais vinext est
// une réimplémentation — cette parité n'est pas garantie (même précaution que
// `actualites/[slug]/page.tsx:16`, vérifiée empiriquement nécessaire ici : sans cache() les 4
// appels backend non dédupliqués faisaient timeout la page en dev).
const getCatalog = cache(listLibrairiePublic);
const getCategories = cache(listLibrairieCategories);

/**
 * Filtre + trie + découpe le catalogue complet pour une page donnée. Le catalogue tient en un seul
 * appel (`CATALOG_LIMIT = 100`, voir `list-librairie-public.ts`), donc filtrage/tri/pagination se
 * font ici plutôt que côté API — appelé par `generateMetadata` et par le rendu, dédupliqués via
 * `getCatalog`/`getCategories` ci-dessus.
 */
async function resolveCatalogPage(searchParams: Awaited<RessourcesPageProps["searchParams"]>) {
  const { categorie, page, q, sort } = searchParams;
  const categorieActive = categorie && categorie.length > 0 ? categorie : undefined;
  const sortKey: SortKey = isSortKey(sort) ? sort : "recent";
  const query = q ?? "";

  const [{ data: documents, meta }, categories] = await Promise.all([
    getCatalog(),
    getCategories(),
  ]);

  const needle = query.trim().toLowerCase();
  const filtered = documents.filter((d: PublicLibrairieDocument) => {
    const matchesCategorie = !categorieActive || d.categorie === categorieActive;
    const matchesQuery =
      !needle ||
      d.title.toLowerCase().includes(needle) ||
      (d.description?.toLowerCase().includes(needle) ?? false);
    return matchesCategorie && matchesQuery;
  });
  const sorted = sortDocuments(filtered, sortKey);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageDemandee = Math.max(1, Number(page) || 1);
  const currentPage = Math.min(pageDemandee, totalPages);
  const pageItems = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return {
    pageItems,
    categories,
    categorieActive,
    sortKey,
    query,
    resultCount: sorted.length,
    catalogueVide: documents.length === 0,
    page: currentPage,
    totalPages,
    catalogTotal: meta.total,
  };
}

export async function generateMetadata({ searchParams }: RessourcesPageProps): Promise<Metadata> {
  const { categorieActive, page } = await resolveCatalogPage(await searchParams);

  return {
    title: "Bibliothèque de ressources pédagogiques",
    description:
      "Guides pédagogiques, fiches pratiques et documents de référence pour enseignants et éducateurs, classés par thématique et téléchargeables gratuitement.",
    alternates: {
      // Le tri et la recherche ne changent pas l'ensemble indexable, seulement l'ordre/le sous-
      // ensemble affiché : ils se canonicalisent vers la vue de base. Catégorie et page changent
      // réellement le contenu, donc chacune se canonicalise vers elle-même (page 2+ ne pointe
      // jamais vers /ressources).
      canonical: buildRessourcesHref({ categorie: categorieActive, page }),
    },
  };
}

export default async function RessourcesPage({ searchParams }: RessourcesPageProps) {
  const {
    pageItems,
    categories,
    categorieActive,
    sortKey,
    query,
    resultCount,
    catalogueVide,
    page,
    totalPages,
    catalogTotal,
  } = await resolveCatalogPage(await searchParams);

  return (
    <main>
      <LibrairieHero total={catalogTotal} categoriesCount={categories.length} />
      <div className="mx-auto max-w-[1280px] px-5 pb-14 sm:px-8 sm:pb-18 lg:px-16 lg:pb-24">
        <LibrairieCatalog
          documents={pageItems}
          categories={categories}
          categorieActive={categorieActive}
          sort={sortKey}
          query={query}
          resultCount={resultCount}
          catalogueVide={catalogueVide}
          page={page}
          totalPages={totalPages}
        />
      </div>
      <LibrairieCta />
    </main>
  );
}
