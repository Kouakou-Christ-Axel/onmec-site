import { notFound } from "next/navigation";
import { getLibrairiePublic } from "@/features/librairie/requests/get-librairie-public";
import { listLibrairiePublic } from "@/features/librairie/requests/list-librairie-public";
import { DocumentHeader } from "@/components/features/librairie/document-header";
import { DocumentBody } from "@/components/features/librairie/document-body";
import { RelatedDocuments } from "@/components/features/librairie/related-documents";

export default async function RessourcePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const document = await getLibrairiePublic(id);
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
