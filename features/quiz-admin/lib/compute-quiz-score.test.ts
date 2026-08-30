import { describe, expect, it } from "vitest";
import { computeQuizScore } from "@/features/quiz-admin/lib/compute-quiz-score";
import type { QuizQuestion } from "@/features/quiz-admin/types/quiz-admin";

const questions: QuizQuestion[] = [
  {
    id: "q1",
    texte: "2+2 ?",
    choix: [
      { id: "a", texte: "3", correct: false },
      { id: "b", texte: "4", correct: true },
    ],
  },
  {
    id: "q2",
    texte: "Capitale de la Côte d'Ivoire ?",
    choix: [
      { id: "c", texte: "Abidjan", correct: false },
      { id: "d", texte: "Yamoussoukro", correct: true },
    ],
  },
];

describe("computeQuizScore", () => {
  it("compte les bonnes reponses", () => {
    const result = computeQuizScore(questions, { q1: "b", q2: "c" });
    expect(result.score).toBe(1);
    expect(result.total).toBe(2);
    expect(result.details).toEqual([
      { questionId: "q1", correct: true },
      { questionId: "q2", correct: false },
    ]);
  });

  it("traite une question sans reponse comme incorrecte", () => {
    const result = computeQuizScore(questions, { q1: "b" });
    expect(result.score).toBe(1);
    expect(result.details[1]).toEqual({ questionId: "q2", correct: false });
  });
});
