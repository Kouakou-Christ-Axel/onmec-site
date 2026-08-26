import { listActualites } from "@/features/actualites/requests/list-actualites";
import { listCategoriesActualite } from "@/features/actualites/requests/list-categories-actualite";
import { NewsList } from "@/components/features/actualites/news-list";
import { NewsletterCta } from "@/components/features/actualites/newsletter-cta";

interface ActualitesPageProps {
  searchParams: Promise<{ categorie?: string; page?: string }>;
}

export default async function ActualitesPage({ searchParams }: ActualitesPageProps) {
  const { categorie, page } = await searchParams;
  const pageCourante = Math.max(1, Number(page) || 1);

  // Les deux appels sont indépendants : les lancer en parallèle plutôt qu'en cascade.
  const [liste, categories] = await Promise.all([
    listActualites({ page: pageCourante, categorie }),
    listCategoriesActualite(),
  ]);

  return (
    <main>
      <section className="border-b border-ink/10 bg-surface-card py-11 sm:py-14 lg:py-20">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-16">
          <div className="flex max-w-[760px] flex-col gap-4">
            <span className="text-xs font-semibold tracking-widest text-orange-700 uppercase">
              Actualités
            </span>
            <h1 className="text-5xl leading-none font-semibold tracking-tight text-ink sm:text-6xl">
              Ce que nous faisons,{" "}
              <em className="font-serif font-normal italic">semaine après semaine</em>
            </h1>
            <p className="max-w-[60ch] text-lg leading-relaxed text-text-muted">
              Comptes rendus d’activités, bilans, communiqués et annonces d’événements.
            </p>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-[1280px] px-5 pb-14 sm:px-8 sm:pb-20 lg:px-16 lg:pb-24">
        <NewsList
          articles={liste.data}
          categories={categories}
          meta={liste.meta}
          categorieActive={categorie}
        />
      </div>
      <NewsletterCta />
    </main>
  );
}
