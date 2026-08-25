import { Reveal } from "@/components/features/site/reveal";

export function AproposHero() {
  return (
    <section className="bg-blue-800 py-14 text-white sm:py-20 lg:py-24">
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 items-end gap-10 px-5 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:px-16">
        <Reveal>
          <span className="text-xs font-semibold tracking-widest text-orange-400 uppercase">
            À propos
          </span>
          <h1 className="mt-5 text-5xl leading-[0.96] font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Former des citoyens <em className="font-serif font-normal italic">informés</em>
          </h1>
        </Reveal>
        <Reveal delay={80} className="max-w-[52ch] text-lg leading-relaxed text-white/80 text-pretty">
          <p>
            Le MEC est une organisation ivoirienne d’éducation à la citoyenneté. Nous intervenons
            dans les établissements scolaires, sur les campus et dans les quartiers.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
