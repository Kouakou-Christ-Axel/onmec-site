import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { getSiteUrl } from "@/config/env";

/**
 * Convention de fichier `app/robots.ts` : vérifiée comme supportée par vinext (les types Next
 * upstream sont vendored via `@vinext/types/next`, et `metadata-routes.ts` mappe `robots.ts` sur
 * `/robots.txt` en `text/plain`). Voir docs/seo-audit-2026-08-30.md §2.2.
 *
 * Le crawl n'est ouvert que sur l'hôte canonique (`SITE_URL`). Servi depuis un autre hôte — le
 * `*.workers.dev` provisoire tant que la bascule sur mec-ci.org n'a pas eu lieu — le site répond
 * `Disallow: /`.
 *
 * Ce test se fait sur l'hôte de la requête plutôt que sur un drapeau à basculer à la main, et c'est
 * délibéré : un `Disallow: /` codé en dur qu'on oublie de retirer le jour de la bascule ferait
 * partir le nouveau site intégralement bloqué pour les moteurs, en silence et sans rien casser de
 * visible. Ici, le déblocage suit automatiquement le domaine : le jour où `mec-ci.org` pointe sur ce
 * Worker, `requestHost` rejoint `canonicalHost` et le robots.txt complet est servi.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const siteUrl = getSiteUrl();
  const canonicalHost = new URL(siteUrl).host;
  const requestHost = (await headers()).get("host");

  if (requestHost && requestHost !== canonicalHost) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/maintenance"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
