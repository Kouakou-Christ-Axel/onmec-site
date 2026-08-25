import type { Article } from "@/features/actualites/types/article";
import { ArticleCard } from "@/components/features/site/article-card";

export function RelatedArticles({ articles }: { articles: Article[] }) {
  if (!articles.length) return null;

  return (
    <section className="mt-14 border-t border-ink/10 py-14 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-16">
        <h2 className="mb-8 text-2xl leading-tight font-semibold tracking-tight text-ink">
          À lire aussi
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {articles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      </div>
    </section>
  );
}
