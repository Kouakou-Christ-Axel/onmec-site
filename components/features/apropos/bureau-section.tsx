import { Reveal } from "@/components/features/site/reveal";
import { PhotoPlaceholder } from "@/components/features/site/photo-placeholder";
import { BUREAU } from "@/features/apropos/data/apropos-content";

export function BureauSection() {
  return (
    <section className="border-y border-ink/10 bg-surface-card py-16 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-16">
        <Reveal className="mb-11 flex flex-wrap items-end justify-between gap-5">
          <div className="flex flex-col gap-3.5">
            <span className="text-xs font-semibold tracking-widest text-orange-700 uppercase">
              Bureau exécutif
            </span>
            <h2 className="text-4xl leading-tight font-semibold tracking-tight text-ink sm:text-5xl">
              Qui porte le mouvement
            </h2>
          </div>
          <span className="max-w-[34ch] text-right text-sm text-text-muted">
            Portraits en couleurs naturelles, cadrage serré. Noms et fonctions à confirmer.
          </span>
        </Reveal>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:gap-8">
          {BUREAU.map((member, i) => (
            <Reveal key={member.role} delay={(i % 3) * 80} className="flex flex-col gap-3.5">
              <PhotoPlaceholder ratio="1/1" square label="Portrait à fournir" />
              <div>
                <div className="text-lg font-semibold tracking-tight text-ink">{member.name}</div>
                <div className="mt-0.5 text-[15px] text-text-muted">{member.role}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
