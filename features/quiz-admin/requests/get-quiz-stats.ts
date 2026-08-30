import { apiFetch } from "@/lib/api-client";
import type { QuizStatistiques } from "@/features/quiz-admin/types/quiz-admin";

/**
 * QuizStatisticsResponseDto.recentAttempts est typé `array` (non détaillé) côté OpenAPI backend.
 * Forme réelle confirmée dans quizz.service.ts#getQuizStatistics : pas d'id de tentative, le
 * membre est imbriqué sous `user` (id + fullname).
 */
export interface QuizAttemptSummary {
  score: number;
  completedAt?: string;
  user: { id: string; fullname: string };
}

export interface QuizStatsWithAttempts extends QuizStatistiques {
  recentAttempts: QuizAttemptSummary[];
}

export function getQuizStats(id: string) {
  return apiFetch<QuizStatsWithAttempts>(`/quizz/${id}/statistics`);
}
