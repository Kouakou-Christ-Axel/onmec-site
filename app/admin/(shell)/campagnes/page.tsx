import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import { CAMPAGNES } from "@/features/admin/data/campagnes";

const BARRE_COULEUR: Record<string, string> = {
  orange: "bg-orange-500",
  blue: "bg-blue-500",
  neutre: "bg-n-300",
};

export default function CampagnesPage() {
  return (
    <div className="flex max-w-[1320px] flex-col gap-5.5">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold tracking-[0.13em] text-orange-700 uppercase">
            Terrain
          </span>
          <h1 className="text-[1.75rem] leading-[1.12] font-semibold tracking-[-0.028em] text-ink">
            Campagnes et événements
          </h1>
        </div>
        <Button variant="primary" icon={Plus}>
          Créer une campagne
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {CAMPAGNES.map((c) => (
          <div
            key={c.titre}
            className="flex flex-col gap-3.5 rounded-lg border border-border-subtle bg-surface-card p-5.5"
          >
            <span className="flex items-center justify-between gap-3">
              <Tag tone={c.tone}>{c.statut}</Tag>
              <span className="text-xs text-muted-foreground">{c.periode}</span>
            </span>
            <span className="text-lg leading-tight font-semibold text-ink">{c.titre}</span>
            <span className="text-sm leading-relaxed text-muted-foreground">{c.resume}</span>
            <span className="block h-1.5 overflow-hidden rounded-full bg-n-100">
              <span
                className={`block h-full ${BARRE_COULEUR[c.progressionCouleur]}`}
                style={{ width: `${c.progression}%` }}
              />
            </span>
            <span className="flex items-center gap-3.5 text-xs text-muted-foreground">
              {c.note}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
