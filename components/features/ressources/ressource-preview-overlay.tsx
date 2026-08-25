"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import type { Ressource } from "@/features/ressources/types/ressource";
import { PhotoPlaceholder } from "@/components/features/site/photo-placeholder";

export function RessourcePreviewOverlay({
  ressource,
  onClose,
}: {
  ressource: Ressource;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-overlay-scrim p-5"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ressource-preview-title"
        className="relative grid w-full max-w-[640px] grid-cols-1 gap-6 rounded-md border border-ink bg-surface-card p-7 shadow-stamp sm:grid-cols-[200px_1fr]"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Fermer l'aperçu"
          className="absolute top-4 right-4 grid h-8 w-8 place-items-center rounded-full text-text-muted transition-colors hover:bg-n-100"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>

        <PhotoPlaceholder ratio="3/4" label="Couverture à fournir" />

        <div className="flex flex-col gap-3">
          <span className="text-[11px] font-semibold tracking-wide text-text-muted uppercase">
            {ressource.theme}
          </span>
          <h2 id="ressource-preview-title" className="text-xl font-semibold text-ink">
            {ressource.title}
          </h2>
          <p className="text-sm leading-relaxed text-text-muted">{ressource.excerpt}</p>
          <div className="flex flex-wrap gap-3 text-xs text-text-muted">
            <span>{ressource.format}</span>
            <span>·</span>
            <span>{ressource.pages} p.</span>
            <span>·</span>
            <span>{ressource.weight}</span>
            <span>·</span>
            <span>{ressource.acces}</span>
          </div>
          <Link
            href={`/ressources/${ressource.slug}`}
            className="mt-2 inline-flex h-11 w-fit items-center rounded-sm bg-orange-500 px-6 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
          >
            Voir la fiche complète →
          </Link>
        </div>
      </div>
    </div>
  );
}
