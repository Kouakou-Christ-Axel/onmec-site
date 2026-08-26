"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { Button } from "@/components/ui/button";
import { ArticleBodyEditor } from "@/components/features/admin/article-body-editor";
import { PublishPopover } from "@/components/features/admin/publish-popover";
import type { ActualiteAdmin } from "@/features/actualites-admin/types/actualite-admin";

interface ArticleEditorProps {
  existing: ActualiteAdmin | null;
  onClose: () => void;
  onSaved: (actualite: ActualiteAdmin) => void;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ArticleEditor({ existing, onClose, onSaved }: ArticleEditorProps) {
  const [titre, setTitre] = useState(existing?.title ?? "");
  const [chapo, setChapo] = useState(existing?.excerpt ?? "");
  const [date, setDate] = useState(existing?.date.slice(0, 10) ?? todayIso());
  const [corps, setCorps] = useState(existing?.content ?? "");
  const [motCount, setMotCount] = useState(0);
  const [image, setImage] = useState<File | null>(null);
  const [showPublish, setShowPublish] = useState(false);

  return (
    <div className="fixed inset-0 z-95 flex flex-col bg-surface-page">
      <div className="flex h-16 flex-none items-center gap-3.5 border-b border-border-subtle bg-[#faf8f5]/94 px-4 backdrop-blur-md md:px-8">
        <IconButton icon={ArrowLeft} label="Retour aux actualités" onClick={onClose} />
        <span className="text-[0.8125rem] font-semibold whitespace-nowrap text-ink">Rédaction</span>
        <span className="ml-auto flex items-center gap-3">
          <span className="text-xs whitespace-nowrap text-muted-foreground tabular-nums">
            {motCount} mots
          </span>
          <Button variant="primary" size="sm" disabled={!titre.trim()} onClick={() => setShowPublish(true)}>
            Publier
          </Button>
        </span>
      </div>

      <div className="relative flex-1 overflow-auto px-6 py-14 pb-30">
        <div className="mx-auto flex max-w-180 flex-col gap-3.5">
          <span className="text-[0.6875rem] font-semibold tracking-[0.13em] text-orange-700 uppercase">
            Terrain
          </span>
          <input
            value={titre}
            onChange={(event) => setTitre(event.target.value)}
            placeholder="Titre"
            aria-label="Titre de l’article"
            className="border-0 bg-transparent p-0 font-sans text-[clamp(2rem,4vw,2.75rem)] leading-[1.05] font-semibold tracking-[-0.032em] text-ink outline-none placeholder:text-n-300"
          />
          <input
            value={chapo}
            onChange={(event) => setChapo(event.target.value)}
            placeholder="Chapô — une à deux phrases, 30 mots maximum"
            aria-label="Chapô"
            className="border-0 bg-transparent p-0 font-serif text-[clamp(1.125rem,2vw,1.5rem)] leading-snug text-muted-foreground italic outline-none placeholder:text-n-300"
          />
          <div className="flex flex-wrap items-center gap-4">
            <label htmlFor="article-date" className="text-[0.8125rem] font-medium text-muted-foreground">
              Date
              <input
                id="article-date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="ml-2 rounded-control border border-border-subtle bg-white px-2.5 py-1.5 text-sm text-ink outline-none focus:border-blue-500"
              />
            </label>
            <label htmlFor="article-image" className="text-[0.8125rem] font-medium text-muted-foreground">
              Image de couverture
              <input
                id="article-image"
                type="file"
                accept="image/*"
                onChange={(event) => setImage(event.target.files?.[0] ?? null)}
                className="ml-2 text-[0.8125rem] text-muted-foreground"
              />
            </label>
          </div>
          <ArticleBodyEditor
            initialContent={corps}
            onChange={(html, text) => {
              setCorps(html);
              setMotCount(text.trim() ? text.trim().split(/\s+/).length : 0);
            }}
          />
        </div>

        {showPublish ? (
          <PublishPopover
            existing={existing}
            fields={{ title: titre, excerpt: chapo, content: corps, date }}
            image={image}
            onClose={() => setShowPublish(false)}
            onPublished={(actualite) => {
              setShowPublish(false);
              onSaved(actualite);
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
