import type { NextConfig } from "next";

/**
 * Les images d'actualité sont servies depuis deux hôtes distincts : le CDN d'upload fixe
 * `cdn.otw.ci` (constaté en prod — non documenté côté API, donc code en dur) et l'API elle-même,
 * dont le domaine change entre local (`localhost:8081`) et production (`admin.mec-ci.org`), dérivé
 * d'`API_BASE_URL` pour n'avoir qu'une seule source de vérité pour celui-là.
 *
 * vinext valide `remotePatterns` comme Next : un hôte non listé fait échouer l'optimisation
 * silencieusement (erreur uniquement dans la console navigateur, pas de crash visible).
 */
function remotePatternsDeLApi(): NonNullable<NextConfig["images"]>["remotePatterns"] {
  const hotes = new Set<string>(["https://cdn.otw.ci"]);
  if (process.env.API_BASE_URL) {
    try {
      hotes.add(new URL(process.env.API_BASE_URL).origin);
    } catch {
      // API_BASE_URL malformée : config/env.ts échouera bruyamment au runtime, pas ici.
    }
  }
  return [...hotes].map((hote) => {
    const url = new URL(hote);
    return {
      protocol: url.protocol.replace(":", "") as "http" | "https",
      hostname: url.hostname,
      ...(url.port ? { port: url.port } : {}),
      // Scope par hote, pas par chemin : l'API sert les images sous au moins deux prefixes
      // (/uploads/actualites et /images/actualites). Restreindre le pathname avait fait rejeter
      // silencieusement la moitie des images — vu dans le log du worker, pas a la lecture.
      pathname: "/**",
    };
  });
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: remotePatternsDeLApi(),
  },
};

export default nextConfig;
