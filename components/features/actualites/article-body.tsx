import { sanitizeArticleHtml } from "@/features/actualites/lib/sanitize-article-html";

/**
 * Corps de l'article. Remplace les deux corps maquettés précédents
 * (`article-generic-body`, `article-bilan-body`), qui affichaient du contenu écrit en dur.
 *
 * Le HTML vient de la base et est rendu sur le site public : il passe par
 * `sanitizeArticleHtml` avant `dangerouslySetInnerHTML`, jamais brut.
 */
export function ArticleBody({ content }: { content: string }) {
  return (
    <article className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-16">
      <div
        className="mec-article-body max-w-[68ch] text-lg leading-relaxed text-text-body"
        dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(content) }}
      />
    </article>
  );
}
