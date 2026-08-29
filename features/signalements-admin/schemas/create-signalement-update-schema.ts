import { z } from "zod";

export const createSignalementUpdateSchema = z.object({
  texte: z.string().min(1, "Le texte est obligatoire."),
});
export type CreateSignalementUpdateFormInput = z.infer<typeof createSignalementUpdateSchema>;
