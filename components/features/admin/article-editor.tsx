"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { Button } from "@/components/ui/button";
import { CoverImageField } from "@/components/features/admin/cover-image-field";
import { ArticleBodyEditor } from "@/components/features/admin/article-body-editor";
import { PublishPopover } from "@/components/features/admin/publish-popover";
import type { ActualiteAdmin } from "@/features/actualites-admin/types/actualite-admin";

interface ArticleEditorProps {
  existing: ActualiteAdmin | null;
}

export function ArticleEditor({ existing }: ArticleEditorProps) {
  const router = useRouter();
  const [titre, setTitre] = useState(existing?.title ?? "");
  const [chapo, setChapo] = useState(existing?.excerpt ?? "");
  const [corps, setCorps] = useState(existing?.content ?? "");
  const [motCount, setMotCount] = useState(0);
  const [image, setImage] = useState<File | null>(null);
  const [showPublish, setShowPublish] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(existing?.id ?? null);

  function handleClose() {
    router.push("/admin/actualites");
    router.refresh();
  }

  function handlePublished() {
    setShowPublish(false);
    router.push("/admin/actualites");
    router.refresh();
  }

  return (
    <div className="fixed inset-0 z-95 flex flex-col bg-surface-page">
      <div className="flex h-16 flex-none items-center gap-3.5 border-b border-border-subtle bg-[#faf8f5]/94 px-4 backdrop-blur-md md:px-8">
        <IconButton icon={ArrowLeft} label="Retour aux actualités" onClick={handleClose} />
        <span className="text-[0.8125rem] font-semibold whitespace-nowrap text-ink">Rédaction</span>
        <span className="ml-auto flex items-center gap-3">
          <span className="text-xs whitespace-nowrap text-muted-foreground tabular-nums">
            {motCount} mots
          </span>
          <Button
            variant="primary"
            size="sm"
            disabled={!titre.trim()}
            onClick={() => setShowPublish(true)}
          >
            Publier
          </Button>
        </span>
      </div>

      <div className="relative flex-1 overflow-auto px-6 py-14 pb-30">
        <div className="mx-auto flex max-w-180 flex-col gap-3.5">
          <span className="text-[0.6875rem] font-semibold tracking-[0.13em] text-orange-700 uppercase">
            Terrain
          </span>
          <CoverImageField file={image} onChange={setImage} existingUrl={existing?.imageUrl} />
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
            savedId={savedId}
            onSavedIdChange={setSavedId}
            fields={{ title: titre, excerpt: chapo, content: corps }}
            image={image}
            onClose={() => setShowPublish(false)}
            onPublished={handlePublished}
          />
        ) : null}
      </div>
    </div>
  );
}
