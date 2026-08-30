"use client";

import { useMutation } from "@tanstack/react-query";
import { patchJson } from "@/lib/fetch-json";
import type { QuizAdmin } from "@/features/quiz-admin/types/quiz-admin";
import type { QuizFormInput } from "@/features/quiz-admin/schemas/quiz-form-schema";

interface Input extends QuizFormInput {
  id: string;
}

export function useUpdateQuiz() {
  return useMutation({
    mutationFn: ({ id, ...body }: Input) => patchJson<QuizAdmin>(`/api/admin/quiz/${id}`, body),
  });
}
