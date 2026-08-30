import { z } from "zod";

export const choixSchema = z.object({
  id: z.string().optional(),
  texte: z.string().min(1, "Le texte du choix est obligatoire."),
  correct: z.boolean(),
});

export const questionSchema = z
  .object({
    id: z.string().optional(),
    texte: z.string().min(1, "Le texte de la question est obligatoire."),
    choix: z.array(choixSchema).min(2, "Au moins 2 choix sont requis."),
  })
  .refine((q) => q.choix.filter((c) => c.correct).length === 1, {
    message: "Exactement un choix doit être marqué correct.",
    path: ["choix"],
  });
