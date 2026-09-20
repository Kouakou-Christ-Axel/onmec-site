import { NextResponse } from "next/server";
import { requestActualiteCoverUploadUrl } from "@/features/actualites-admin/requests/request-upload-url";
import { toErrorResponse } from "@/lib/to-error-response";

export async function POST(request: Request) {
  const body = await request.json();
  try {
    const result = await requestActualiteCoverUploadUrl(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
