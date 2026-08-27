import { NextResponse } from "next/server";
import { requestUploadUrl } from "@/features/librairie-admin/requests/request-upload-url";
import { toErrorResponse } from "@/lib/to-error-response";

export async function POST(request: Request) {
  const body = await request.json();
  try {
    const result = await requestUploadUrl(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
