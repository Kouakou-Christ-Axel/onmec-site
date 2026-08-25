import { NextResponse } from "next/server";
import { parseJsonBody } from "@/lib/parse-json-body";
import { adminLoginSchema } from "@/features/admin-auth/schemas/admin-login-schema";
import { adminLoginRequest } from "@/features/admin-auth/requests/admin-login";
import { setAuthCookies } from "@/lib/auth-cookies";
import { toErrorResponse } from "@/lib/to-error-response";

export async function POST(request: Request) {
  const parsed = await parseJsonBody(request, adminLoginSchema);
  if (!parsed.success) return parsed.response;

  try {
    const auth = await adminLoginRequest(parsed.data);
    await setAuthCookies(auth);

    const { token: _token, refreshToken: _refreshToken, ...user } = auth;
    return NextResponse.json(user);
  } catch (error) {
    return toErrorResponse(error);
  }
}
