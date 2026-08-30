import { Reveal } from "@/components/features/site/reveal";

const STATS = [
  { value: "1 000+", label: "citoyens sensibilisés", accent: "text-ink" },
  { value: "10+", label: "actions menées", accent: "text-orange-500" },
  { value: "7+", label: "partenariats actifs", accent: "text-ink" },
  { value: "2", label: "années d’expérience", accent: "text-ink" },
];

export function ImpactNumbers() {
  return (
    <section className="py-16 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-16">
        <Reveal className="mb-11 flex flex-col gap-4">
          <span className="text-xs font-semibold tracking-widest text-orange-700 uppercase">
            Chiffres d’impact
          </span>
          <h2 className="text-4xl leading-tight font-semibold tracking-tight text-ink sm:text-5xl">
            Deux ans d’activité
          </h2>
        </Reveal>
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {STATS.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 80}>
              <div className="rounded-md border border-ink/10 p-7">
                <div
                  className={`text-4xl leading-none font-semibold tracking-tight tabular-nums lg:text-5xl ${stat.accent}`}
                >
                  {stat.value}
                </div>
                <div className="mt-2.5 text-base text-ink">{stat.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
