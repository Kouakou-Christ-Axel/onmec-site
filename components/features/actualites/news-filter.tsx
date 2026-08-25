"use client";

import { useMemo, useState } from "react";
import type { Article, ArticleCategory } from "@/features/actualites/types/article";
import { CATEGORIES } from "@/features/actualites/data/articles";
import { ArticleCard } from "@/components/features/site/article-card";
import { PhotoPlaceholder } from "@/components/features/site/photo-placeholder";
import Link from "next/link";

const ALL = "Toutes" as const;
type Filter = ArticleCategory | typeof ALL;

export function NewsFilter({ articles }: { articles: Article[] }) {
  const [category, setCategory] = useState<Filter>(ALL);

  const filtered = useMemo(
    () => (category === ALL ? articles : articles.filter((a) => a.category === category)),
    [articles, category],
  );
  const [featured, ...rest] = filtered;

  return (
    <>
      <div className="mt-9 flex flex-wrap items-center gap-2.5 border-b border-ink/10 pb-5">
        <button
          type="button"
          onClick={() => setCategory(ALL)}
          className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wide uppercase transition-colors ${
            category === ALL
              ? "border-ink bg-ink text-surface-page"
              : "border-ink/24 bg-transparent text-text-body hover:bg-n-100"
          }`}
        >
          Toutes
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wide uppercase transition-colors ${
              category === cat
                ? "border-ink bg-ink text-surface-page"
                : "border-ink/24 bg-transparent text-text-body hover:bg-n-100"
            }`}
          >
            {cat}
          </button>
        ))}
        <span className="ml-auto text-[13px] text-text-muted">
          {filtered.length} {filtered.length > 1 ? "articles" : "article"}
        </span>
      </div>

      {featured ? (
        <div
          className="mt-9 grid grid-cols-1 items-center gap-6 border-b border-ink/10 pb-9 lg:grid-cols-[3fr_5fr] lg:gap-12"
        >
          <Link href={`/actualites/${featured.slug}`} className="group">
            <PhotoPlaceholder ratio="16/9" duotone label="Photo de l’activité à fournir" />
          </Link>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center rounded-full border border-ink/20 px-3 py-1 text-[11px] font-semibold tracking-wide text-text-body uppercase">
                À la une
              </span>
              <span className="text-[13px] text-text-muted">
                {featured.date} · {featured.category} · {featured.readingTime}
              </span>
            </div>
            <h2 className="text-3xl leading-tight font-semibold tracking-tight text-ink sm:text-4xl text-pretty">
              {featured.title}
            </h2>
            <p className="max-w-[56ch] text-[1.0625rem] leading-relaxed text-text-muted">
              {featured.excerpt}
            </p>
            <Link
              href={`/actualites/${featured.slug}`}
              className="w-fit border-b-2 border-orange-500 pb-0.5 text-base font-semibold text-ink"
            >
              Lire l’article →
            </Link>
          </div>
        </div>
      ) : null}

      <div className="mt-9 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {rest.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>
      {!filtered.length ? (
        <p className="mt-9 text-text-muted">Aucun article dans cette catégorie pour l’instant.</p>
      ) : null}
    </>
  );
}
