import { apiFetch } from "@/lib/api-client";
import type { MembreAdmin } from "@/features/membres-admin/types/membre-admin";

interface UserResponseDto {
  id: string;
  fullname: string;
  email: string;
  phone: string | null;
  statut: MembreAdmin["etat"];
  emailVerified: boolean;
  createdAt: string;
}

export async function getMembre(id: string): Promise<MembreAdmin> {
  const dto = await apiFetch<UserResponseDto>(`/users/${id}/profile`);
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
