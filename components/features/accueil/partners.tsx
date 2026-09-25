import Link from "next/link";
import { Reveal } from "@/components/features/site/reveal";

const PARTNERS: { label: string; logo: string }[] = [
  {
    label: "Ministère de l'Éducation Nationale et de l'Alphabétisation",
    logo: "/assets/partenaires/mena.webp",
  },
  {
    label: "CNJCI — Conseil National des Jeunes de Côte d'Ivoire",
    logo: "/assets/partenaires/cnjci.webp",
  },
  {
    label: "Ministère de l'Intérieur et de la Sécurité",
    logo: "/assets/partenaires/ministere-interieur-securite.webp",
  },
];

export function Partners() {
  if (!PARTNERS.length) return null;

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
              <div className="flex aspect-square flex-col items-center justify-center gap-2 bg-n-50 p-6 text-center sm:aspect-[3/2] sm:p-8">
                <img
                  src={partner.logo}
                  alt={partner.label}
                  className="max-h-16 w-full object-contain sm:max-h-20"
                />
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
      </div>
    </section>
  );
}
