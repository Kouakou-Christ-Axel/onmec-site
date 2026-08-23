import { Download } from "lucide-react";
import { Stat } from "@/components/ui/stat";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const PERIODES = ["Janvier → août 2026", "2e trimestre 2026", "Année scolaire 2025-2026"];

const MOIS = [
  { label: "Jan", hauteur: 38, orange: false },
  { label: "Fév", hauteur: 46, orange: false },
  { label: "Mar", hauteur: 58, orange: false },
  { label: "Avr", hauteur: 74, orange: true },
  { label: "Mai", hauteur: 62, orange: false },
  { label: "Juin", hauteur: 88, orange: true },
  { label: "Juil", hauteur: 34, orange: false },
  { label: "Août", hauteur: 52, orange: false },
];

const REGIONS = [
  { region: "Abidjan", seances: 18, personnes: "1 460", signalements: 26 },
  { region: "Gbêkê (Bouaké)", seances: 11, personnes: "840", signalements: 9 },
  { region: "Haut-Sassandra (Daloa)", seances: 6, personnes: "470", signalements: 5 },
  { region: "Yamoussoukro", seances: 4, personnes: "280", signalements: 3 },
  { region: "San-Pédro", seances: 2, personnes: "130", signalements: 1 },
];

export default function StatistiquesPage() {
  return (
    <div className="flex max-w-[1320px] flex-col gap-6.5">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold tracking-[0.13em] text-orange-700 uppercase">
            Redevabilité
          </span>
          <h1 className="text-[1.75rem] leading-[1.12] font-semibold tracking-[-0.028em] text-ink">
            Statistiques et rapports
          </h1>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="w-47.5">
            <Select defaultValue={PERIODES[0]}>
              {PERIODES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </Select>
          </span>
          <Button variant="deep" icon={Download}>
            Générer le rapport
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-lg border border-border-subtle bg-surface-card p-6.5 lg:grid-cols-4">
        <Stat value="3 180" label="personnes sensibilisées" meta="Janvier → août 2026" />
        <Stat
          value="44"
          label="signalements reçus"
          meta="Depuis le lancement de l’app, mars 2026"
          rule
        />
        <Stat value="26" label="signalements résolus" meta="Janvier → août 2026" rule />
        <Stat value="12" label="campus et lycées couverts" meta="Année scolaire 2025-2026" rule />
      </div>

      <div className="grid items-start gap-5.5 lg:grid-cols-[1.35fr_1fr]">
        <div className="rounded-lg border border-border-subtle bg-surface-card p-6">
          <span className="text-xs font-semibold tracking-[0.13em] text-muted-foreground uppercase">
            Personnes sensibilisées par mois
          </span>
          <div className="mt-6 grid h-47.5 grid-cols-8 items-end gap-3.5">
            {MOIS.map((m) => (
              <span key={m.label} className="flex h-full flex-col items-center justify-end gap-2">
                <span
                  className={`w-full rounded-t-sm ${m.orange ? "bg-orange-500" : "bg-blue-500"}`}
                  style={{ height: `${m.hauteur}%` }}
                />
                <span className="text-[0.6875rem] text-muted-foreground">{m.label}</span>
              </span>
            ))}
          </div>
          <p className="mt-4.5 text-[0.8125rem] leading-relaxed text-muted-foreground">
            En orange : mois de caravane. Juillet est le creux des vacances scolaires.
          </p>
        </div>

        <div className="overflow-hidden rounded-lg border border-border-subtle bg-surface-card">
          <div className="grid grid-cols-[minmax(0,1fr)_92px_96px_88px] gap-3 border-b border-border-subtle bg-n-50 px-4 py-2.5 text-[0.6875rem] font-semibold tracking-[0.09em] text-muted-foreground uppercase">
            <span>Région</span>
            <span className="text-right">Séances</span>
            <span className="text-right">Personnes</span>
            <span className="text-right">Signal.</span>
          </div>
          {REGIONS.map((r) => (
            <div
              key={r.region}
              className="grid grid-cols-[minmax(0,1fr)_92px_96px_88px] gap-3 border-b border-border-subtle px-4 py-3 text-sm tabular-nums last:border-b-0"
            >
              <span className="font-medium text-ink">{r.region}</span>
              <span className="text-right">{r.seances}</span>
              <span className="text-right">{r.personnes}</span>
              <span className="text-right">{r.signalements}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
