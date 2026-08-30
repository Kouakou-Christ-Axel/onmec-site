"use client";

import { useQuery } from "@tanstack/react-query";
import { getJson } from "@/lib/fetch-json";
import { Skeleton } from "@/components/ui/skeleton";

interface QuizResultResume {
  id: string;
  quizId: string;
  score: number;
  completedAt?: string;
}

export function MembreTabQuiz({ membreId }: { membreId: string }) {
  const query = useQuery({
    queryKey: ["membre", membreId, "quiz"],
    queryFn: () => getJson<QuizResultResume[]>(`/api/admin/membres/${membreId}/quiz`),
  });

  if (query.isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10" />
        <Skeleton className="h-10" />
      </div>
    );
  }

  if (query.isError) {
    return <p className="text-sm text-verdict-false">Impossible de charger les quiz.</p>;
  }

  const resultats = query.data ?? [];
  if (resultats.length === 0) {
    return <p className="text-sm text-muted-foreground">Aucun quiz réalisé.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {resultats.map((r) => (
        <li
          key={r.id}
          className="flex items-center justify-between gap-2.5 rounded-md border border-border-subtle bg-surface-card px-3 py-2 text-sm"
        >
          <span className="truncate text-text-body">Quiz {r.quizId}</span>
          <span className="font-semibold text-ink">{r.score}%</span>
        </li>
      ))}
    </ul>
  );
}
