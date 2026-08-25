import { NextResponse } from "next/server";
import { parseJsonBody } from "@/lib/parse-json-body";
import { adminChangePasswordSchema } from "@/features/admin-auth/schemas/admin-change-password-schema";
import { adminChangePasswordRequest } from "@/features/admin-auth/requests/admin-change-password";
import { toErrorResponse } from "@/lib/to-error-response";

export async function POST(request: Request) {
  const parsed = await parseJsonBody(request, adminChangePasswordSchema);
  if (!parsed.success) return parsed.response;

  try {
    const result = await adminChangePasswordRequest(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
