import { useMutation } from "@tanstack/react-query";
import { postJson } from "@/lib/fetch-json";
import type { RegisterInput } from "@/features/auth/schemas/register-schema";
import type { OtpSentResponse } from "@/features/auth/types/auth";

export function useRegister() {
  return useMutation({
    mutationFn: (input: RegisterInput) => postJson<OtpSentResponse>("/api/auth/register", input),
  });
}
