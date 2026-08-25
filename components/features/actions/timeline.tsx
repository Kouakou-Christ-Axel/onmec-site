import Link from "next/link";
import { Reveal } from "@/components/features/site/reveal";
import { CHRONOLOGIE } from "@/features/actions/data/chronologie";

export function Timeline() {
  return (
    <section className="bg-n-100 py-14 sm:py-18 lg:py-24">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-16">
        <Reveal className="mb-11 flex flex-wrap items-end justify-between gap-4">
          <div className="flex max-w-[600px] flex-col gap-3.5">
            <span className="text-xs font-semibold tracking-widest text-orange-700 uppercase">
              Chronologie
            </span>
            <h2 className="text-h1 font-semibold text-ink">Ce que nous avons mené</h2>
          </div>
          <Link
            href="/actualites"
            className="w-fit border-b-2 border-orange-500 pb-0.5 text-sm font-semibold text-ink"
          >
            Les comptes rendus →
          </Link>
        </Reveal>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
          {CHRONOLOGIE.map((annee, i) => (
            <Reveal key={annee.year} delay={i * 80}>
              <div>
                <div className="border-b-2 border-ink pb-3.5 text-3xl font-semibold tracking-tight text-ink">
                  {annee.year}
                </div>
                <div className="flex flex-col">
                  {annee.items.map((item) => (
                    <div
                      key={item.title}
                      className="flex flex-col gap-1.5 border-b border-ink/10 py-4 first:pt-0 last:border-b-0"
                    >
                      <span className="text-[13px] text-orange-700">
                        {item.date} · {item.meta}
                      </span>
                      <span className="text-base font-semibold text-ink">{item.title}</span>
                      <span className="text-sm leading-relaxed text-text-muted">{item.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
