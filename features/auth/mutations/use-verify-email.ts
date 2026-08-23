import { useMutation } from "@tanstack/react-query";
import { postJson } from "@/lib/fetch-json";
import type { VerifyEmailInput } from "@/features/auth/schemas/verify-email-schema";
import type { AuthUser } from "@/features/auth/types/auth";

export function useVerifyEmail() {
  return useMutation({
    mutationFn: (input: VerifyEmailInput) => postJson<AuthUser>("/api/auth/verify-email", input),
  });
}
