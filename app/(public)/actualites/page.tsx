import { ARTICLES } from "@/features/actualites/data/articles";
import { NewsFilter } from "@/components/features/actualites/news-filter";

export default function ActualitesPage() {
  return (
    <main className="py-11 sm:py-14 lg:py-20">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-16">
        <div className="flex max-w-[760px] flex-col gap-4">
          <span className="text-xs font-semibold tracking-widest text-orange-700 uppercase">
            Actualités
          </span>
          <h1 className="text-5xl leading-none font-semibold tracking-tight text-ink sm:text-6xl">
            Ce que nous faisons,{" "}
            <em className="font-serif font-normal italic">semaine après semaine</em>
          </h1>
          <p className="max-w-[60ch] text-lg leading-relaxed text-[#5e6878]">
            Comptes rendus d’activités, bilans, communiqués et annonces d’événements.
          </p>
        </div>
        <NewsFilter articles={ARTICLES} />
      </div>
    </main>
  );
}
