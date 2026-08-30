import { apiFetch } from "@/lib/api-client";
import type { QuizStatistiques } from "@/features/quiz-admin/types/quiz-admin";

/**
 * QuizStatisticsResponseDto.recentAttempts est typé `array` (non détaillé) côté OpenAPI backend,
 * mais correspond aux mêmes tentatives que QuizResultResponseDto (id/userId/quizId/score/
 * completedAt) — cf. GET /quizz/results/{userId}, même modèle de données. Pas de nom de membre :
 * gap documenté dans le spec (onglet Résultats).
 */
export interface QuizAttemptSummary {
  id: string;
  userId: string;
  score: number;
  completedAt?: string;
}

export interface QuizStatsWithAttempts extends QuizStatistiques {
  recentAttempts: QuizAttemptSummary[];
}

export function getQuizStats(id: string) {
  return apiFetch<QuizStatsWithAttempts>(`/quizz/${id}/statistics`);
}
