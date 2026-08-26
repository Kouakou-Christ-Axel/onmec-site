import { NextResponse } from "next/server";
import { publierActualiteAdmin } from "@/features/actualites-admin/requests/publier-actualite";
import { toErrorResponse } from "@/lib/to-error-response";

export async function PATCH(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const actualite = await publierActualiteAdmin(id);
    return NextResponse.json(actualite);
  } catch (error) {
    return toErrorResponse(error);
  }
}
