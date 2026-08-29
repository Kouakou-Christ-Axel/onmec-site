import { NextResponse } from "next/server";
import { listSignalements } from "@/features/signalements-admin/requests/list-signalements";
import { toErrorResponse } from "@/lib/to-error-response";
import type { SignalementStatutApi } from "@/features/signalements-admin/types/signalement-admin";

const VALID_STATUTS: SignalementStatutApi[] = ["NOUVEAU", "EN_COURS", "RESOLU", "REJETE"];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const statutParam = searchParams.get("statut");
  const statut = VALID_STATUTS.includes(statutParam as SignalementStatutApi)
    ? (statutParam as SignalementStatutApi)
    : undefined;
  try {
    const result = await listSignalements({
      statut,
      categorieId: searchParams.get("categorieId") ?? undefined,
      page: Number(searchParams.get("page") ?? 1),
      limit: Number(searchParams.get("limit") ?? 20),
    });
    return NextResponse.json(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
