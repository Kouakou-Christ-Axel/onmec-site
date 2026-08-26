import { z } from "zod";

export const actualiteFormSchema = z.object({
  title: z.string().trim().min(1, "Le titre est requis.").max(200),
  excerpt: z.string().trim().min(1, "Le chapô est requis.").max(500),
  content: z.string().trim().min(1, "Le corps de l'article est requis."),
  date: z.string().min(1, "La date est requise."),
  categorieId: z.string().min(1, "La catégorie est requise."),
});

export type ActualiteFormInput = z.infer<typeof actualiteFormSchema>;
