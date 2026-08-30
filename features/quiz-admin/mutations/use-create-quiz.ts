"use client";

import { useMutation } from "@tanstack/react-query";
import { postJson } from "@/lib/fetch-json";
import type { QuizAdmin } from "@/features/quiz-admin/types/quiz-admin";
import type { QuizFormInput } from "@/features/quiz-admin/schemas/quiz-form-schema";

export function useCreateQuiz() {
  return useMutation({
    mutationFn: (input: QuizFormInput) => postJson<QuizAdmin>("/api/admin/quiz", input),
  });
}
