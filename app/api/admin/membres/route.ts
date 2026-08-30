import { NextResponse } from "next/server";
import { listMembres } from "@/features/membres-admin/requests/list-membres";
import { toErrorResponse } from "@/lib/to-error-response";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  try {
    const result = await listMembres({
      search: searchParams.get("search") ?? undefined,
      statut: (searchParams.get("statut") as never) ?? undefined,
      page: Number(searchParams.get("page") ?? 1),
      limit: Number(searchParams.get("limit") ?? 20),
    });
    return NextResponse.json(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
