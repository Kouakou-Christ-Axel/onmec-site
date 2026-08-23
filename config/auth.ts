import { isProduction } from "@/config/env";

export const AUTH_TOKEN_COOKIE = "onmec_token";
export const AUTH_REFRESH_COOKIE = "onmec_refresh_token";

export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction(),
  sameSite: "lax" as const,
  path: "/",
};
