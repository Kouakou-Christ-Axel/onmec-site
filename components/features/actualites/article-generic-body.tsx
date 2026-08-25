import type { Article } from "@/features/actualites/types/article";

export function ArticleGenericBody({ article }: { article: Article }) {
  return (
    <article className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-16">
      <div className="max-w-[68ch] text-lg leading-relaxed text-text-body">
        <p>{article.excerpt}</p>
        <p className="mt-6 rounded-md border border-dashed border-ink/20 bg-surface-card p-6 text-base text-text-muted">
          Article complet à venir — le contenu détaillé de « {article.title} » est en cours de
          rédaction par l’équipe communication.
        </p>
      </div>
    </article>
  );
}
