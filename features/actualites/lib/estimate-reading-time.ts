const MOTS_PAR_MINUTE = 200;

/**
 * L'API ne fournit pas de durée de lecture : on l'estime depuis le contenu.
 * Les balises sont retirées avant comptage, sinon le HTML gonfle le résultat.
 */
export function estimateReadingTime(html: string): string {
  const texte = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&[a-z]+;|&#\d+;/gi, " ")
    .trim();
  const mots = texte ? texte.split(/\s+/).length : 0;
  return `${Math.max(1, Math.ceil(mots / MOTS_PAR_MINUTE))} min`;
}
