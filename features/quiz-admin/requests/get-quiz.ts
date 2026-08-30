import { apiFetch } from "@/lib/api-client";
import type { QuizAdmin } from "@/features/quiz-admin/types/quiz-admin";
import { toQuizAdmin, type QuizzResponseDto } from "./quiz-mapper";

export async function getQuiz(id: string): Promise<QuizAdmin> {
  const dto = await apiFetch<QuizzResponseDto>(`/quizz/${id}`);
  return toQuizAdmin(dto);
}
