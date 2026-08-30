import Link from "next/link";
import { Reveal } from "@/components/features/site/reveal";

// "Accueillir une action" masqué temporairement : page /actions non branchée (route conservée).
const RACCOURCIS = [
  { title: "Rejoindre le MEC", desc: "Bénévolat, adhésion, partenariat", href: "/rejoindre" },
  { title: "Télécharger un guide", desc: "Neuf guides libres d’accès", href: "/ressources" },
];

export function ContactCta() {
  return (
    <section className="bg-blue-800 py-14 text-white sm:py-18 lg:py-24">
      <Reveal className="mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-8 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12 lg:px-16">
        <div>
          <span className="text-xs font-semibold tracking-widest text-orange-400 uppercase">
            Avant d’écrire
          </span>
          <h2 className="mt-4 text-4xl leading-tight font-semibold tracking-tight text-white sm:text-5xl">
            Ce n’est peut-être pas le bon formulaire
          </h2>
          <p className="mt-4 max-w-[48ch] text-[1.0625rem] leading-relaxed text-white/80">
            Trois demandes sur quatre trouvent leur réponse ici, sans attendre.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {RACCOURCIS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col gap-1.5 rounded-md border border-white/25 p-5 transition-colors hover:bg-white/10"
            >
              <span className="text-base font-semibold text-white">{item.title}</span>
              <span className="text-sm text-white/70">{item.desc}</span>
            </Link>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
