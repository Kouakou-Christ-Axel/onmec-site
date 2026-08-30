import { NextResponse } from "next/server";
import { listCategories } from "@/features/quiz-admin/requests/list-categories";
import { createCategorie } from "@/features/quiz-admin/requests/create-categorie";
import { categorieFormSchema } from "@/features/quiz-admin/schemas/categorie-form-schema";
import { toErrorResponse } from "@/lib/to-error-response";
import { parseJsonBody } from "@/lib/parse-json-body";

export async function GET() {
  try {
    const categories = await listCategories();
    return NextResponse.json(categories);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request) {
  const parsed = await parseJsonBody(request, categorieFormSchema);
  if (!parsed.success) return parsed.response;

  try {
    const categorie = await createCategorie(parsed.data);
    return NextResponse.json(categorie, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
