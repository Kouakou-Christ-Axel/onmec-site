import { Reveal } from "@/components/features/site/reveal";
import { Stat } from "@/components/features/site/stat";
import { RESSOURCES } from "@/features/ressources/data/ressources";
import { formatCount } from "@/features/ressources/lib/format-count";

export function RessourcesHero() {
  const totalDownloads = RESSOURCES.reduce((sum, ressource) => sum + ressource.downloads, 0);

  return (
    <section className="py-11 sm:py-14 lg:py-20">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-16">
        <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <Reveal className="flex max-w-[760px] flex-col gap-4">
            <span className="text-xs font-semibold tracking-widest text-orange-700 uppercase">
              Ressources
            </span>
            <h1 className="text-5xl leading-none font-semibold tracking-tight text-ink sm:text-6xl">
              Des guides à <em className="font-serif font-normal italic">utiliser</em>, pas à
              archiver
            </h1>
            <p className="max-w-[60ch] text-lg leading-relaxed text-text-muted">
              Guides pédagogiques écrits avec des enseignants et relus par nos encadreurs.
              Téléchargement gratuit, une adresse électronique est demandée.
            </p>
          </Reveal>
          <Reveal delay={80} className="grid grid-cols-2 gap-6 sm:gap-8">
            <Stat value={String(RESSOURCES.length)} label="guides publiés depuis 2024" />
            <Stat value={formatCount(totalDownloads)} label="téléchargements au 30/06/2026" />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
