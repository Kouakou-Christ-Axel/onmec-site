import { useMutation } from "@tanstack/react-query";
import { postJson } from "@/lib/fetch-json";
import type { LoginInput } from "@/features/auth/schemas/login-schema";
import type { AuthUser } from "@/features/auth/types/auth";

export function useLogin() {
  return useMutation({
    mutationFn: (input: LoginInput) => postJson<AuthUser>("/api/auth/login", input),
  });
}
