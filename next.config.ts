import type { NextConfig } from "next";

/**
 * Les images d'actualité sont servies par l'API, dont le domaine change entre local
 * (`localhost:8081`) et production (`api.mec-ci.org`). On le dérive donc d'`API_BASE_URL` au lieu
 * de l'écrire en dur : une seule source de vérité, déjà exigée au déploiement.
 *
 * vinext valide `remotePatterns` comme Next : un hôte non listé fait échouer l'optimisation.
 */
function remotePatternsDeLApi(): NonNullable<NextConfig["images"]>["remotePatterns"] {
  const patterns = new Set<string>(["https://api.mec-ci.org"]);
  if (process.env.API_BASE_URL) {
    try {
      patterns.add(new URL(process.env.API_BASE_URL).origin);
    } catch {
      // API_BASE_URL malformée : config/env.ts échouera bruyamment au runtime, pas ici.
    }
  }
  return [...patterns].map((origine) => {
    const url = new URL(origine);
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
