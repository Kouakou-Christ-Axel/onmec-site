import { z } from "zod";

export const changerEtatSchema = z.object({
  statut: z.enum(["ACTIF", "SUSPENDU"]),
  raison: z.string().optional(),
});
export type ChangerEtatInput = z.infer<typeof changerEtatSchema>;
