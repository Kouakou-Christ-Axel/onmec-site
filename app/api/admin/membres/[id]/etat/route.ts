import { NextResponse } from "next/server";
import { changerEtatMembre } from "@/features/membres-admin/requests/changer-etat-membre";
import { changerEtatSchema } from "@/features/membres-admin/schemas/changer-etat-schema";
import { toErrorResponse } from "@/lib/to-error-response";
import { parseJsonBody } from "@/lib/parse-json-body";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = await parseJsonBody(request, changerEtatSchema);
  if (!parsed.success) return parsed.response;

  try {
    const result = await changerEtatMembre(id, parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
