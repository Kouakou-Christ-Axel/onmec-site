import { Stat } from "@/components/ui/stat";
import { ApiError } from "@/lib/api-error";
import { getAdminStatistics } from "@/features/statistiques-admin/requests/get-admin-statistics";
import type { AdminStatistics } from "@/features/statistiques-admin/types/admin-statistics";

const STATUT_LABELS: Record<keyof AdminStatistics["signalements"]["parStatut"], string> = {
  NOUVEAU: "En validation",
  EN_COURS: "En cours",
  RESOLU: "Résolu",
  REJETE: "Rejeté",
};

async function loadStats(): Promise<AdminStatistics | null> {
  try {
    return await getAdminStatistics();
  } catch (error) {
    if (error instanceof ApiError) return null;
    throw error;
  }
}

export default async function StatistiquesPage() {
  const stats = await loadStats();

  return (
    <div className="flex max-w-[1320px] flex-col gap-6.5">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold tracking-[0.13em] text-orange-700 uppercase">
          Redevabilité
        </span>
        <h1 className="text-[1.75rem] leading-[1.12] font-semibold tracking-[-0.028em] text-ink">
          Statistiques et rapports
        </h1>
      </div>

      {stats ? <StatistiquesContent stats={stats} /> : <StatistiquesAVenir />}
    </div>
  );
}

function StatistiquesContent({ stats }: { stats: AdminStatistics }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4 rounded-lg border border-border-subtle bg-surface-card p-6.5 lg:grid-cols-4">
        <Stat value={String(stats.signalements.total)} label="signalements reçus" />
        <Stat
          value={String(stats.signalements.parStatut.RESOLU)}
          label="signalements résolus"
          rule
        />
        <Stat value={String(stats.membres.actifs)} label="membres actifs" rule />
        <Stat
          value={String(stats.quiz.totalTentatives)}
          label="tentatives de quiz"
          meta={`${stats.quiz.totalQuiz} quiz · score moyen ${stats.quiz.scoreMoyenGlobal.toFixed(0)}%`}
          rule
        />
      </div>

      <div className="grid items-start gap-5.5 lg:grid-cols-2">
        <div className="overflow-hidden rounded-lg border border-border-subtle bg-surface-card">
          <div className="border-b border-border-subtle bg-n-50 px-4 py-2.5 text-[0.6875rem] font-semibold tracking-[0.09em] text-muted-foreground uppercase">
            Signalements par statut
          </div>
          {(Object.keys(STATUT_LABELS) as (keyof typeof STATUT_LABELS)[]).map((statut) => (
            <div
              key={statut}
              className="flex items-center justify-between border-b border-border-subtle px-4 py-3 text-sm last:border-b-0"
            >
              <span className="font-medium text-ink">{STATUT_LABELS[statut]}</span>
              <span className="tabular-nums text-muted-foreground">
                {stats.signalements.parStatut[statut]}
              </span>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-lg border border-border-subtle bg-surface-card">
          <div className="border-b border-border-subtle bg-n-50 px-4 py-2.5 text-[0.6875rem] font-semibold tracking-[0.09em] text-muted-foreground uppercase">
            Signalements par catégorie
          </div>
          {stats.signalements.parCategorie.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">Aucune catégorie.</p>
          ) : (
            stats.signalements.parCategorie.map((c) => (
              <div
                key={c.categorieId}
                className="flex items-center justify-between border-b border-border-subtle px-4 py-3 text-sm last:border-b-0"
              >
                <span className="font-medium text-ink">{c.nom}</span>
                <span className="tabular-nums text-muted-foreground">{c.total}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

function StatistiquesAVenir() {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border-subtle bg-surface-card px-5 py-10 text-center">
      <p className="text-sm text-muted-foreground">
        Statistiques bientôt disponibles — en attente de l’endpoint d’agrégats côté backend.
      </p>
    </div>
  );
}
