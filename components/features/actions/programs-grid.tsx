import { Reveal } from "@/components/features/site/reveal";
import { PROGRAMMES } from "@/features/actions/data/programmes";

export function ProgramsGrid() {
  return (
    <section className="py-14 sm:py-18 lg:py-24">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-16">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {PROGRAMMES.map((programme, i) => (
            <Reveal key={programme.title} delay={i * 80}>
              <div className="flex h-full flex-col gap-4 rounded-md border border-ink/10 bg-surface-card p-7 transition duration-150 ease-out hover:-translate-y-1 hover:border-orange-500 hover:shadow-stamp-sm">
                <programme.icon className="h-9 w-9 text-orange-600" aria-hidden />
                <h2 className="text-h3 font-semibold text-ink">{programme.title}</h2>
                <p className="text-sm leading-relaxed text-text-muted">{programme.desc}</p>
                <ul className="flex flex-col gap-1.5">
                  {programme.facts.map((fact) => (
                    <li
                      key={fact}
                      className="flex items-start gap-2 text-[13px] leading-relaxed text-text-muted"
                    >
                      <span className="mt-1.5 h-1 w-1 flex-none rounded-full bg-orange-500" />
                      {fact}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto border-t border-ink/10 pt-4 text-sm font-semibold text-ink">
                  {programme.result}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
