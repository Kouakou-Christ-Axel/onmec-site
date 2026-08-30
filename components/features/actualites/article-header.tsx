import Link from "next/link";
import { Share2, Printer } from "lucide-react";
import type { Article } from "@/features/actualites/types/article";
import { CategoryTag } from "@/components/features/site/category-tag";
import { ArticleCover } from "@/components/features/site/article-cover";
import { formatArticleDate } from "@/features/actualites/lib/format-article-date";
import { estimateReadingTime } from "@/features/actualites/lib/estimate-reading-time";
import { Reveal } from "@/components/features/site/reveal";

const iconButtonClass =
  "inline-grid h-9 w-9 place-items-center rounded-sm border border-ink/24 text-ink transition-colors duration-150 ease-out hover:border-ink hover:bg-n-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring";

export function ArticleHeader({ article }: { article: Article }) {
  return (
    <>
      <section className="py-7 sm:py-11">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-16">
          <Link href="/actualites" className="text-sm font-semibold text-text-muted">
            ← Toutes les actualités
          </Link>
        </div>
      </section>
      <header className="py-7 sm:py-11">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-16">
          <Reveal className="flex max-w-[920px] flex-col gap-5">
            <div className="flex items-center gap-3">
              <CategoryTag categorie={article.categorie} />
              <span className="text-[13px] text-text-muted">
                <time dateTime={article.date}>{formatArticleDate(article.date)}</time> ·{" "}
                {estimateReadingTime(article.content)} de lecture
              </span>
            </div>
            <h1 className="text-5xl leading-[0.96] font-semibold tracking-tight text-ink text-pretty sm:text-6xl lg:text-7xl">
              {article.title}
            </h1>
            <p className="max-w-[62ch] text-xl leading-snug text-text-muted text-pretty">
              {article.excerpt}
            </p>
          </Reveal>
          <div className="mt-7 flex items-center gap-4 border-t border-b border-ink/10 py-5">
            <span className="text-sm font-semibold text-ink">
              {article.author?.fullname ?? "Rédaction MEC"}
            </span>
            <span className="ml-auto flex gap-2">
              <button type="button" aria-label="Partager l’article" className={iconButtonClass}>
                <Share2 className="h-4 w-4" aria-hidden />
              </button>
              <button type="button" aria-label="Imprimer" className={iconButtonClass}>
                <Printer className="h-4 w-4" aria-hidden />
              </button>
            </span>
          </div>
        </div>
      </header>
      <div className="mx-auto mb-9 max-w-[1280px] px-5 sm:px-8 lg:mb-16 lg:px-16">
        <ArticleCover
          src={article.imageUrl}
          alt={article.title}
          ratio="21/9"
          duotone
          sizes="(min-width: 1280px) 1216px, 100vw"
          priority        />
      </div>
    </>
  );
}
