export type QuizDifficulte = "FACILE" | "MOYEN" | "DIFFICILE";

export interface QuizChoix {
  id?: string;
  texte: string;
  correct: boolean;
}

export interface QuizQuestion {
  id?: string;
  texte: string;
  choix: QuizChoix[];
}

export interface QuizAdmin {
  id: string;
  titre: string;
  description: string | null;
  difficulte: QuizDifficulte | null;
  categorieId: string | null;
  categorie: { id: string; nom: string } | null;
  questions: QuizQuestion[];
  totalAttempts: number;
  averageScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuizListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface QuizListResponse {
  data: QuizAdmin[];
  meta: QuizListMeta;
}

export interface QuizCategorie {
  id: string;
  nom: string;
  description: string | null;
  quizCount: number;
}

export interface QuizStatistiques {
  totalQuestions: number;
  totalAttempts: number;
  averageScore: number;
}

export interface QuizResultRow {
  id: string;
  userId: string;
  userNom: string;
  quizId: string;
  quizTitre: string;
  score: number;
  completedAt: string;
}

export interface QuizResultListResponse {
  data: QuizResultRow[];
  meta: QuizListMeta;
}
