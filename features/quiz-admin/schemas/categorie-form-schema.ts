import { z } from "zod";

export const categorieFormSchema = z.object({
  nom: z.string().min(1, "Le nom est obligatoire."),
  description: z.string().optional(),
});
export type CategorieFormInput = z.infer<typeof categorieFormSchema>;
