import Link from "next/link";
import { Reveal } from "@/components/features/site/reveal";

export function AccueilHero() {
  return (
    <section
      className="flex items-center overflow-hidden bg-brand-flat text-white"
      style={{ backgroundImage: "var(--pattern-stripes)" }}
    >
      <div className="mx-auto grid w-full max-w-[1280px] grid-cols-1 items-center gap-8 px-5 py-10 sm:px-8 sm:py-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:px-16 lg:py-14">
        <Reveal>
          <span className="text-xs font-semibold tracking-widest text-white/80 uppercase">
            Mouvement pour l’Éducation à la Citoyenneté
          </span>
          <h1 className="mt-6 text-6xl leading-[0.94] font-semibold tracking-tight text-white sm:text-7xl lg:text-8xl">
            Instruire pour <em className="font-serif font-normal italic">impacter</em>
          </h1>
          <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-white/90 text-pretty">
            Nous formons les jeunes Ivoiriens à leurs droits, à leurs devoirs et à la vie citoyenne.
            Vous agissez, dans votre quartier, votre campus, votre lycée.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/rejoindre"
              className="inline-flex h-[54px] items-center gap-2.5 rounded-sm bg-white px-7 text-[1.0625rem] font-semibold text-fill-ink transition-transform hover:-translate-y-0.5"
            >
              Rejoindre le mouvement <span>→</span>
            </Link>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <div
            className="mx-auto grid aspect-[4/5] w-full max-w-[260px] place-items-center rounded-md border border-white/35 p-6 text-center sm:max-w-[320px] lg:max-w-none"
            style={{
              backgroundImage:
                "repeating-linear-gradient(118deg, rgba(255,255,255,.16) 0 10px, rgba(255,255,255,.06) 10px 20px)",
            }}
          >
            <div className="flex flex-col items-center gap-3">
              <img
                src="/assets/logo/mec-mono-white.png"
                alt=""
                className="h-11 w-auto opacity-50"
              />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
