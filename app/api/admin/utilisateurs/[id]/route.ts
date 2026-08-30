import { NextResponse } from "next/server";
import { updateAdminUser } from "@/features/admin-users/requests/update-admin-user";
import { modifierRoleAdminUserSchema } from "@/features/admin-users/schemas/modifier-role-admin-user-schema";
import { toErrorResponse } from "@/lib/to-error-response";
import { parseJsonBody } from "@/lib/parse-json-body";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = await parseJsonBody(request, modifierRoleAdminUserSchema);
  if (!parsed.success) return parsed.response;

  try {
    const result = await updateAdminUser(id, parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
