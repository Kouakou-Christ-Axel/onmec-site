import { apiFetch } from "@/lib/api-client";
import type { QuizAdmin } from "@/features/quiz-admin/types/quiz-admin";
import {
  toQuizAdmin,
  toQuizzDtoPayload,
  type QuizFormPayload,
  type QuizzResponseDto,
} from "./quiz-mapper";

export async function createQuiz(input: QuizFormPayload): Promise<QuizAdmin> {
  const dto = await apiFetch<QuizzResponseDto>("/quizz", {
    method: "POST",
    body: JSON.stringify(toQuizzDtoPayload(input)),
  });
  return toQuizAdmin(dto);
}
