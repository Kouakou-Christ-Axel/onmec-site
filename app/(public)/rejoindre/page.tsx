import type { Metadata } from "next";
import { RejoindreHero } from "@/components/features/rejoindre/hero";
import { JoinForm } from "@/components/features/rejoindre/join-form";

export const metadata: Metadata = {
  title: "Rejoindre le mouvement",
  description:
    "Quatre façons de vous engager auprès du MEC : devenir bénévole, adhérer, devenir partenaire ou soutenir une action. Adhésion gratuite, sans cotisation.",
  alternates: { canonical: "/rejoindre" },
};

export default function RejoindrePage() {
  return (
    <main>
      <RejoindreHero />
      <JoinForm />
    </main>
  );
}
