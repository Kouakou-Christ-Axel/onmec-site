import { NextResponse } from "next/server";
import { updateSignalement } from "@/features/signalements-admin/requests/update-signalement";
import { updateSignalementSchema } from "@/features/signalements-admin/schemas/update-signalement-schema";
import { toErrorResponse } from "@/lib/to-error-response";
import { parseJsonBody } from "@/lib/parse-json-body";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = await parseJsonBody(request, updateSignalementSchema);
  if (!parsed.success) return parsed.response;

  try {
    const signalement = await updateSignalement(id, parsed.data);
    return NextResponse.json(signalement);
  } catch (error) {
    return toErrorResponse(error);
  }
}
