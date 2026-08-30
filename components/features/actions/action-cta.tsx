import Link from "next/link";
import { Reveal } from "@/components/features/site/reveal";

export function ActionCta() {
  return (
    <section className="bg-blue-800 py-14 text-white sm:py-18 lg:py-24">
      <Reveal className="mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-8 px-5 sm:px-8 lg:grid-cols-[1.25fr_0.75fr] lg:gap-12 lg:px-16">
        <div>
          <span className="text-xs font-semibold tracking-widest text-orange-400 uppercase">
            Accueillir une action
          </span>
          <h2 className="mt-4 text-4xl leading-tight font-semibold tracking-tight text-white sm:text-5xl">
            Votre établissement, notre prochaine étape
          </h2>
          <p className="mt-4 max-w-[48ch] text-[1.0625rem] leading-relaxed text-white/80">
            Nous intervenons sur demande d’un chef d’établissement, d’une association étudiante ou
            d’une mairie. Une séance dure deux heures.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/rejoindre"
            className="inline-flex h-[54px] items-center justify-center gap-2.5 rounded-sm bg-orange-500 px-7 text-[1.0625rem] font-semibold text-white transition-colors hover:bg-orange-600"
          >
            Demander une action <span>→</span>
          </Link>
          <Link
            href="/ressources"
            className="inline-flex h-[54px] items-center justify-center rounded-sm border border-white/35 px-7 text-[1.0625rem] font-semibold text-white transition-colors hover:bg-white/10"
          >
            Voir les ressources
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
