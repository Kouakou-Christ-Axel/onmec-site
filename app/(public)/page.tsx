import { AccueilHero } from "@/components/features/accueil/hero";
import { ImpactStats } from "@/components/features/accueil/impact-stats";
import { RecentNews } from "@/components/features/accueil/recent-news";
import { Partners } from "@/components/features/accueil/partners";
import { JoinCta } from "@/components/features/accueil/join-cta";

// Section "Nos actions" (ActionsGrid) masquée temporairement : données PROGRAMS
// entièrement mock, pas encore branchée (composant conservé).
export default function AccueilPage() {
  return (
    <main>
      <AccueilHero />
      <ImpactStats />
      <RecentNews />
      <Partners />
      <JoinCta />
    </main>
  );
}
