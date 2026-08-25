import Link from "next/link";
import type { Article } from "@/features/actualites/types/article";
import { PhotoPlaceholder } from "@/components/features/site/photo-placeholder";
import { CategoryTag } from "@/components/features/site/category-tag";

export function ArticleCard({ article }: { article: Article }) {
  return (
    <Link href={`/actualites/${article.slug}`} className="group flex flex-col gap-4">
      <PhotoPlaceholder ratio="3/2" label="Photo à fournir" />
      <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
        <CategoryTag category={article.category} />
        <span>{article.date}</span>
        <span>·</span>
        <span>{article.readingTime} de lecture</span>
      </div>
      <h3 className="text-h3 leading-snug font-semibold text-ink transition-colors group-hover:text-orange-700">
        {article.title}
      </h3>
      <p className="text-sm leading-relaxed text-text-muted">{article.excerpt}</p>
    </Link>
  );
}
