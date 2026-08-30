import Link from "next/link";
import { Reveal } from "@/components/features/site/reveal";

export function JoinCta() {
  return (
    <section className="pb-16 sm:pb-20 lg:pb-28">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-16">
        <Reveal className="relative overflow-hidden rounded-lg bg-blue-800 text-white">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 text-white/5"
            style={{ backgroundImage: "var(--pattern-dots)", backgroundSize: "22px 22px" }}
          />
          <div className="relative grid grid-cols-1 items-center gap-8 p-8 sm:p-12 lg:grid-cols-[1.3fr_0.7fr] lg:gap-14 lg:p-16">
            <div>
              <span className="text-xs font-semibold tracking-widest text-orange-400 uppercase">
                Rejoindre
              </span>
              <h2 className="mt-4 text-4xl leading-tight font-semibold tracking-tight text-white sm:text-5xl">
                Nous formons. <span className="font-serif font-normal italic">Vous agissez.</span>
              </h2>
              <p className="mt-4 max-w-[48ch] text-[1.0625rem] leading-relaxed text-white/80">
                Bénévole, membre adhérent, partenaire ou donateur. L’adhésion est gratuite et le
                formulaire prend trois minutes.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Link
                href="/rejoindre"
                className="inline-flex h-[54px] items-center justify-center gap-2.5 rounded-sm bg-orange-500 text-[1.0625rem] font-semibold text-white transition-colors hover:bg-orange-600"
              >
                Rejoindre le mouvement <span>→</span>
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-[54px] items-center justify-center rounded-sm border border-white/35 text-[1.0625rem] font-semibold text-white transition-colors hover:bg-white/10"
              >
                Nous écrire
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
