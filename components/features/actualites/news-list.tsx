import Link from "next/link";
import type {
  Article,
  ArticleListMeta,
  CategorieActualite,
} from "@/features/actualites/types/article";
import { ArticleCard } from "@/components/features/site/article-card";
import { ArticleCover } from "@/components/features/site/article-cover";
import { Reveal } from "@/components/features/site/reveal";
import { formatArticleDate } from "@/features/actualites/lib/format-article-date";
import { estimateReadingTime } from "@/features/actualites/lib/estimate-reading-time";
import { cn } from "@/components/ui/cn";

const pillClass = (actif: boolean) =>
  cn(
    "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wide uppercase transition-colors duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
    actif
      ? "border-ink bg-ink text-surface-page"
      : "border-ink/24 bg-transparent text-text-body hover:bg-n-100",
  );

function href(categorie?: string, page?: number): string {
  const query = new URLSearchParams();
  if (categorie) query.set("categorie", categorie);
  if (page && page > 1) query.set("page", String(page));
  const suffixe = query.toString();
  return suffixe ? `/actualites?${suffixe}` : "/actualites";
}

interface NewsListProps {
  articles: Article[];
  categories: CategorieActualite[];
  meta: ArticleListMeta;
  categorieActive?: string;
}

/**
 * Composant serveur : le filtre et la pagination passent par l'URL, pas par un état client.
 * L'adresse devient partageable et indexable, et on ne charge qu'une page d'articles à la fois.
 * La mise en avant du premier article ne vaut que sur la première page.
 */
export function NewsList({ articles, categories, meta, categorieActive }: NewsListProps) {
  const premierePage = meta.page <= 1;
  const [featured, ...rest] = articles;
  const grille = premierePage ? rest : articles;

  return (
    <>
      <div className="mt-9 flex flex-wrap items-center gap-2.5 border-b border-ink/10 pb-5">
        <Link href={href()} aria-current={!categorieActive ? "page" : undefined} className={pillClass(!categorieActive)}>
          Toutes
        </Link>
        {categories.map((categorie) => (
          <Link
            key={categorie.id}
            href={href(categorie.slug)}
            aria-current={categorieActive === categorie.slug ? "page" : undefined}
            className={pillClass(categorieActive === categorie.slug)}
          >
            {categorie.nom}
          </Link>
        ))}
        <span className="ml-auto text-[13px] text-text-muted">
          {meta.total} {meta.total > 1 ? "articles" : "article"}
        </span>
      </div>

      {premierePage && featured ? (
        <div className="mt-9 grid grid-cols-1 items-center gap-6 border-b border-ink/10 pb-9 lg:grid-cols-[3fr_5fr] lg:gap-12">
          <Link
            href={`/actualites/${featured.slug}`}
            className="group rounded-sm transition-transform duration-150 ease-out hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
          >
            <ArticleCover
              src={featured.imageUrl}
              alt=""
              ratio="16/9"
              duotone
              sizes="(min-width: 1024px) 460px, 100vw"
              placeholderLabel="Photo de l’activité à fournir"
            />
          </Link>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center rounded-full border border-ink/20 px-3 py-1 text-[11px] font-semibold tracking-wide text-text-body uppercase">
                À la une
              </span>
              <span className="text-[13px] text-text-muted">
                {formatArticleDate(featured.date)}
                {featured.categorie ? ` · ${featured.categorie.nom}` : ""} ·{" "}
                {estimateReadingTime(featured.content)}
              </span>
            </div>
            <h2 className="text-3xl leading-tight font-semibold tracking-tight text-ink text-pretty sm:text-4xl">
              {featured.title}
            </h2>
            <p className="max-w-[56ch] text-[1.0625rem] leading-relaxed text-text-muted">
              {featured.excerpt}
            </p>
            <Link
              href={`/actualites/${featured.slug}`}
              className="w-fit border-b-2 border-orange-500 pb-0.5 text-base font-semibold text-ink transition-colors duration-150 ease-out hover:text-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            >
              Lire l’article →
            </Link>
          </div>
        </div>
      ) : null}

      <div className="mt-9 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {grille.map((article, i) => (
          <Reveal key={article.slug} delay={i * 80}>
            <ArticleCard article={article} />
          </Reveal>
        ))}
      </div>

      {!articles.length ? (
        <p className="mt-9 text-text-muted">Aucun article dans cette catégorie pour l’instant.</p>
      ) : null}

      {meta.totalPages > 1 ? (
        <nav aria-label="Pagination des actualités" className="mt-11 flex items-center gap-2">
          {Array.from({ length: meta.totalPages }).map((_, i) => {
            const page = i + 1;
            const actif = page === meta.page;
            return (
              <Link
                key={page}
                href={href(categorieActive, page)}
                aria-current={actif ? "page" : undefined}
                className={cn(
                  "inline-grid h-9 min-w-9 place-items-center rounded-sm border px-2 text-sm font-semibold transition-colors duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
                  actif
                    ? "border-ink bg-ink text-surface-page"
                    : "border-ink/24 text-text-body hover:bg-n-100",
                )}
              >
                {page}
              </Link>
            );
          })}
        </nav>
      ) : null}
    </>
  );
}
