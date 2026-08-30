"use client";

import { useState } from "react";
import type { PublicLibrairieDocument } from "@/features/librairie/types/document";
import { LibrairieTable } from "@/components/features/librairie/librairie-table";
import { LibrairieCard } from "@/components/features/librairie/librairie-card";
import { LibrairiePreviewOverlay } from "@/components/features/librairie/librairie-preview-overlay";

/**
 * Seule partie du catalogue qui a besoin de JS côté client : l'ouverture de l'aperçu. La liste des
 * documents elle-même vient du serveur (voir `librairie-catalog.tsx`) — pas de fetch ni de filtrage
 * ici, seulement l'état d'ouverture de l'overlay.
 */
export function LibrairieDocumentList({ documents }: { documents: PublicLibrairieDocument[] }) {
  const [previewId, setPreviewId] = useState<string | null>(null);
  const previewDocument = documents.find((d) => d.id === previewId) ?? null;

  return (
    <>
      <LibrairieTable documents={documents} onPreview={setPreviewId} />
      <div className="mt-9 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:hidden">
        {documents.map((document) => (
          <LibrairieCard key={document.id} document={document} />
        ))}
      </div>
      <LibrairiePreviewOverlay document={previewDocument} onClose={() => setPreviewId(null)} />
    </>
  );
}
