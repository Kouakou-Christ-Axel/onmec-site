import { Flag, Users, CalendarDays } from "lucide-react";
import { ErrorPageBanner } from "@/components/features/site/error-page-banner";
import { MaintenanceRetryButton } from "@/components/features/site/maintenance-retry-button";

const REASSURANCES = [
  { icon: Flag, text: "L’application de signalement fonctionne normalement." },
  { icon: Users, text: "Nos pages sur les réseaux sociaux restent actives." },
  { icon: CalendarDays, text: "Les inscriptions aux formations reprennent dès la fin de l’intervention." },
];

export default function MaintenancePage() {
  return (
    <main>
      <ErrorPageBanner
        background="bg-brand-flat"
        number="503"
        numberClassName="text-white/90"
        eyebrow="Maintenance"
        eyebrowClassName="text-white/82"
        title={
          <>
            Le site revient à <em className="font-serif font-normal italic">23h30</em>
          </>
        }
        description="Mise à jour prévue le samedi 5 septembre 2026, de 22h00 à 23h30 (GMT). Date à confirmer avec l’hébergeur."
        primary={<MaintenanceRetryButton />}
        secondary={{ label: "Nous écrire", href: "/contact" }}
      />
      <section className="py-10 sm:py-16">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-16">
          <div className="flex max-w-[760px] flex-col gap-4">
            <span className="text-xs font-semibold tracking-widest text-orange-700 uppercase">
              Pendant la maintenance
            </span>
            <div className="flex flex-col gap-3.5 border-t border-border-subtle pt-4">
              {REASSURANCES.map((item) => (
                <div key={item.text} className="flex items-start gap-3.5">
                  <item.icon className="mt-0.5 h-5 w-5 flex-none text-blue-500" aria-hidden />
                  <span className="text-base leading-relaxed text-text-body">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
