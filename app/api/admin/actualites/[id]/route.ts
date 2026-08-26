import { NextResponse } from "next/server";
import { updateActualiteAdmin } from "@/features/actualites-admin/requests/update-actualite";
import { deleteActualiteAdmin } from "@/features/actualites-admin/requests/delete-actualite";
import { toErrorResponse } from "@/lib/to-error-response";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const formData = await request.formData();
  try {
    const actualite = await updateActualiteAdmin(id, formData);
    return NextResponse.json(actualite);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const actualite = await deleteActualiteAdmin(id);
    return NextResponse.json(actualite);
  } catch (error) {
    return toErrorResponse(error);
  }
}
