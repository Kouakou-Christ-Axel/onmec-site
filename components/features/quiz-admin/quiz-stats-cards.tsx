import { Stat } from "@/components/ui/stat";
import type { QuizStatsWithAttempts } from "@/features/quiz-admin/requests/get-quiz-stats";

function scoreColor(score: number): string {
  if (score >= 70) return "text-verdict-true";
  if (score >= 40) return "text-orange-700";
  return "text-verdict-false";
}

function formatDate(iso?: string): string {
  return iso ? new Date(iso).toLocaleDateString("fr-FR") : "—";
}

interface QuizStatsCardsProps {
  stats: QuizStatsWithAttempts;
}

export function QuizStatsCards({ stats }: QuizStatsCardsProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-3 gap-4 rounded-lg border border-border-subtle bg-surface-card p-6.5">
        <Stat value={String(stats.totalAttempts)} label="tentatives complétées" rule />
        <Stat value={`${Math.round(stats.averageScore)}%`} label="score moyen" rule />
        <Stat value={String(stats.totalQuestions)} label="questions" rule />
      </div>

      <div className="overflow-hidden rounded-lg border border-border-subtle bg-surface-card">
        <div className="flex items-center justify-between gap-3 border-b border-border-subtle px-4.5 py-3.5">
          <span className="text-[0.6875rem] font-semibold tracking-[0.13em] text-muted-foreground uppercase">
            Tentatives récentes
          </span>
          <span className="text-xs text-muted-foreground">10 dernières</span>
        </div>
        {stats.recentAttempts.length === 0 ? (
          <p className="px-4.5 py-6.5 text-sm text-muted-foreground">
            Aucune tentative pour l’instant.
          </p>
        ) : (
          stats.recentAttempts.map((attempt) => (
            <div
              key={attempt.id}
              className="flex items-center justify-between gap-3 border-b border-border-subtle px-4.5 py-2.75 text-sm last:border-b-0"
            >
              <span className="truncate text-ink">Membre {attempt.userId.slice(0, 8)}</span>
              <span className="text-xs text-muted-foreground">{formatDate(attempt.completedAt)}</span>
              <span className={`font-semibold tabular-nums ${scoreColor(attempt.score)}`}>
                {Math.round(attempt.score)}%
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
