import { z } from "zod";

export const creerAdminUserSchema = z.object({
  fullname: z.string().min(1, "Le nom complet est obligatoire.").max(100),
  email: z.string().email("Email invalide."),
  phone: z.string().max(20).optional(),
  role: z.enum(["ADMIN_NATIONAL", "CHARGE_COMMUNICATION", "MODERATEUR"]),
});
export type CreerAdminUserInput = z.infer<typeof creerAdminUserSchema>;
