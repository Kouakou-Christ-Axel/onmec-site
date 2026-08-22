import { NextResponse } from "next/server";
import { apiFetch, ApiError } from "@/lib/api/client";
import {
  setAuthCookies,
  clearAuthCookies,
  getRefreshToken,
  type AuthTokens,
} from "@/lib/api/auth-cookies";

export async function GET() {
  const refreshToken = await getRefreshToken();

  if (!refreshToken) {
    return NextResponse.json({ message: "Session expiree" }, { status: 401 });
  }

  try {
    const tokens = await apiFetch<AuthTokens>("/auth/refresh-token", {
      method: "GET",
      headers: { Authorization: `Bearer ${refreshToken}` },
      auth: false,
    });

    await setAuthCookies(tokens);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ApiError) {
      await clearAuthCookies();
      return NextResponse.json(error.body, { status: error.status });
    }
    throw error;
  }
}
