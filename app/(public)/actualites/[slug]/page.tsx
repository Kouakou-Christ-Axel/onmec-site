import { notFound } from "next/navigation";
import { getActualiteBySlug } from "@/features/actualites/requests/get-actualite-by-slug";
import { listActualites } from "@/features/actualites/requests/list-actualites";
import { ArticleHeader } from "@/components/features/actualites/article-header";
import { ArticleBody } from "@/components/features/actualites/article-body";
import { RelatedArticles } from "@/components/features/actualites/related-articles";

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getActualiteBySlug(slug);
  if (!article) notFound();

  // « À lire aussi » : même catégorie de préférence, en excluant l'article courant.
  const { data: voisins } = await listActualites({
    limit: 4,
    categorie: article.categorie?.slug,
  });
  const related = voisins.filter((autre) => autre.slug !== article.slug).slice(0, 3);

  return (
    <main>
      <div className="bg-surface-card pb-14 sm:pb-20 lg:pb-24">
        <ArticleHeader article={article} />
        <ArticleBody content={article.content} />
      </div>
      <RelatedArticles articles={related} />
    </main>
  );
}
