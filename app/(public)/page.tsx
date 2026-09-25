import type { Metadata } from "next";
import { AccueilHero } from "@/components/features/accueil/hero";
import { ImpactStats } from "@/components/features/accueil/impact-stats";
import { RecentNews } from "@/components/features/accueil/recent-news";
import { Partners } from "@/components/features/accueil/partners";
import { JoinCta } from "@/components/features/accueil/join-cta";
import { getSiteUrl } from "@/config/env";

export const metadata: Metadata = {
  // `absolute` sort volontairement du template "%s | MEC" : sur l'accueil, la raison sociale
  // complète est le libellé que les gens tapent en recherche de marque ("mouvement pour
  // l'éducation à la citoyenneté"), et elle contient déjà le mot-clé principal. La signature
  // "Instruire pour impacter" reste le h1 de la page, où elle a sa place.
  title: { absolute: "MEC — Mouvement pour l'Éducation à la Citoyenneté" },
  description:
    "Le MEC forme les jeunes Ivoiriens à la citoyenneté : campagnes de sensibilisation, clubs citoyens scolaires et ressources pédagogiques en Côte d'Ivoire.",
  alternates: { canonical: "/" },
};

// JSON-LD NGO (sous-type d'Organization) : alimente le panneau de connaissance et le SEO local.
// `address` se limite à la localité (Abidjan, Côte d'Ivoire) déjà publique dans site-footer.tsx —
// le siège exact n'est pas encore communiqué (voir contact-details.tsx). Pas de `streetAddress`
// tant que cette donnée est absente : une adresse partielle correcte vaut mieux qu'une adresse
// inventée. sameAs omis : aucun lien réseau social trouvé dans site-footer.tsx à date de cette
// implémentation.
function organizationJsonLd() {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "NGO",
    name: "MEC — Mouvement pour l'Éducation à la Citoyenneté",
    url: siteUrl,
    logo: `${siteUrl}/assets/logo/mec-lockup.png`,
    email: "contact@mec-ci.org",
    telephone: "+225 05 64 36 55 53",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Abidjan",
      addressCountry: "CI",
    },
    areaServed: {
      "@type": "Country",
      name: "Côte d'Ivoire",
    },
  };
}

// Section "Nos actions" (ActionsGrid) masquée temporairement : données PROGRAMS
// entièrement mock, pas encore branchée (composant conservé).
export default function AccueilPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        // JSON.stringify échappe déjà les guillemets ; `</` neutralisé pour empêcher une
        // fermeture prématurée de la balise <script> si une valeur venait à contenir ce motif.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationJsonLd()).replace(/</g, "\\u003c"),
        }}
      />
      <AccueilHero />
      <ImpactStats />
      <RecentNews />
      <Partners />
      <JoinCta />
    </main>
  );
}
