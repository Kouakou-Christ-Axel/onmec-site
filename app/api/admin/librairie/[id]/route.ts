import { NextResponse } from "next/server";
import { updateLibrairieAdmin } from "@/features/librairie-admin/requests/update-librairie-admin";
import { deleteLibrairieAdmin } from "@/features/librairie-admin/requests/delete-librairie-admin";
import { toErrorResponse } from "@/lib/to-error-response";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  try {
    const document = await updateLibrairieAdmin(id, body);
    return NextResponse.json(document);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const result = await deleteLibrairieAdmin(id);
    return NextResponse.json(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
