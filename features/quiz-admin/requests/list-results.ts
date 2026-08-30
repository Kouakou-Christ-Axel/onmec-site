import { apiFetch } from "@/lib/api-client";
import type { QuizResultListResponse } from "@/features/quiz-admin/types/quiz-admin";

export interface ListResultsParams {
  page?: number;
  limit?: number;
  quizId?: string;
}

export async function listResults(params: ListResultsParams = {}): Promise<QuizResultListResponse> {
  const query = new URLSearchParams();
  query.set("page", String(params.page ?? 1));
  query.set("limit", String(params.limit ?? 20));
  if (params.quizId) query.set("quizId", params.quizId);
  return apiFetch<QuizResultListResponse>(`/quizz/results?${query}`);
}
