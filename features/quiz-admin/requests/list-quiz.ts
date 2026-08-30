import { apiFetch } from "@/lib/api-client";
import type { QuizListResponse } from "@/features/quiz-admin/types/quiz-admin";
import { toQuizAdmin, type QuizzResponseDto } from "./quiz-mapper";

interface BackendListResponse {
  data: QuizzResponseDto[];
  meta: QuizListResponse["meta"];
}

export interface ListQuizParams {
  categorieId?: string;
  difficulte?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export async function listQuiz(params: ListQuizParams = {}): Promise<QuizListResponse> {
  const query = new URLSearchParams();
  if (params.categorieId) query.set("categorieId", params.categorieId);
  if (params.difficulte) query.set("difficulte", params.difficulte);
  if (params.search) query.set("search", params.search);
  query.set("page", String(params.page ?? 1));
  query.set("limit", String(params.limit ?? 20));
  const response = await apiFetch<BackendListResponse>(`/quizz?${query}`);
  return { data: response.data.map(toQuizAdmin), meta: response.meta };
}
