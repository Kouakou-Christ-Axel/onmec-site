import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { ETAPES, RESPONSABLES, type Signalement } from "@/features/admin/data/signalements";

interface SignalementModerationPanelProps {
  signalement: Signalement;
  onChange: (id: string, patch: Partial<Signalement>) => void;
}

export function SignalementModerationPanel({ signalement, onChange }: SignalementModerationPanelProps) {
  return (
    <div className="flex flex-col gap-3.5 rounded-lg border border-border-subtle bg-surface-card p-4.5">
      <span className="text-xs font-semibold tracking-[0.13em] text-muted-foreground uppercase">Modération</span>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onChange(signalement.id, { publie: true })}
          className={`h-9.5 rounded-md border text-sm font-semibold text-blue-700 ${signalement.publie ? "border-ink bg-white shadow-stamp" : "border-border-strong bg-white"}`}
        >
          Afficher dans l’app
        </button>
        <button
          type="button"
          onClick={() => onChange(signalement.id, { publie: false })}
          className={`h-9.5 rounded-md border text-sm font-semibold text-[#2b3646] ${!signalement.publie ? "border-ink bg-white shadow-stamp" : "border-border-strong bg-white"}`}
        >
          Masquer
        </button>
      </div>
      <span className="text-xs leading-relaxed text-muted-foreground">
        Un signalement masqué reste traité en interne, mais n’apparaît pas dans la carte publique de l’app.
      </span>
      <span className="h-px bg-border-subtle" />
      <span className="text-xs font-semibold tracking-[0.13em] text-muted-foreground uppercase">
        Statut du traitement
      </span>
      <div className="grid grid-cols-3 gap-2">
        {ETAPES.map((etape) => (
          <button
            key={etape.statut}
            type="button"
            onClick={() => onChange(signalement.id, { statut: etape.statut })}
            className={`h-9.5 rounded-md border text-[0.8125rem] font-semibold text-ink ${signalement.statut === etape.statut ? "border-ink bg-white shadow-stamp" : "border-border-strong bg-white"}`}
          >
            {etape.label}
          </button>
        ))}
      </div>
      <Field label="Responsable du suivi">
        <Select
          value={signalement.responsable}
          onChange={(e) => onChange(signalement.id, { responsable: e.target.value })}
        >
          <option value="">Choisir un responsable</option>
          {RESPONSABLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </Select>
      </Field>
    </div>
  );
}
