import { Reveal } from "@/components/features/site/reveal";
import { VALEURS } from "@/features/apropos/data/apropos-content";

export function Vision() {
  return (
    <section className="border-y border-ink/10 bg-surface-card py-16 sm:py-20 lg:py-28">
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-9 px-5 sm:px-8 lg:grid-cols-[180px_1fr] lg:gap-20 lg:px-16">
        <span className="text-xs font-semibold tracking-widest text-orange-700 uppercase">
          Vision
        </span>
        <div className="flex flex-col gap-10">
          <Reveal className="max-w-[60ch] text-2xl leading-snug tracking-tight text-ink text-pretty">
            Une Côte d’Ivoire où l’éducation civique ne s’arrête pas à la salle de classe, et où
            chaque établissement porte son propre club citoyen.
          </Reveal>
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {VALEURS.map((valeur) => (
              <div key={valeur.title} className="border-t-2 border-ink pt-4">
                <h3 className="mb-2 text-[1.0625rem] font-semibold text-ink">{valeur.title}</h3>
                <p className="text-sm leading-relaxed text-text-muted">{valeur.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
