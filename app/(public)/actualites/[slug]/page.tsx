import { notFound } from "next/navigation";
import { getArticleBySlug, getRelatedArticles } from "@/features/actualites/data/articles";
import { ArticleHeader } from "@/components/features/actualites/article-header";
import { ArticleBilanBody } from "@/components/features/actualites/article-bilan-body";
import { ArticleGenericBody } from "@/components/features/actualites/article-generic-body";
import { RelatedArticles } from "@/components/features/actualites/related-articles";

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  return (
    <main>
      <ArticleHeader article={article} />
      {article.slug === "bilan" ? (
        <ArticleBilanBody />
      ) : (
        <ArticleGenericBody article={article} />
      )}
      <RelatedArticles articles={getRelatedArticles(article.slug)} />
    </main>
  );
}
