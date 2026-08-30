import type {
  QuizAdmin,
  QuizDifficulte,
  QuizQuestion,
} from "@/features/quiz-admin/types/quiz-admin";

export interface ChoiceResponseDto {
  id: string;
  text: string;
  /** Présent uniquement quand l'appelant est admin (OptionalJwtAuthGuard côté backend). */
  isCorrect?: boolean;
}

export interface QuestionResponseDto {
  id: string;
  text: string;
  choices: ChoiceResponseDto[];
}

export interface QuizzResponseDto {
  id: string;
  title: string;
  description?: string | null;
  difficulte?: QuizDifficulte | null;
  categorieId?: string | null;
  categorie?: { id: string; nom: string } | null;
  questions: QuestionResponseDto[];
  totalAttempts: number;
  averageScore: number;
  createdAt: string;
  updatedAt: string;
}

export function toQuizAdmin(dto: QuizzResponseDto): QuizAdmin {
  return {
    id: dto.id,
    titre: dto.title,
    description: dto.description ?? null,
    difficulte: dto.difficulte ?? null,
    categorieId: dto.categorieId ?? null,
    categorie: dto.categorie ?? null,
    questions: dto.questions.map((q) => ({
      id: q.id,
      texte: q.text,
      choix: q.choices.map((c) => ({ id: c.id, texte: c.text, correct: c.isCorrect ?? false })),
    })),
    totalAttempts: dto.totalAttempts,
    averageScore: dto.averageScore,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

export interface QuizFormPayload {
  titre: string;
  description?: string;
  categorieId?: string;
  difficulte?: QuizDifficulte;
  questions: QuizQuestion[];
}

/**
 * Body attendu par CreateQuizzDto/UpdateQuizzDto (onmec_backend) — champs en anglais.
 * CreateQuestionDto/CreateChoiceDto (utilisés aussi bien par POST que par PATCH) ne déclarent pas
 * de champ `id` : le backend "remplace questions et choix" en bloc à chaque PATCH avec `questions`
 * fourni, pas d'upsert par id. On n'envoie donc jamais d'id ici, cohérent avec le DTO documenté.
 */
export function toQuizzDtoPayload(input: QuizFormPayload) {
  return {
    title: input.titre,
    description: input.description || undefined,
    categorieId: input.categorieId || undefined,
    difficulte: input.difficulte,
    questions: input.questions.map((q) => ({
      text: q.texte,
      choices: q.choix.map((c) => ({ text: c.texte, isCorrect: c.correct })),
    })),
  };
}
