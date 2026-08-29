import { NextResponse } from "next/server";
import { listSignalementUpdates } from "@/features/signalements-admin/requests/list-signalement-updates";
import { createSignalementUpdate } from "@/features/signalements-admin/requests/create-signalement-update";
import { createSignalementUpdateSchema } from "@/features/signalements-admin/schemas/create-signalement-update-schema";
import { toErrorResponse } from "@/lib/to-error-response";
import { parseJsonBody } from "@/lib/parse-json-body";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const updates = await listSignalementUpdates(id);
    return NextResponse.json(updates);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = await parseJsonBody(request, createSignalementUpdateSchema);
  if (!parsed.success) return parsed.response;

  try {
    const update = await createSignalementUpdate(id, parsed.data.texte);
    return NextResponse.json(update, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
