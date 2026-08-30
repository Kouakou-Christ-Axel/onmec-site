import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLibrairiePublic } from "@/features/librairie/requests/get-librairie-public";
import { listLibrairiePublic } from "@/features/librairie/requests/list-librairie-public";
import { DocumentHeader } from "@/components/features/librairie/document-header";
import { DocumentBody } from "@/components/features/librairie/document-body";
import { RelatedDocuments } from "@/components/features/librairie/related-documents";

// Mémoïsé avec React.cache — même raison que app/(public)/actualites/[slug]/page.tsx :
// generateMetadata et la page appellent chacun getLibrairiePublic(id) avec le même argument.
const getDocument = cache(getLibrairiePublic);

/** Tronque proprement sur un espace, sans couper un mot, ~155 caractères. */
function truncateDescription(text: string, max = 155): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : max).trimEnd()}…`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const document = await getDocument(id);

  if (!document) {
    return {
      title: "Document introuvable",
      robots: { index: false },
    };
  }

  // Pas de `description` obligatoire côté back-office (voir audit SEO §4.3) : repli générique
  // dérivé du titre plutôt que de laisser la description absente.
  const description = document.description
    ? truncateDescription(document.description)
    : `${document.title} — document PDF partagé par le MEC, Mouvement pour l'Éducation à la Citoyenneté.`;

  return {
    title: document.title,
    description,
    alternates: { canonical: `/ressources/${document.id}` },
    openGraph: {
      type: "article",
      title: document.title,
      description,
      images: document.coverImage ? [{ url: document.coverImage }] : undefined,
    },
  };
}

export default async function RessourcePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const document = await getDocument(id);
  if (!document) notFound();

  // « Ressources liées » : même catégorie de préférence, en excluant le document courant —
  // même patron que app/(public)/actualites/[slug]/page.tsx.
  const { data: voisins } = await listLibrairiePublic({
    limit: 4,
    categorie: document.categorie ?? undefined,
  });
  const related = voisins.filter((autre) => autre.id !== document.id).slice(0, 3);

  return (
    <main>
      <DocumentHeader document={document} />
      <DocumentBody document={document} />
      <RelatedDocuments documents={related} />
    </main>
  );
}
