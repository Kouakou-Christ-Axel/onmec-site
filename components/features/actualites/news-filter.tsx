"use client";

import { useMemo, useState } from "react";
import type { Article, ArticleCategory } from "@/features/actualites/types/article";
import { CATEGORIES } from "@/features/actualites/data/articles";
import { ArticleCard } from "@/components/features/site/article-card";
import { PhotoPlaceholder } from "@/components/features/site/photo-placeholder";
import { Reveal } from "@/components/features/site/reveal";
import Link from "next/link";

const pillClass = (isActive: boolean) =>
  `inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wide uppercase transition-colors duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring ${
    isActive
      ? "border-ink bg-ink text-surface-page"
      : "border-ink/24 bg-transparent text-text-body hover:bg-n-100"
  }`;

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
          aria-pressed={category === ALL}
          className={pillClass(category === ALL)}
        >
          Toutes
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            aria-pressed={category === cat}
            className={pillClass(category === cat)}
          >
            {cat}
          </button>
        ))}
        <span className="ml-auto text-[13px] text-text-muted">
          {filtered.length} {filtered.length > 1 ? "articles" : "article"}
        </span>
      </div>

      {featured ? (
        <div className="mt-9 grid grid-cols-1 items-center gap-6 border-b border-ink/10 pb-9 lg:grid-cols-[3fr_5fr] lg:gap-12">
          <Link
            href={`/actualites/${featured.slug}`}
            className="group rounded-sm transition-transform duration-150 ease-out hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
          >
            <PhotoPlaceholder
              ratio="16/9"
              duotone
              label="Photo de l’activité à fournir"
              className="transition-shadow duration-150 ease-out group-hover:shadow-stamp-sm"
            />
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
              className="w-fit border-b-2 border-orange-500 pb-0.5 text-base font-semibold text-ink transition-colors duration-150 ease-out hover:text-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            >
              Lire l’article →
            </Link>
          </div>
        </div>
      ) : null}

      <div className="mt-9 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {rest.map((article, i) => (
          <Reveal key={article.slug} delay={i * 80}>
            <ArticleCard article={article} />
          </Reveal>
        ))}
      </div>
      {!filtered.length ? (
        <p className="mt-9 text-text-muted">Aucun article dans cette catégorie pour l’instant.</p>
      ) : null}
    </>
  );
}
