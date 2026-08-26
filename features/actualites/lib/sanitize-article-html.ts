import { ELEMENT_NODE, transformSync, walkSync, type Node } from "ultrahtml";
import sanitize from "ultrahtml/transformers/sanitize";

/**
 * Balises produites par l'éditeur du back-office (Tiptap StarterKit + extension Image).
 * Tout le reste est retiré.
 */
const ALLOWED_ELEMENTS = [
  "p", "br", "strong", "em", "s", "u", "code", "pre",
  "blockquote", "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li", "hr", "a", "img", "span", "figure", "figcaption",
];

/** Attributs conservés, par balise. Tout le reste est retiré, gestionnaires d'évènement compris. */
const ATTRIBUTS_AUTORISES: Record<string, string[]> = {
  a: ["href", "target", "rel", "title"],
  img: ["src", "alt", "title"],
};

/** http(s) ou chemin interne. Bloque notamment `javascript:` et `data:`. */
const SCHEME_SUR = /^(https?:\/\/|\/)/i;

/**
 * Applique la liste blanche d'attributs nous-mêmes.
 *
 * `allowAttributes` d'ultrahtml n'est pas exclusive : vérifié par test, `<p onclick="…">` y
 * survit. Et même pour les attributs légitimes, elle ne regarde pas la **valeur** — un
 * `href="javascript:…"` passerait. Les deux trous sont bouchés ici.
 */
function filtrerAttributs(doc: Node): Node {
  walkSync(doc, (node) => {
    if (node.type !== ELEMENT_NODE || !node.attributes) return;
    const autorises = ATTRIBUTS_AUTORISES[String(node.name).toLowerCase()] ?? [];
    for (const attribut of Object.keys(node.attributes)) {
      if (!autorises.includes(attribut.toLowerCase())) {
        delete node.attributes[attribut];
        continue;
      }
      if (attribut === "href" || attribut === "src") {
        const valeur = String(node.attributes[attribut] ?? "").trim();
        if (!SCHEME_SUR.test(valeur)) delete node.attributes[attribut];
      }
    }
  });
  return doc;
}

/**
 * Assainit le HTML d'une actualité avant rendu.
 *
 * `content` est du HTML stocké en base et rendu sur le site public : sans ce passage, un compte
 * éditorial compromis injecte du script chez tous les visiteurs.
 */
export function sanitizeArticleHtml(html: string): string {
  return transformSync(html, [
    sanitize({
      allowElements: ALLOWED_ELEMENTS,
      allowComponents: false,
      allowCustomElements: false,
      allowComments: false,
    }),
    filtrerAttributs,
  ]);
}
