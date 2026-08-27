import Link from "next/link";
import { listActualites } from "@/features/actualites/requests/list-actualites";
import { ArticleCard } from "@/components/features/site/article-card";
import { Reveal } from "@/components/features/site/reveal";

export async function RecentNews() {
  let recent;
  try {
    ({ data: recent } = await listActualites({ limit: 3 }));
  } catch (error) {
    console.error(error);
    return null;
  }

  return (
    <section className="border-y border-ink/10 bg-surface-card py-16 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-16">
        <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-5">
          <div className="flex flex-col gap-3.5">
            <span className="text-xs font-semibold tracking-widest text-orange-700 uppercase">
              Actualités
            </span>
            <h2 className="text-4xl leading-tight font-semibold tracking-tight text-ink sm:text-5xl">
              Ce que nous avons fait récemment
            </h2>
          </div>
          <Link
            href="/actualites"
            className="border-b-2 border-orange-500 pb-0.5 text-base font-semibold text-ink"
          >
            Toutes les actualités →
          </Link>
        </Reveal>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {recent.map((article, i) => (
            <Reveal key={article.slug} delay={i * 80}>
              <ArticleCard article={article} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
