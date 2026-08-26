import { NextResponse } from "next/server";
import { depublierActualiteAdmin } from "@/features/actualites-admin/requests/depublier-actualite";
import { toErrorResponse } from "@/lib/to-error-response";

export async function PATCH(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const actualite = await depublierActualiteAdmin(id);
    return NextResponse.json(actualite);
  } catch (error) {
    return toErrorResponse(error);
  }
}
