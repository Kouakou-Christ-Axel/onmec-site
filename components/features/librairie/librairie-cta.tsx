import Link from "next/link";
import { Reveal } from "@/components/features/site/reveal";

export function LibrairieCta() {
  return (
    <section className="py-14 sm:py-18 lg:py-24">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-16">
        <Reveal className="relative overflow-hidden rounded-lg bg-blue-800 text-white">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 text-white/5"
            style={{ backgroundImage: "var(--pattern-dots)", backgroundSize: "22px 22px" }}
          />
          <div className="relative flex flex-col items-start gap-6 p-8 sm:p-12 lg:p-16">
            <div>
              <span className="text-xs font-semibold tracking-widest text-orange-400 uppercase">
                Écrire avec nous
              </span>
              <h2 className="mt-4 text-4xl leading-tight font-semibold tracking-tight text-white sm:text-5xl">
                Un guide manque à votre classe ?
              </h2>
              <p className="mt-4 max-w-[54ch] text-[1.0625rem] leading-relaxed text-white/80">
                Nous concevons les guides avec les enseignants qui les utilisent. Dites-nous ce dont
                vous avez besoin.
              </p>
            </div>
            <Link
              href="/rejoindre"
              className="inline-flex h-[54px] items-center gap-2.5 rounded-sm bg-orange-500 px-7 text-[1.0625rem] font-semibold text-white transition-colors hover:bg-orange-600"
            >
              Proposer un guide <span>→</span>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
