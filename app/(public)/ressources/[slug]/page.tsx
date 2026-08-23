import { notFound } from "next/navigation";
import { getRessourceBySlug, getRelatedRessources } from "@/features/ressources/data/ressources";
import { RessourceHeader } from "@/components/features/ressources/ressource-header";
import { RessourceBody } from "@/components/features/ressources/ressource-body";
import { RelatedRessources } from "@/components/features/ressources/related-ressources";

export default async function RessourcePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ressource = getRessourceBySlug(slug);
  if (!ressource) notFound();

  return (
    <main>
      <RessourceHeader ressource={ressource} />
      <RessourceBody ressource={ressource} />
      <RelatedRessources ressources={getRelatedRessources(ressource.slug)} />
    </main>
  );
}
