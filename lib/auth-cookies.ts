import { cookies } from "next/headers";
import { AUTH_TOKEN_COOKIE, AUTH_REFRESH_COOKIE, AUTH_COOKIE_OPTIONS } from "@/config/auth";

interface SessionTokens {
  token: string;
  refreshToken: string;
}

/**
 * Ecriture des cookies de session : appelable uniquement depuis un route handler
 * ou une Server Action. cookies().set()/delete() levent hors d'un contexte
 * de mutation (jamais depuis le render d'un Server Component/layout/page).
 * Partage entre tous les domaines d'auth (membre, admin) : un JWT porte son
 * propre claim `type`, donc les mêmes cookies servent aux deux.
 */
export async function setAuthCookies(tokens: SessionTokens): Promise<void> {
  const store = await cookies();
  store.set(AUTH_TOKEN_COOKIE, tokens.token, AUTH_COOKIE_OPTIONS);
  store.set(AUTH_REFRESH_COOKIE, tokens.refreshToken, AUTH_COOKIE_OPTIONS);
}

export async function clearAuthCookies(): Promise<void> {
  const store = await cookies();
  store.delete(AUTH_TOKEN_COOKIE);
  store.delete(AUTH_REFRESH_COOKIE);
}

export async function getRefreshToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(AUTH_REFRESH_COOKIE)?.value;
}
