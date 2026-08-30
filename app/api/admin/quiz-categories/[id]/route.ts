import { NextResponse } from "next/server";
import { updateCategorie } from "@/features/quiz-admin/requests/update-categorie";
import { deleteCategorie } from "@/features/quiz-admin/requests/delete-categorie";
import { categorieFormSchema } from "@/features/quiz-admin/schemas/categorie-form-schema";
import { toErrorResponse } from "@/lib/to-error-response";
import { parseJsonBody } from "@/lib/parse-json-body";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = await parseJsonBody(request, categorieFormSchema.partial());
  if (!parsed.success) return parsed.response;

  try {
    const categorie = await updateCategorie(id, parsed.data);
    return NextResponse.json(categorie);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const reassignTo = new URL(request.url).searchParams.get("reassignTo") ?? undefined;
  try {
    const result = await deleteCategorie(id, reassignTo);
    return NextResponse.json(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
