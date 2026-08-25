import Link from "next/link";
import { Reveal } from "@/components/features/site/reveal";

const PARTNERS = [{ label: "Partenaire 1" }, { label: "Partenaire 2" }, { label: "Partenaire 3" }];

export function Partners() {
  return (
    <section className="py-16 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-16">
        <Reveal className="mb-11 flex max-w-[60ch] flex-col gap-3.5">
          <span className="text-xs font-semibold tracking-widest text-orange-700 uppercase">
            Nos partenaires
          </span>
          <h2 className="text-4xl leading-tight font-semibold tracking-tight text-ink sm:text-5xl">
            Ils nous font confiance
          </h2>
          <p className="text-[1.0625rem] leading-relaxed text-text-muted">
            Ils soutiennent nos actions au quotidien.
          </p>
        </Reveal>
        <div className="grid grid-cols-2 gap-px border border-ink/10 bg-ink/10 sm:grid-cols-2 lg:grid-cols-4">
          {PARTNERS.map((partner) => (
            <Reveal key={partner.label}>
              <div className="flex aspect-square flex-col items-center justify-center gap-2 bg-n-50 p-4 text-center sm:aspect-[3/2] sm:p-6">
                <span className="text-xs font-semibold tracking-widest text-n-300 uppercase">
                  Logo à fournir
                </span>
                <span className="text-sm text-text-muted">{partner.label}</span>
              </div>
            </Reveal>
          ))}
          <Reveal>
            <Link
              href="/contact"
              className="flex aspect-square flex-col items-center justify-center gap-2.5 bg-orange-500 p-4 text-center text-white transition-colors hover:bg-orange-600 sm:aspect-[3/2] sm:p-6"
            >
              <span className="text-[1.0625rem] leading-snug font-semibold">
                Devenir partenaire
              </span>
              <span className="text-sm leading-snug text-white/80">
                Établissement, institution, association →
              </span>
            </Link>
          </Reveal>
        </div>
        <Reveal className="mt-5 text-sm text-text-muted">
          Trois partenaires à afficher — noms et logos à fournir en fichier vectoriel.
        </Reveal>
      </div>
    </section>
  );
}
