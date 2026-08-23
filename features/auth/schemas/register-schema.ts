import { z } from "zod";

// Verbatim depuis onmec_backend/src/modules/auth/dto/register-user.dto.ts —
// ne pas durcir : un regex plus strict que le backend rejetterait des mots
// de passe valides sans signal serveur.
const PASSWORD_REGEX =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{}|;':".,<>?/\\])[A-Za-z\d!@#$%^&*()_+\-=[\]{}|;':".,<>?/\\]{8,}$/;

export const registerSchema = z.object({
  email: z.email().max(100),
  password: z.string().min(8).max(15).regex(PASSWORD_REGEX),
  fullname: z.string().trim().min(1).max(100),
  phone: z.string().trim().max(20).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
