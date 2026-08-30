import { NextResponse } from "next/server";
import { ajusterPointsMembre } from "@/features/membres-admin/requests/ajuster-points-membre";
import { ajusterPointsSchema } from "@/features/membres-admin/schemas/ajuster-points-schema";
import { toErrorResponse } from "@/lib/to-error-response";
import { parseJsonBody } from "@/lib/parse-json-body";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = await parseJsonBody(request, ajusterPointsSchema);
  if (!parsed.success) return parsed.response;

  try {
    const result = await ajusterPointsMembre(id, parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
