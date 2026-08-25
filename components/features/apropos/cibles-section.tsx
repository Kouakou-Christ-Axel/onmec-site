import { Reveal } from "@/components/features/site/reveal";
import { CIBLES } from "@/features/apropos/data/apropos-content";

export function CiblesSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-28">
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-9 px-5 sm:px-8 lg:grid-cols-[180px_1fr] lg:gap-20 lg:px-16">
        <span className="text-xs font-semibold tracking-widest text-orange-700 uppercase">
          Notre cible
        </span>
        <div className="flex flex-col gap-9">
          <Reveal className="max-w-[56ch] text-2xl leading-snug tracking-tight text-ink text-pretty">
            Nous nous adressons à trois segments de la population ivoirienne pour maximiser notre
            impact.
          </Reveal>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {CIBLES.map((cible, i) => (
              <Reveal key={cible.title} delay={i * 80}>
                <div className="flex h-full flex-col gap-4 rounded-md border border-ink/10 bg-surface-card p-7">
                  <cible.icon className={`h-8 w-8 ${cible.colorClass}`} aria-hidden />
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight text-ink">
                      {cible.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-text-muted">{cible.desc}</p>
                  </div>
                  <div className="mt-auto flex flex-col gap-2.5 border-t border-ink/10 pt-4">
                    <span
                      className={`text-3xl leading-none font-semibold tracking-tight tabular-nums ${cible.colorClass}`}
                    >
                      {cible.pct}
                    </span>
                    <div className="h-1 bg-n-100">
                      <div className={`h-1 ${cible.barClass}`} style={{ width: cible.pct }} />
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
