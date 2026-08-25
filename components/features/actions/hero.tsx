import { Reveal } from "@/components/features/site/reveal";
import { Stat } from "@/components/features/site/stat";

const STATS = [
  { value: "34", label: "campus couverts en 2025" },
  { value: "28", label: "clubs actifs à la rentrée 2026" },
  { value: "12 400", label: "personnes sensibilisées depuis 2021" },
];

export function ActionsHero() {
  return (
    <section
      className="overflow-hidden bg-brand-flat py-14 text-white sm:py-18 lg:py-24"
      style={{ backgroundImage: "var(--pattern-stripes)" }}
    >
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 items-end gap-8 px-5 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12 lg:px-16">
        <Reveal className="flex flex-col gap-4">
          <span className="text-xs font-semibold tracking-widest text-white/80 uppercase">
            Nos actions
          </span>
          <h1 className="text-5xl leading-none font-semibold tracking-tight text-white sm:text-6xl">
            Trois programmes, <em className="font-serif font-normal italic">un seul terrain</em>
          </h1>
          <p className="max-w-[60ch] text-lg leading-relaxed text-white/90">
            Nous allons là où sont les jeunes : campus, établissements, quartiers. Ce que nous
            menons, et quand nous l’avons mené.
          </p>
        </Reveal>
        <div className="grid grid-cols-3 gap-5">
          {STATS.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 80}>
              <Stat
                value={stat.value}
                label={stat.label}
                valueClassName="text-white"
                labelClassName="text-white/85"
                borderClassName="border-white/50"
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
