import type {
  SignalementAdmin,
  SignalementStatutApi,
} from "@/features/signalements-admin/types/signalement-admin";

const ETAPES: { statut: SignalementStatutApi; label: string }[] = [
  { statut: "NOUVEAU", label: "En validation" },
  { statut: "EN_COURS", label: "En cours" },
  { statut: "RESOLU", label: "Résolu" },
];

interface SignalementModerationPanelProps {
  signalement: SignalementAdmin;
  disabled: boolean;
  onChangeStatut: (statut: SignalementStatutApi) => void;
  onChangeValidation: (validation: boolean) => void;
}

export function SignalementModerationPanel({
  signalement,
  disabled,
  onChangeStatut,
  onChangeValidation,
}: SignalementModerationPanelProps) {
  return (
    <div className="flex flex-col gap-3.5 rounded-lg border border-border-subtle bg-surface-card p-4.5">
      <span className="text-xs font-semibold tracking-[0.13em] text-muted-foreground uppercase">
        Modération
      </span>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChangeValidation(true)}
          className={`h-9.5 rounded-md border text-sm font-semibold text-blue-700 disabled:opacity-50 ${signalement.validation ? "border-ink bg-white shadow-stamp" : "border-border-strong bg-white"}`}
        >
          Afficher dans l&apos;app
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChangeValidation(false)}
          className={`h-9.5 rounded-md border text-sm font-semibold text-text-body disabled:opacity-50 ${!signalement.validation ? "border-ink bg-white shadow-stamp" : "border-border-strong bg-white"}`}
        >
          Masquer
        </button>
      </div>
      <span className="text-xs leading-relaxed text-muted-foreground">
        Un signalement masqué reste traité en interne, mais n&apos;apparaît pas dans la carte publique de
        l&apos;app.
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
            disabled={disabled}
            onClick={() => onChangeStatut(etape.statut)}
            className={`h-9.5 rounded-md border text-[0.8125rem] font-semibold text-ink disabled:opacity-50 ${signalement.statut === etape.statut ? "border-ink bg-white shadow-stamp" : "border-border-strong bg-white"}`}
          >
            {etape.label}
          </button>
        ))}
      </div>
    </div>
  );
}
