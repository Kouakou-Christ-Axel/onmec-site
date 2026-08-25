import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getApiBaseUrl } from "@/config/env";
import { AUTH_TOKEN_COOKIE, AUTH_REFRESH_COOKIE, AUTH_COOKIE_OPTIONS } from "@/config/auth";

const LOGIN_PATH = "/admin/connexion";

interface RefreshedTokens {
  token: string;
  refreshToken: string;
}

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === LOGIN_PATH) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_TOKEN_COOKIE)?.value;
  if (token) {
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
  const response = await fetch(`${getApiBaseUrl()}/auth/admin/refresh-token`, {
    method: "GET",
    headers: { Authorization: `Bearer ${refreshToken}` },
  });
  if (!response.ok) return null;
  return (await response.json()) as RefreshedTokens;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
