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
