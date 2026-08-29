import { z } from "zod";

export const updateSignalementSchema = z.object({
  statut: z.enum(["NOUVEAU", "EN_COURS", "RESOLU", "REJETE"]).optional(),
  validation: z.boolean().optional(),
});
export type UpdateSignalementFormInput = z.infer<typeof updateSignalementSchema>;
