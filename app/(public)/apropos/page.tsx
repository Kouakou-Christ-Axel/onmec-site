import type { Metadata } from "next";
import { AproposHero } from "@/components/features/apropos/hero";
import { Mission } from "@/components/features/apropos/mission";
import { PresidentWord } from "@/components/features/apropos/president-word";
import { CiblesSection } from "@/components/features/apropos/cibles-section";
import { Vision } from "@/components/features/apropos/vision";
import { ImpactNumbers } from "@/components/features/apropos/impact-numbers";
import { BureauSection } from "@/components/features/apropos/bureau-section";
import { JoinTeamCta } from "@/components/features/apropos/join-team-cta";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "Le MEC est une organisation ivoirienne d'éducation à la citoyenneté, présente dans les établissements scolaires, les campus et les quartiers de Côte d'Ivoire.",
  alternates: { canonical: "/apropos" },
};

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
