import Link from "next/link";
import type { Ressource } from "@/features/ressources/types/ressource";
import { RessourceCard } from "@/components/features/ressources/ressource-card";

export function RelatedRessources({ ressources }: { ressources: Ressource[] }) {
  if (!ressources.length) return null;

  return (
    <section className="border-t border-ink/10 bg-surface-card py-14 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-2xl leading-tight font-semibold tracking-tight text-ink">
            Ressources liées
          </h2>
          <Link
            href="/ressources"
            className="w-fit border-b-2 border-orange-500 pb-0.5 text-sm font-semibold text-ink"
          >
            Tout le catalogue →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {ressources.map((ressource) => (
            <RessourceCard key={ressource.slug} ressource={ressource} />
          ))}
        </div>
      </div>
    </section>
  );
}
