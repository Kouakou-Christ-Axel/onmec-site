import { cookies } from "next/headers";

const TOKEN_COOKIE = "onmec_token";
const REFRESH_TOKEN_COOKIE = "onmec_refresh_token";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export interface AuthTokens {
  token: string;
  refreshToken: string;
}

/** onmec_backend ne pose pas de cookie lui-meme (JWT Bearer en JSON) : c'est onmec-site qui porte le cookie httpOnly. */
export async function setAuthCookies(tokens: AuthTokens): Promise<void> {
  const store = await cookies();
  store.set(TOKEN_COOKIE, tokens.token, COOKIE_OPTIONS);
  store.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, COOKIE_OPTIONS);
}

export async function clearAuthCookies(): Promise<void> {
  const store = await cookies();
  store.delete(TOKEN_COOKIE);
  store.delete(REFRESH_TOKEN_COOKIE);
}

export async function getAuthToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(TOKEN_COOKIE)?.value;
}

export async function getRefreshToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(REFRESH_TOKEN_COOKIE)?.value;
}
