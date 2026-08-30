import { NextResponse } from "next/server";
import { resetPasswordAdminUser } from "@/features/admin-users/requests/reset-password-admin-user";
import { toErrorResponse } from "@/lib/to-error-response";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const result = await resetPasswordAdminUser(id);
    return NextResponse.json(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
