import Link from "next/link";
import { ErrorPageBanner } from "@/components/features/site/error-page-banner";
import { ErrorExploreLinks } from "@/components/features/site/error-explore-links";

export default function Forbidden() {
  return (
    <main>
      <ErrorPageBanner
        background="bg-blue-800"
        number="403"
        numberClassName="text-orange-500"
        eyebrow="Accès réservé"
        eyebrowClassName="text-orange-400"
        title={
          <>
            Cette page est réservée aux <em className="font-serif font-normal italic">membres</em>
          </>
        }
        description="Bénévoles, ambassadeurs et encadreurs de club y accèdent depuis leur espace membre. L’adhésion est gratuite."
        // L'espace membre (maquette "Espace membre MEC.dc.html") n'existe pas encore dans ce
        // projet — les deux CTA pointent vers /rejoindre en attendant, à corriger une fois
        // l'espace membre livré.
        primary={{ label: "Me connecter", href: "/rejoindre" }}
        secondary={{ label: "Rejoindre le mouvement", href: "/rejoindre" }}
      />
      <section className="pt-10 sm:pt-16">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-16">
          <div className="grid max-w-[860px] grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-3 rounded-md border border-border-subtle bg-surface-card p-6">
              <span className="text-[1.0625rem] font-semibold text-ink">Vous êtes déjà membre</span>
              <p className="text-[0.9375rem] leading-relaxed text-text-muted">
                Connectez-vous, ou activez votre compte si c’est votre première visite depuis votre
                adhésion.
              </p>
              <Link href="/rejoindre" className="text-[0.9375rem] font-medium text-ink">
                Espace membre →
              </Link>
            </div>
            <div className="flex flex-col gap-3 rounded-md border border-border-subtle bg-surface-card p-6">
              <span className="text-[1.0625rem] font-semibold text-ink">
                Vous ne l’êtes pas encore
              </span>
              <p className="text-[0.9375rem] leading-relaxed text-text-muted">
                Le formulaire d’adhésion prend deux minutes. Votre accès est ouvert après validation
                par votre section.
              </p>
              <Link href="/rejoindre" className="text-[0.9375rem] font-medium text-ink">
                Rejoindre le mouvement →
              </Link>
            </div>
          </div>
        </div>
      </section>
      <ErrorExploreLinks />
    </main>
  );
}
