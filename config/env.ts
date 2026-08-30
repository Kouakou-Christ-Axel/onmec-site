export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

export function getApiBaseUrl(): string {
  const url = process.env.API_BASE_URL;
  if (url) return url;
  if (isProduction()) {
    throw new Error("API_BASE_URL manquante en production");
  }
  return "http://localhost:8081/api/v1";
}

/**
 * URL publique canonique du site, sans slash final. Base des URLs absolues qu'exige le SEO :
 * `metadataBase` (canonical, Open Graph) et `sitemap.ts`.
 *
 * Désigne le domaine final `mec-ci.org`, alors même que le site tourne encore sur
 * `*.workers.dev` : la bascule est imminente, donc les URLs absolues sont déjà correctes pour le
 * jour J. Ce décalage est sans risque parce que [app/robots.ts](../app/robots.ts) interdit tout le
 * crawl tant que l'hôte de la requête n'est pas l'hôte canonique — les canonicals pointant vers
 * mec-ci.org ne sont donc jamais lus depuis le domaine provisoire.
 *
 * Effet de bord assumé le temps de la bascule : un lien workers.dev partagé sur les réseaux
 * remontera l'aperçu Open Graph de mec-ci.org, qui sert encore l'ancien site.
 *
 * Contrairement à `getApiBaseUrl`, l'absence de la variable ne lève pas en production : un oubli de
 * configuration dégraderait le SEO, il ne doit pas casser le rendu du site.
 */
export function getSiteUrl(): string {
  return (process.env.SITE_URL ?? "https://mec-ci.org").replace(/\/+$/, "");
}
