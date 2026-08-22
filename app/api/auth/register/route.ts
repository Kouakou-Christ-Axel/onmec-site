import { NextResponse } from "next/server";
import { apiFetch, ApiError } from "@/lib/api/client";

interface RegisterPayload {
  email: string;
  password: string;
  fullname: string;
  phone?: string;
}

interface OtpSentResponse {
  message: string;
  email: string;
}

export async function POST(request: Request) {
  const payload = (await request.json()) as RegisterPayload;

  try {
    const result = await apiFetch<OtpSentResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
      auth: false,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(error.body, { status: error.status });
    }
    throw error;
  }
}
