import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Fusionne des classes Tailwind en laissant la dernière gagner sur un même utilitaire.
 * Sans ce merge, un appelant passant `px-8` à un composant qui pose déjà `px-5` obtient les
 * deux classes, et c'est l'ordre du CSS qui tranche — pas l'intention de l'appelant.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
