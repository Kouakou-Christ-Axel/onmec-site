import { z } from "zod";

export const modifierRoleAdminUserSchema = z.object({
  role: z.enum(["ADMIN_NATIONAL", "CHARGE_COMMUNICATION", "MODERATEUR"]),
});
export type ModifierRoleAdminUserInput = z.infer<typeof modifierRoleAdminUserSchema>;
