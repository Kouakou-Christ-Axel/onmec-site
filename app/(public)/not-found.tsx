import Link from "next/link";
import { ErrorPageBanner } from "@/components/features/site/error-page-banner";
import { ErrorExploreLinks } from "@/components/features/site/error-explore-links";
import { NotFoundSearch } from "@/components/features/site/not-found-search";

export default function NotFound() {
  return (
    <main>
      <ErrorPageBanner
        background="bg-brand-flat"
        number="404"
        numberClassName="text-white/90"
        eyebrow="Page introuvable"
        eyebrowClassName="text-white/82"
        title={
          <>
            Cette page a <em className="font-serif font-normal italic">disparu</em>
          </>
        }
        description="Le lien est peut-être ancien, ou l’adresse comporte une faute. Rien n’est perdu : voici par où reprendre."
        primary={{ label: "Retour à l’accueil", href: "/" }}
        secondary={{ label: "Voir les ressources", href: "/ressources" }}
      />
      <section className="pt-10 sm:pt-16">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-16">
          <div className="flex max-w-[760px] flex-col gap-4 border border-ink bg-surface-card p-6 shadow-stamp sm:p-8">
            <span className="text-xs font-semibold tracking-widest text-orange-700 uppercase">
              Chercher
            </span>
            <h2 className="text-h3 font-semibold text-ink">Trouver un guide ou une page</h2>
            <NotFoundSearch />
            <span className="text-sm leading-relaxed text-text-muted">
              Pages les plus consultées : <Link href="/actions">Nos actions</Link> ·{" "}
              <Link href="/ressources">Ressources</Link> ·{" "}
              <Link href="/rejoindre">Rejoindre le mouvement</Link>
            </span>
          </div>
        </div>
      </section>
      <ErrorExploreLinks />
    </main>
  );
}
