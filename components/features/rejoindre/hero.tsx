import { Reveal } from "@/components/features/site/reveal";

export function RejoindreHero() {
  return (
    <section
      className="bg-orange-500 py-12 text-white sm:py-16 lg:py-24"
      style={{ backgroundImage: "var(--pattern-stripes)" }}
    >
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-16">
        <Reveal>
          <span className="text-xs font-semibold tracking-widest text-white/80 uppercase">
            Rejoindre
          </span>
          <h1 className="mt-5 max-w-[24ch] text-5xl leading-[0.96] font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Nous formons. <em className="font-serif font-normal italic">Vous agissez.</em>
          </h1>
        </Reveal>
        <Reveal delay={80} className="mt-5 max-w-[52ch] text-lg leading-relaxed text-white/90">
          <p>
            Quatre façons de vous engager auprès du MEC. L’adhésion est gratuite : nous ne
            demandons aucune cotisation.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
