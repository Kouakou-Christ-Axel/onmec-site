import { NextResponse } from "next/server";
import { parseJsonBody } from "@/lib/parse-json-body";
import { verifyEmailSchema } from "@/features/auth/schemas/verify-email-schema";
import { verifyEmailRequest } from "@/features/auth/requests/verify-email";
import { setAuthCookies } from "@/features/auth/lib/auth-cookies";
import { toErrorResponse } from "@/features/auth/lib/to-error-response";

export async function POST(request: Request) {
  const parsed = await parseJsonBody(request, verifyEmailSchema);
  if (!parsed.success) return parsed.response;

  try {
    const auth = await verifyEmailRequest(parsed.data);
    await setAuthCookies(auth);

    const { token: _token, refreshToken: _refreshToken, ...user } = auth;
    return NextResponse.json(user);
  } catch (error) {
    return toErrorResponse(error);
  }
}
