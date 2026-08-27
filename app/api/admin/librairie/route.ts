import { NextResponse } from "next/server";
import { createLibrairieAdmin } from "@/features/librairie-admin/requests/create-librairie-admin";
import { toErrorResponse } from "@/lib/to-error-response";

export async function POST(request: Request) {
  const body = await request.json();
  try {
    const document = await createLibrairieAdmin(body);
    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
