"use client";

import { useQuery } from "@tanstack/react-query";
import { getJson } from "@/lib/fetch-json";
import type { QuizResultListResponse } from "@/features/quiz-admin/types/quiz-admin";

export function useResults(page: number, enabled: boolean) {
  return useQuery({
    queryKey: ["quiz-results", page],
    queryFn: () => getJson<QuizResultListResponse>(`/api/admin/quiz/resultats?page=${page}`),
    enabled,
  });
}
