import { Reveal } from "@/components/features/site/reveal";
import { Stat } from "@/components/features/site/stat";

export function ContactHero() {
  return (
    <section className="py-11 sm:py-14 lg:py-20">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-16">
        <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <Reveal className="flex max-w-[760px] flex-col gap-4">
            <span className="text-xs font-semibold tracking-widest text-orange-700 uppercase">
              Contact
            </span>
            <h1 className="text-5xl leading-none font-semibold tracking-tight text-ink sm:text-6xl">
              Écrivez-nous, <em className="font-serif font-normal italic">nous répondons</em>
            </h1>
            <p className="max-w-[60ch] text-lg leading-relaxed text-text-muted">
              Une question, une invitation, une demande de partenariat. Choisissez l’objet le plus
              proche, cela nous fait gagner un jour.
            </p>
          </Reveal>
          <Reveal delay={80}>
            <Stat
              value="Sous 3 jours ouvrés"
              label="Délai de réponse constaté sur les six derniers mois. Les demandes presse sont traitées le jour même."
              borderClassName="border-orange-500"
              labelClassName="text-text-muted"
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
