import { NextResponse } from "next/server";
import { changerStatutAdminUser } from "@/features/admin-users/requests/changer-statut-admin-user";
import { changerStatutAdminUserSchema } from "@/features/admin-users/schemas/changer-statut-admin-user-schema";
import { toErrorResponse } from "@/lib/to-error-response";
import { parseJsonBody } from "@/lib/parse-json-body";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = await parseJsonBody(request, changerStatutAdminUserSchema);
  if (!parsed.success) return parsed.response;

  try {
    const result = await changerStatutAdminUser(id, parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
