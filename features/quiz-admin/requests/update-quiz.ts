import { apiFetch } from "@/lib/api-client";
import type { QuizAdmin } from "@/features/quiz-admin/types/quiz-admin";
import {
  toQuizAdmin,
  toQuizzDtoPayload,
  type QuizFormPayload,
  type QuizzResponseDto,
} from "./quiz-mapper";

export async function updateQuiz(id: string, input: QuizFormPayload): Promise<QuizAdmin> {
  const dto = await apiFetch<QuizzResponseDto>(`/quizz/${id}`, {
    method: "PATCH",
    body: JSON.stringify(toQuizzDtoPayload(input)),
  });
  return toQuizAdmin(dto);
}
