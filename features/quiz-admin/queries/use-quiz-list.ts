"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getJson } from "@/lib/fetch-json";
import type { QuizListResponse } from "@/features/quiz-admin/types/quiz-admin";

interface UseQuizListParams {
  search: string;
  categorieId: string;
  difficulte: string;
  page: number;
  initialData: QuizListResponse;
}

export function useQuizList({
  search,
  categorieId,
  difficulte,
  page,
  initialData,
}: UseQuizListParams) {
  return useQuery({
    queryKey: ["quiz-list", search, categorieId, difficulte, page],
    queryFn: () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (categorieId) params.set("categorieId", categorieId);
      if (difficulte) params.set("difficulte", difficulte);
      params.set("page", String(page));
      return getJson<QuizListResponse>(`/api/admin/quiz?${params}`);
    },
    initialData: search || categorieId || difficulte || page !== 1 ? undefined : initialData,
    placeholderData: keepPreviousData,
  });
}
