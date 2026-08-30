import type { QuizQuestion } from "@/features/quiz-admin/types/quiz-admin";

export interface QuizScoreResult {
  score: number;
  total: number;
  details: { questionId: string; correct: boolean }[];
}

export function computeQuizScore(
  questions: QuizQuestion[],
  reponses: Record<string, string>,
): QuizScoreResult {
  const details = questions.map((question) => {
    const choixId = reponses[question.id ?? ""];
    const correct = question.choix.some((c) => c.id === choixId && c.correct);
    return { questionId: question.id ?? "", correct };
  });
  return {
    score: details.filter((d) => d.correct).length,
    total: questions.length,
    details,
  };
}
