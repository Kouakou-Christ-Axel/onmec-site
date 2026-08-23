import { AproposHero } from "@/components/features/apropos/hero";
import { Mission } from "@/components/features/apropos/mission";
import { PresidentWord } from "@/components/features/apropos/president-word";
import { CiblesSection } from "@/components/features/apropos/cibles-section";
import { Vision } from "@/components/features/apropos/vision";
import { ImpactNumbers } from "@/components/features/apropos/impact-numbers";
import { BureauSection } from "@/components/features/apropos/bureau-section";
import { JoinTeamCta } from "@/components/features/apropos/join-team-cta";

export default function AproposPage() {
  return (
    <main>
      <AproposHero />
      <Mission />
      <PresidentWord />
      <CiblesSection />
      <Vision />
      <ImpactNumbers />
      <BureauSection />
      <JoinTeamCta />
    </main>
  );
}
