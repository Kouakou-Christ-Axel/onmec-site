import { z } from "zod";

export const verifyEmailSchema = z.object({
  email: z.email().max(100),
  otp: z.string().length(6),
});

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
