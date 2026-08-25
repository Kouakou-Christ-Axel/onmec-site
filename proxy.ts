import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getApiBaseUrl } from "@/config/env";
import { AUTH_TOKEN_COOKIE, AUTH_REFRESH_COOKIE, AUTH_COOKIE_OPTIONS } from "@/config/auth";

const LOGIN_PATH = "/admin/connexion";
// Marge de sécurité avant l'expiration réelle du JWT pour déclencher le refresh un peu en avance.
const EXPIRY_LEEWAY_SECONDS = 10;
const REFRESH_TIMEOUT_MS = 5000;

interface RefreshedTokens {
  token: string;
  refreshToken: string;
}

/**
 * Décode (sans vérifier la signature) le payload d'un JWT pour lire la claim `exp` et déterminer
 * si le token est expiré (ou sur le point de l'être). Un token absent, malformé ou indécodable est
 * traité comme expiré : la signature sera de toute façon vérifiée par le backend lors du véritable
 * appel de refresh, ceci n'est qu'une heuristique edge pour décider s'il faut tenter un refresh.
 */
function isTokenExpired(token: string): boolean {
  try {
    const payloadSegment = token.split(".")[1];
    if (!payloadSegment) return true;

    const base64 = payloadSegment.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const payload = JSON.parse(atob(padded)) as { exp?: unknown };

    if (typeof payload.exp !== "number") return true;
    return payload.exp <= Date.now() / 1000 + EXPIRY_LEEWAY_SECONDS;
  } catch {
    return true;
  }
}

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === LOGIN_PATH) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_TOKEN_COOKIE)?.value;
  if (token && !isTokenExpired(token)) {
    return NextResponse.next();
  }

  const refreshToken = request.cookies.get(AUTH_REFRESH_COOKIE)?.value;
  if (!refreshToken) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }

  const refreshed = await refreshAdminTokens(refreshToken);
  if (!refreshed) {
    const response = NextResponse.redirect(new URL(LOGIN_PATH, request.url));
    response.cookies.delete(AUTH_TOKEN_COOKIE);
    response.cookies.delete(AUTH_REFRESH_COOKIE);
    return response;
  }

  request.cookies.set(AUTH_TOKEN_COOKIE, refreshed.token);
  request.cookies.set(AUTH_REFRESH_COOKIE, refreshed.refreshToken);

  const response = NextResponse.next({ request });
  response.cookies.set(AUTH_TOKEN_COOKIE, refreshed.token, AUTH_COOKIE_OPTIONS);
  response.cookies.set(AUTH_REFRESH_COOKIE, refreshed.refreshToken, AUTH_COOKIE_OPTIONS);
  return response;
}

async function refreshAdminTokens(refreshToken: string): Promise<RefreshedTokens | null> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/auth/admin/refresh-token`, {
      method: "GET",
      headers: { Authorization: `Bearer ${refreshToken}` },
      signal: AbortSignal.timeout(REFRESH_TIMEOUT_MS),
    });
    if (!response.ok) return null;
    return (await response.json()) as RefreshedTokens;
  } catch {
    return null;
  }
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
