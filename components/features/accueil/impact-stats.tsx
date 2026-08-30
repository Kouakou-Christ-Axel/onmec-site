import { Reveal } from "@/components/features/site/reveal";
import { Stat } from "@/components/features/site/stat";

const STATS = [
  { value: "1 000+", label: "citoyens sensibilisés", accent: "text-ink" },
  { value: "10+", label: "actions menées", accent: "text-orange-500" },
  { value: "7+", label: "partenariats actifs", accent: "text-ink" },
  { value: "2", label: "années d’expérience", accent: "text-ink" },
];

export function ImpactStats() {
  return (
    <section className="border-b border-ink/10 bg-surface-card py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-16">
        <Reveal className="mb-11 flex max-w-[60ch] flex-col gap-3.5">
          <span className="text-xs font-semibold tracking-widest text-orange-700 uppercase">
            Notre impact
          </span>
          <p className="text-lg leading-relaxed text-text-muted text-pretty">
            Des chiffres qui témoignent de notre engagement et de notre impact sur la société
            ivoirienne.
          </p>
        </Reveal>
        <div className="grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-4">
          {STATS.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 80}>
              <Stat value={stat.value} label={stat.label} valueClassName={stat.accent} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
