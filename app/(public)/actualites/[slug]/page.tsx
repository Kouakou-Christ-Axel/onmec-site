import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getActualiteBySlug } from "@/features/actualites/requests/get-actualite-by-slug";
import { listActualites } from "@/features/actualites/requests/list-actualites";
import { ArticleHeader } from "@/components/features/actualites/article-header";
import { ArticleBody } from "@/components/features/actualites/article-body";
import { RelatedArticles } from "@/components/features/actualites/related-articles";
import { getSiteUrl } from "@/config/env";
import type { Article } from "@/features/actualites/types/article";

// Mémoïsé avec React.cache : generateMetadata et la page appellent chacun getActualiteBySlug(slug)
// avec le même argument dans le même rendu. Next dédoublonne les fetch identiques nativement,
// mais vinext est une réimplémentation — cette parité n'est pas garantie (non vérifiable
// empiriquement au moment de cette implémentation, voir le rapport d'implémentation). Mémoïsation
// posée par défense plutôt que supposée sans risque.
const getArticle = cache(getActualiteBySlug);

/** Tronque proprement sur un espace, sans couper un mot, ~155 caractères. */
function truncateDescription(text: string, max = 155): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : max).trimEnd()}…`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return {
      title: "Article introuvable",
      robots: { index: false },
    };
  }

  const description = truncateDescription(article.excerpt);

  return {
    title: article.title,
    description,
    alternates: { canonical: `/actualites/${article.slug}` },
    openGraph: {
      type: "article",
      title: article.title,
      description,
      publishedTime: article.publishedAt ?? article.date,
      images: article.imageUrl ? [{ url: article.imageUrl }] : undefined,
    },
  };
}

function articleJsonLd(article: Article) {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt ?? article.date,
    dateModified: article.updatedAt,
    ...(article.imageUrl ? { image: [article.imageUrl] } : {}),
    ...(article.author ? { author: { "@type": "Person", name: article.author.fullname } } : {}),
    mainEntityOfPage: `${siteUrl}/actualites/${article.slug}`,
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  // « À lire aussi » : même catégorie de préférence, en excluant l'article courant.
  const { data: voisins } = await listActualites({
    limit: 4,
    categorie: article.categorie?.slug,
  });
  const related = voisins.filter((autre) => autre.slug !== article.slug).slice(0, 3);

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd(article)).replace(/</g, "\\u003c"),
        }}
      />
      <div className="bg-surface-card pb-14 sm:pb-20 lg:pb-24">
        <ArticleHeader article={article} />
        <ArticleBody content={article.content} />
      </div>
      <RelatedArticles articles={related} />
    </main>
  );
}
