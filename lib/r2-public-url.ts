/**
 * Hôte du CDN R2 qui sert les fichiers uploadés (actualités, bibliothèque, ...) — un seul bucket
 * pour toute la plateforme. Constaté en prod, non documenté côté API (voir next.config.ts, qui
 * l'utilise aussi pour `images.remotePatterns`).
 */
export const R2_PUBLIC_HOST = "https://cdn.otw.ci";

export function buildR2PublicUrl(key: string): string {
  return `${R2_PUBLIC_HOST}/${key.replace(/^\/+/, "")}`;
}
