import { z } from "zod";

export const ajusterPointsSchema = z.object({
  delta: z.number().refine((n) => n !== 0, "Le delta ne peut pas être nul."),
  raison: z.string().min(1, "La raison est obligatoire."),
});
export type AjusterPointsInput = z.infer<typeof ajusterPointsSchema>;
