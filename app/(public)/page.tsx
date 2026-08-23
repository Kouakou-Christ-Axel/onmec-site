import { AccueilHero } from "@/components/features/accueil/hero";
import { ImpactStats } from "@/components/features/accueil/impact-stats";
import { ActionsGrid } from "@/components/features/accueil/actions-grid";
import { RecentNews } from "@/components/features/accueil/recent-news";
import { Partners } from "@/components/features/accueil/partners";
import { JoinCta } from "@/components/features/accueil/join-cta";

export default function AccueilPage() {
  return (
    <main>
      <AccueilHero />
      <ImpactStats />
      <ActionsGrid />
      <RecentNews />
      <Partners />
      <JoinCta />
    </main>
  );
}
