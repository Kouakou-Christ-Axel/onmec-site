import { NextResponse } from "next/server";
import { apiFetch, ApiError } from "@/lib/api/client";
import { setAuthCookies, type AuthTokens } from "@/lib/api/auth-cookies";

interface LoginPayload {
  email: string;
  password: string;
}

interface AuthResponse extends AuthTokens {
  id: string;
  email: string;
  fullname: string;
  phone?: string | null;
  role: string;
  permissions: string[];
}

export async function POST(request: Request) {
  const payload = (await request.json()) as LoginPayload;

  try {
    const auth = await apiFetch<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
      auth: false,
    });

    await setAuthCookies(auth);

    const { token: _token, refreshToken: _refreshToken, ...user } = auth;
    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(error.body, { status: error.status });
    }
    throw error;
  }
}
