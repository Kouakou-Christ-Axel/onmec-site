"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { Button } from "@/components/ui/button";
import { PublishPopover } from "@/components/features/admin/publish-popover";

interface ArticleEditorProps {
  onClose: () => void;
  onPublished: () => void;
}

export function ArticleEditor({ onClose, onPublished }: ArticleEditorProps) {
  const [titre, setTitre] = useState("");
  const [chapo, setChapo] = useState("");
  const [corps, setCorps] = useState("");
  const [showPublish, setShowPublish] = useState(false);

  const motCount = corps.trim() ? corps.trim().split(/\s+/).length : 0;

  return (
    <div className="fixed inset-0 z-95 flex flex-col bg-surface-page">
      <div className="flex h-16 flex-none items-center gap-3.5 border-b border-border-subtle bg-[#faf8f5]/94 px-4 backdrop-blur-md md:px-8">
        <IconButton icon={ArrowLeft} label="Retour aux actualités" onClick={onClose} />
        <span className="flex min-w-0 items-center gap-2.5">
          <span className="text-[0.8125rem] font-semibold whitespace-nowrap text-ink">
            Rédaction
          </span>
          <span className="text-xs whitespace-nowrap text-muted-foreground">
            · Brouillon enregistré automatiquement
          </span>
        </span>
        <span className="ml-auto flex items-center gap-3">
          <span className="text-xs whitespace-nowrap text-muted-foreground tabular-nums">
            {motCount} mots
          </span>
          <Button variant="ghost" size="sm">
            Aperçu
          </Button>
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
          <input
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            placeholder="Titre"
            aria-label="Titre de l’article"
            className="border-0 bg-transparent p-0 font-sans text-[clamp(2rem,4vw,2.75rem)] leading-[1.05] font-semibold tracking-[-0.032em] text-ink outline-none placeholder:text-n-300"
          />
          <input
            value={chapo}
            onChange={(e) => setChapo(e.target.value)}
            placeholder="Chapô — une à deux phrases, 30 mots maximum"
            aria-label="Chapô"
            className="border-0 bg-transparent p-0 font-serif text-[clamp(1.125rem,2vw,1.5rem)] leading-snug text-muted-foreground italic outline-none placeholder:text-n-300"
          />
          <textarea
            value={corps}
            onChange={(e) => setCorps(e.target.value)}
            placeholder="Racontez ce que le MEC a fait : des faits, des dates, des chiffres situés. Trois phrases par paragraphe au maximum."
            aria-label="Corps de l’article"
            className="min-h-[44vh] resize-none border-0 bg-transparent p-0 font-sans text-lg leading-relaxed text-[#2b3646] outline-none placeholder:text-n-300"
          />
        </div>

        {showPublish ? (
          <PublishPopover
            onClose={() => setShowPublish(false)}
            disabled={!titre.trim()}
            onPublish={() => {
              setShowPublish(false);
              onPublished();
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
