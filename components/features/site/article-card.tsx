import Link from "next/link";
import type { Article } from "@/features/actualites/types/article";
import { ArticleCover } from "@/components/features/site/article-cover";
import { CategoryTag } from "@/components/features/site/category-tag";
import { formatArticleDate } from "@/features/actualites/lib/format-article-date";
import { estimateReadingTime } from "@/features/actualites/lib/estimate-reading-time";

export function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/actualites/${article.slug}`}
      className="group flex flex-col gap-4 rounded-sm transition-transform duration-150 ease-out hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
    >
      <ArticleCover
        src={article.imageUrl}
        alt={article.title}
        ratio="3/2"      />
      <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
        <CategoryTag categorie={article.categorie} />
        <span>{formatArticleDate(article.date)}</span>
        <span>·</span>
        <span>{estimateReadingTime(article.content)} de lecture</span>
      </div>
      <h3 className="line-clamp-2 text-h3 leading-snug font-semibold text-ink transition-colors group-hover:text-orange-700">
        {article.title}
      </h3>
      <p className="line-clamp-3 text-sm leading-relaxed text-text-muted">{article.excerpt}</p>
    </Link>
  );
}
