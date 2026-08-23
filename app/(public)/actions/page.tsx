import { ActionsHero } from "@/components/features/actions/hero";
import { ProgramsGrid } from "@/components/features/actions/programs-grid";
import { Timeline } from "@/components/features/actions/timeline";
import { ActionCta } from "@/components/features/actions/action-cta";

export default function ActionsPage() {
  return (
    <main>
      <ActionsHero />
      <ProgramsGrid />
      <Timeline />
      <ActionCta />
    </main>
  );
}
