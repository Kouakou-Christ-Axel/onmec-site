import { apiFetch } from "@/lib/api-client";

export function listMembreSignalements(id: string, page = 1, limit = 10) {
  return apiFetch(`/signalement-citoyen?citoyenId=${id}&page=${page}&limit=${limit}`);
}
