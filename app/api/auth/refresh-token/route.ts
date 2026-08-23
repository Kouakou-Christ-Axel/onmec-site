import { NextResponse } from "next/server";
import { refreshTokenRequest } from "@/features/auth/requests/refresh-token";
import {
  setAuthCookies,
  clearAuthCookies,
  getRefreshToken,
} from "@/features/auth/lib/auth-cookies";
import { toErrorResponse } from "@/features/auth/lib/to-error-response";

export async function GET() {
  const refreshToken = await getRefreshToken();

  if (!refreshToken) {
    return NextResponse.json({ message: "Session expiree" }, { status: 401 });
  }

  try {
    const tokens = await refreshTokenRequest(refreshToken);
    await setAuthCookies(tokens);
    return NextResponse.json({ ok: true });
  } catch (error) {
    await clearAuthCookies();
    return toErrorResponse(error);
  }
}
