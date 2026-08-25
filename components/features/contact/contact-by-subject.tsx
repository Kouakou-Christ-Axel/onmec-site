import { Reveal } from "@/components/features/site/reveal";
import { CONTACTS_PAR_SUJET } from "@/features/contact/data/content";

export function ContactBySubject() {
  return (
    <section className="bg-n-100 py-14 sm:py-18 lg:py-24">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-16">
        <Reveal className="mb-11 flex max-w-[600px] flex-col gap-3.5">
          <span className="text-xs font-semibold tracking-widest text-orange-700 uppercase">
            Écrire à la bonne personne
          </span>
          <h2 className="text-h1 font-semibold text-ink">Contacts par sujet</h2>
        </Reveal>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {CONTACTS_PAR_SUJET.map((card, i) => (
            <Reveal key={card.title} delay={i * 80}>
              <div className="flex h-full flex-col gap-4 rounded-md border border-ink/10 bg-surface-card p-6">
                <card.icon className="h-8 w-8 text-orange-600" aria-hidden />
                <h3 className="text-lg font-semibold text-ink">{card.title}</h3>
                <p className="text-sm leading-relaxed text-text-muted">{card.desc}</p>
                <a
                  href={card.href}
                  className="mt-auto border-t border-ink/10 pt-4 text-sm font-semibold text-orange-700 transition-colors hover:text-orange-800"
                >
                  {card.action}
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
