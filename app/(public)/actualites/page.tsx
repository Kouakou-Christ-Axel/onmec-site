import type { Metadata } from "next";
import { listActualites } from "@/features/actualites/requests/list-actualites";
import { listCategoriesActualite } from "@/features/actualites/requests/list-categories-actualite";
import { NewsList } from "@/components/features/actualites/news-list";
import { NewsletterCta } from "@/components/features/actualites/newsletter-cta";

interface ActualitesPageProps {
  searchParams: Promise<{ categorie?: string; page?: string }>;
}

// generateMetadata plutôt qu'un `export const metadata` statique : la page se pagine et se
// filtre par `searchParams` (?categorie=&page=N) sans changer de route. Un canonical statique sur
// `/actualites` ferait pointer chaque page 2+ vers la page 1, qui sortirait alors de l'index
// (voir audit SEO §2.3 : « /actualites?page=2 doit se canonicaliser vers lui-même »).
export async function generateMetadata({ searchParams }: ActualitesPageProps): Promise<Metadata> {
  // Garde défensive : non vérifié si vinext transmet bien `searchParams` à `generateMetadata`
  // (comme pour la page elle-même) — dégrade vers le canonical de base plutôt que de planter.
  const { categorie, page } = searchParams ? await searchParams : {};

  const query = new URLSearchParams();
  if (categorie) query.set("categorie", categorie);
  const pageCourante = Math.max(1, Number(page) || 1);
  if (pageCourante > 1) query.set("page", String(pageCourante));
  const queryString = query.toString();

  return {
    title: "Actualités",
    description:
      "Comptes rendus d'activités, bilans, communiqués et annonces d'événements du Mouvement pour l'Éducation à la Citoyenneté, semaine après semaine en Côte d'Ivoire.",
    alternates: {
      canonical: queryString ? `/actualites?${queryString}` : "/actualites",
    },
  };
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
