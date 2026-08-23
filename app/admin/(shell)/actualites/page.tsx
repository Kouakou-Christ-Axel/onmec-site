"use client";

import { useState } from "react";
import { PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import { ArticleEditor } from "@/components/features/admin/article-editor";
import { ARTICLES } from "@/features/admin/data/articles";

export default function ActualitesPage() {
  const [showEditor, setShowEditor] = useState(false);
  const [publiedFlash, setPubliedFlash] = useState(false);

  return (
    <div className="flex max-w-[1320px] flex-col gap-5.5">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold tracking-[0.13em] text-orange-700 uppercase">
            Site public
          </span>
          <h1 className="text-[1.75rem] leading-[1.12] font-semibold tracking-[-0.028em] text-ink">
            Actualités et blog
          </h1>
          <p className="text-[0.9375rem] text-muted-foreground">
            Brouillon → En relecture → Programmé → Publié · rédaction par l’équipe communication
          </p>
        </div>
        <Button variant="primary" icon={PenLine} onClick={() => setShowEditor(true)}>
          Nouvel article
        </Button>
      </div>

      {publiedFlash ? (
        <p className="rounded-md border border-verdict-true/20 bg-verdict-true-bg px-4 py-3 text-sm text-verdict-true">
          Article publié sur le site.
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-lg border border-border-subtle bg-surface-card">
        <div className="min-w-[720px]">
          <div className="grid grid-cols-[minmax(0,1fr)_130px_156px_116px_92px] gap-3.5 border-b border-border-subtle bg-n-50 px-4 py-2.5 text-[0.6875rem] font-semibold tracking-[0.09em] text-muted-foreground uppercase">
            <span>Titre</span>
            <span>Statut</span>
            <span>Auteur</span>
            <span>Date</span>
            <span className="text-right">Vues</span>
          </div>
          {ARTICLES.map((a) => (
            <div
              key={a.titre}
              className="grid grid-cols-[minmax(0,1fr)_130px_156px_116px_92px] items-center gap-3.5 border-b border-border-subtle px-4 py-3 text-sm last:border-b-0"
            >
              <span className="font-medium text-ink">{a.titre}</span>
              <span>
                <Tag tone={a.tone}>{a.statut}</Tag>
              </span>
              <span className="text-[0.8125rem] text-muted-foreground">{a.auteur}</span>
              <span className="text-[0.8125rem] text-muted-foreground tabular-nums">{a.date}</span>
              <span className="text-right text-[#2b3646] tabular-nums">{a.vues}</span>
            </div>
          ))}
        </div>
      </div>

      {showEditor ? (
        <ArticleEditor
          onClose={() => setShowEditor(false)}
          onPublished={() => {
            setShowEditor(false);
            setPubliedFlash(true);
          }}
        />
      ) : null}
    </div>
  );
}
