import Link from "next/link";

const AGIR_LINKS = [
  { href: "/rejoindre", label: "Devenir bénévole" },
  { href: "/rejoindre", label: "Adhérer au MEC" },
  { href: "/rejoindre", label: "Devenir partenaire" },
  { href: "/rejoindre", label: "Soutenir une action" },
];

const COMPRENDRE_LINKS = [
  { href: "/apropos", label: "À propos" },
  { href: "/actualites", label: "Actualités" },
  { href: "/ressources", label: "Ressources" },
];

export function SiteFooter() {
  return (
    <footer className="bg-blue-800 text-white/70">
      <div className="mx-auto max-w-[1280px] px-5 pt-11 pb-8 sm:px-8 lg:px-16 lg:pt-20">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-[1.6fr_repeat(3,1fr)]">
          <div className="flex flex-col items-start gap-4">
            <img src="/assets/logo/mec-reversed.png" alt="MEC" className="h-12 w-auto" />
            <span className="font-serif text-2xl text-orange-400 italic">
              Instruire pour impacter
            </span>
            <p className="max-w-[36ch] text-sm leading-relaxed">
              Mouvement pour l’Éducation à la Citoyenneté — organisation d’éducation civique, Côte
              d’Ivoire.
            </p>
          </div>

          <div className="flex flex-col items-start gap-3">
            <span className="text-xs font-semibold tracking-widest text-white/45 uppercase">
              Agir
            </span>
            {AGIR_LINKS.map((link, i) => (
              <Link key={i} href={link.href} className="text-sm text-white/80 hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex flex-col items-start gap-3">
            <span className="text-xs font-semibold tracking-widest text-white/45 uppercase">
              Comprendre
            </span>
            {COMPRENDRE_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-white/80 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex flex-col items-start gap-3">
            <span className="text-xs font-semibold tracking-widest text-white/45 uppercase">
              Contact
            </span>
            <span className="text-sm text-white/80">Abidjan, Côte d’Ivoire</span>
            <a href="mailto:contact@mec-ci.org" className="text-sm text-white/80 hover:text-white">
              contact@mec-ci.org
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap justify-between gap-4 border-t border-white/20 pt-5 text-[13px] text-white/50">
          <span>© 2026 MEC — Mouvement pour l’Éducation à la Citoyenneté</span>
          <span className="flex gap-5">
            <a href="#" className="text-white/60 hover:text-white">
              Mentions légales
            </a>
            <a href="#" className="text-white/60 hover:text-white">
              Confidentialité
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
