import { z } from "zod";

export const adminChangePasswordSchema = z.object({
  oldPassword: z.string().min(1),
  password: z.string().min(12).max(128),
});

export type AdminChangePasswordInput = z.infer<typeof adminChangePasswordSchema>;
