import { NextResponse } from "next/server";
import { listAdminUsers } from "@/features/admin-users/requests/list-admin-users";
import { createAdminUser } from "@/features/admin-users/requests/create-admin-user";
import { creerAdminUserSchema } from "@/features/admin-users/schemas/creer-admin-user-schema";
import { toErrorResponse } from "@/lib/to-error-response";
import { parseJsonBody } from "@/lib/parse-json-body";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  try {
    const result = await listAdminUsers({
      search: searchParams.get("search") ?? undefined,
      role: (searchParams.get("role") as never) ?? undefined,
      page: Number(searchParams.get("page") ?? 1),
      limit: Number(searchParams.get("limit") ?? 10),
    });
    return NextResponse.json(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request) {
  const parsed = await parseJsonBody(request, creerAdminUserSchema);
  if (!parsed.success) return parsed.response;
  try {
    const result = await createAdminUser(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
