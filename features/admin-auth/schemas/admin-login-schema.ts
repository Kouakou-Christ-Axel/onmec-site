import { z } from "zod";

export const adminLoginSchema = z.object({
  email: z.email().max(254),
  password: z.string().min(1),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
