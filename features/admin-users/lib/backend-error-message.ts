import { ApiError } from "@/lib/api-error";

/**
 * Extrait le message brut renvoyé par `onmec_backend` sur un 4xx (ex. "Vous ne pouvez pas
 * modifier votre propre rôle.") plutôt que d'afficher un message générique — ces erreurs sont
 * déjà rédigées pour être lues telles quelles par un administrateur.
 */
export function backendMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError && error.body && typeof error.body === "object") {
    const message = (error.body as { message?: unknown }).message;
    if (typeof message === "string") return message;
    if (Array.isArray(message)) return message.join(" ");
  }
  return fallback;
}
