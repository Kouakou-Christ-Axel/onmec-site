import { apiFetch } from "@/lib/api-client";
import type { MembreAdmin, MembreListResponse } from "@/features/membres-admin/types/membre-admin";

interface UserResponseDto {
  id: string;
  fullname: string;
  email: string;
  phone: string | null;
  statut: MembreAdmin["etat"];
  emailVerified: boolean;
  createdAt: string;
}

interface BackendListResponse {
  data: UserResponseDto[];
  meta: MembreListResponse["meta"];
}

function toMembreAdmin(dto: UserResponseDto): MembreAdmin {
  return {
    id: dto.id,
    nom: dto.fullname,
    email: dto.email,
    telephone: dto.phone,
    dateInscription: dto.createdAt,
    etat: dto.statut,
    emailVerifie: dto.emailVerified,
  };
}

export interface ListMembresParams {
  search?: string;
  statut?: MembreAdmin["etat"];
  page?: number;
  limit?: number;
}

export async function listMembres(params: ListMembresParams = {}): Promise<MembreListResponse> {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.statut) query.set("statut", params.statut);
  query.set("page", String(params.page ?? 1));
  query.set("limit", String(params.limit ?? 20));
  const response = await apiFetch<BackendListResponse>(`/users?${query}`);
  return { data: response.data.map(toMembreAdmin), meta: response.meta };
}
