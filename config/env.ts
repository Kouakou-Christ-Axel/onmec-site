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
 * Doit désigner le domaine où **ce** site est réellement servi, pas celui qu'on vise à terme.
 * Aujourd'hui c'est `onmec-site.kouakoucaxel.workers.dev` : `mec-ci.org` sert encore l'ancien site
 * (SPA Vite hébergée ailleurs). Y pointer les canonicals maintenant les ferait référencer un
 * contenu étranger — un canonical vers une page sans rapport est pire que pas de canonical.
 *
 * Au moment de la bascule sur `mec-ci.org` : basculer `SITE_URL` dans `wrangler.jsonc`, et ajouter
 * les redirections 301 (voir docs/seo-audit-2026-08-30.md §5).
 *
 * Contrairement à `getApiBaseUrl`, l'absence de la variable ne lève pas en production : un oubli de
 * configuration dégraderait le SEO, il ne doit pas casser le rendu du site.
 */
export function getSiteUrl(): string {
  return (process.env.SITE_URL ?? "https://onmec-site.kouakoucaxel.workers.dev").replace(/\/+$/, "");
}
