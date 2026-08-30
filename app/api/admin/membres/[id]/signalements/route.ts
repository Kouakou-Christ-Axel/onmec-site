import { NextResponse } from "next/server";
import { listMembreSignalements } from "@/features/membres-admin/requests/list-membre-signalements";
import { toErrorResponse } from "@/lib/to-error-response";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  try {
    const result = await listMembreSignalements(
      id,
      Number(searchParams.get("page") ?? 1),
      Number(searchParams.get("limit") ?? 10),
    );
    return NextResponse.json(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
