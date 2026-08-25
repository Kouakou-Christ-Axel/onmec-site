import Link from "next/link";
import { Megaphone, BookOpen, Newspaper, Users } from "lucide-react";

const LINKS = [
  {
    href: "/actions",
    icon: Megaphone,
    title: "Nos actions",
    desc: "Campagnes, clubs scolaires et vérification des faits.",
    cta: "Voir les programmes →",
    highlight: false,
  },
  {
    href: "/ressources",
    icon: BookOpen,
    title: "Ressources",
    desc: "Guides, fiches d’activité et affiches à télécharger.",
    cta: "Ouvrir le catalogue →",
    highlight: false,
  },
  {
    href: "/actualites",
    icon: Newspaper,
    title: "Actualités",
    desc: "Comptes rendus d’activités, bilans et communiqués.",
    cta: "Lire les actualités →",
    highlight: false,
  },
  {
    href: "/rejoindre",
    icon: Users,
    title: "Rejoindre le mouvement",
    desc: "Bénévole, membre adhérent, partenaire ou donateur.",
    cta: "Remplir le formulaire →",
    highlight: true,
  },
];

/** Grille "Où aller maintenant" — pied de page partagé aux pages système 404/500/403. */
export function ErrorExploreLinks() {
  return (
    <section className="py-14 sm:py-16">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-16">
        <div className="mb-7 flex flex-col gap-3.5">
          <span className="text-xs font-semibold tracking-widest text-orange-700 uppercase">
            Continuer la visite
          </span>
          <h2 className="text-h1 font-semibold text-ink">Où aller maintenant</h2>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col gap-3 rounded-md border p-6 transition-transform hover:-translate-y-0.5 ${
                link.highlight
                  ? "border-orange-500 bg-orange-500 text-white"
                  : "border-border-subtle bg-surface-card text-ink hover:border-orange-500"
              }`}
            >
              <link.icon className={`h-7 w-7 ${link.highlight ? "text-white" : "text-blue-500"}`} aria-hidden />
              <span className="text-[1.0625rem] font-semibold">{link.title}</span>
              <span className={`text-sm leading-relaxed ${link.highlight ? "text-white/86" : "text-text-muted"}`}>
                {link.desc}
              </span>
              <span
                className={`mt-auto text-sm font-medium ${link.highlight ? "text-white" : "text-orange-700"}`}
              >
                {link.cta}
              </span>
            </Link>
          ))}
        </div>
        <p className="mt-7 text-[0.9375rem] text-text-muted">
          Vous cherchiez autre chose ? <Link href="/contact">Écrivez-nous</Link> en décrivant la page
          que vous attendiez.
        </p>
      </div>
    </section>
  );
}
