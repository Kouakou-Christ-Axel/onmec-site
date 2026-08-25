import { NextResponse } from "next/server";
import { parseJsonBody } from "@/lib/parse-json-body";
import { registerSchema } from "@/features/auth/schemas/register-schema";
import { registerRequest } from "@/features/auth/requests/register";
import { toErrorResponse } from "@/lib/to-error-response";

export async function POST(request: Request) {
  const parsed = await parseJsonBody(request, registerSchema);
  if (!parsed.success) return parsed.response;

  try {
    const result = await registerRequest(parsed.data);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
