import { NextResponse } from "next/server";
import { getMembre } from "@/features/membres-admin/requests/get-membre";
import { toErrorResponse } from "@/lib/to-error-response";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const membre = await getMembre(id);
    return NextResponse.json(membre);
  } catch (error) {
    return toErrorResponse(error);
  }
}
