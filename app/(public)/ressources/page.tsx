import { RessourcesHero } from "@/components/features/ressources/hero";
import { RessourceFilter } from "@/components/features/ressources/ressource-filter";
import { RessourceCta } from "@/components/features/ressources/ressource-cta";
import { RESSOURCES } from "@/features/ressources/data/ressources";

export default function RessourcesPage() {
  return (
    <main>
      <RessourcesHero />
      <div className="mx-auto max-w-[1280px] px-5 pb-14 sm:px-8 sm:pb-18 lg:px-16 lg:pb-24">
        <RessourceFilter ressources={RESSOURCES} />
      </div>
      <RessourceCta />
    </main>
  );
}
