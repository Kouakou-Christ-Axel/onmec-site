"use client";

import Link from "next/link";
import { X } from "lucide-react";
import type { PublicLibrairieDocument } from "@/features/librairie/types/document";
import { DocumentCover } from "@/components/features/librairie/document-cover";
import { Dialog, DialogTitle, useLastNonNull } from "@/components/ui/dialog";

export function LibrairiePreviewOverlay({
  document,
  onClose,
}: {
  document: PublicLibrairieDocument | null;
  onClose: () => void;
}) {
  const shown = useLastNonNull(document);
  if (!shown) return null;

  return (
    <Dialog
      open={document !== null}
      onClose={onClose}
      overlayClassName="p-5"
      className="grid max-w-[640px] grid-cols-1 gap-6 rounded-md border-ink bg-surface-card p-7 shadow-stamp sm:grid-cols-[200px_1fr]"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Fermer l'aperçu"
        className="absolute top-4 right-4 grid h-8 w-8 place-items-center rounded-full text-text-muted transition-colors hover:bg-n-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>

      <DocumentCover src={shown.coverImage} alt={shown.title} />

      <div className="flex flex-col gap-3">
        {shown.categorie ? (
          <span className="text-[11px] font-semibold tracking-wide text-text-muted uppercase">
            {shown.categorie}
          </span>
        ) : null}
        <DialogTitle asChild>
          <h2 className="text-xl font-semibold text-ink">{shown.title}</h2>
        </DialogTitle>
        {shown.description ? (
          <p className="text-sm leading-relaxed text-text-muted">{shown.description}</p>
        ) : null}
        <div className="flex flex-wrap gap-3 text-xs text-text-muted">
          {shown.pageCount !== null ? <span>{shown.pageCount} p.</span> : null}
        </div>
        <Link
          href={`/ressources/${shown.id}`}
          className="mt-2 inline-flex h-11 w-fit items-center rounded-sm bg-orange-500 px-6 text-sm font-semibold text-white transition-colors hover:bg-orange-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
        >
          Voir la fiche complète →
        </Link>
      </div>
    </Dialog>
  );
}
