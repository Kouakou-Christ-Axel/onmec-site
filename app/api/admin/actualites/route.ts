import { NextResponse } from "next/server";
import { createActualiteAdmin } from "@/features/actualites-admin/requests/create-actualite";
import { toErrorResponse } from "@/lib/to-error-response";

export async function POST(request: Request) {
  const formData = await request.formData();
  try {
    const actualite = await createActualiteAdmin(formData);
    return NextResponse.json(actualite, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
