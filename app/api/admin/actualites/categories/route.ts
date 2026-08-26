import { NextResponse } from "next/server";
import { listCategoriesAdmin } from "@/features/actualites-admin/requests/list-categories";
import { toErrorResponse } from "@/lib/to-error-response";

export async function GET() {
  try {
    const categories = await listCategoriesAdmin();
    return NextResponse.json(categories);
  } catch (error) {
    return toErrorResponse(error);
  }
}
