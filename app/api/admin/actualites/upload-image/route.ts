import { NextResponse } from "next/server";
import { uploadActualiteImage } from "@/features/actualites-admin/requests/upload-actualite-image";
import { toErrorResponse } from "@/lib/to-error-response";

export async function POST(request: Request) {
  const formData = await request.formData();
  try {
    const result = await uploadActualiteImage(formData);
    return NextResponse.json(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
