import { z } from "zod";

export const changerStatutAdminUserSchema = z.object({
  isActive: z.boolean(),
});
export type ChangerStatutAdminUserInput = z.infer<typeof changerStatutAdminUserSchema>;
