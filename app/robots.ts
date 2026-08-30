import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/config/env";

/**
 * Convention de fichier `app/robots.ts` : vérifiée comme supportée par vinext (les types Next
 * upstream sont vendored via `@vinext/types/next`, et `metadata-routes.ts` mappe `robots.ts` sur
 * `/robots.txt` en `text/plain`). Voir docs/seo-audit-2026-08-30.md §2.2.
 */
export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

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
