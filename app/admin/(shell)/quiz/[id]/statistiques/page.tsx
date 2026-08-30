import Link from "next/link";
import { ArrowLeft, PenLine } from "lucide-react";
import { getQuiz } from "@/features/quiz-admin/requests/get-quiz";
import { getQuizStats } from "@/features/quiz-admin/requests/get-quiz-stats";
import { QuizStatsCards } from "@/components/features/quiz-admin/quiz-stats-cards";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function QuizStatistiquesPage({ params }: PageProps) {
  const { id } = await params;
  const [quiz, stats] = await Promise.all([getQuiz(id), getQuizStats(id)]);
  return (
    <div className="flex max-w-[860px] flex-col gap-5.5">
      <div className="flex flex-wrap items-start justify-between gap-4.5">
        <div className="flex flex-col gap-1.75">
          <Link
            href="/admin/quiz"
            className="inline-flex items-center gap-1.5 text-[0.8125rem] text-muted-foreground hover:text-orange-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            Retour aux quiz
          </Link>
          <h1 className="text-[1.625rem] leading-[1.12] font-semibold tracking-[-0.026em] text-ink">
            {quiz.titre}
          </h1>
        </div>
        <Link
          href={`/admin/quiz/${id}/modifier`}
          className="inline-flex h-10 items-center justify-center gap-2.5 rounded-sm border border-ink/24 px-5 text-[0.9375rem] font-semibold tracking-[-0.005em] text-ink transition-colors duration-150 ease-out hover:border-ink hover:bg-n-100"
        >
          <PenLine size={16} aria-hidden />
          Éditer ce quiz
        </Link>
      </div>
      <QuizStatsCards stats={stats} />
    </div>
  );
}
