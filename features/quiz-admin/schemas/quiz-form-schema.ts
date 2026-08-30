import { z } from "zod";
import { questionSchema } from "./question-schema";

export const quizFormSchema = z.object({
  titre: z.string().min(1, "Le titre est obligatoire."),
  description: z.string().optional(),
  categorieId: z.string().optional(),
  difficulte: z.enum(["FACILE", "MOYEN", "DIFFICILE"]).optional(),
  questions: z.array(questionSchema).default([]),
});
export type QuizFormInput = z.infer<typeof quizFormSchema>;
