import { ELEMENT_NODE, transformSync, walkSync, type Node } from "ultrahtml";
import sanitize from "ultrahtml/transformers/sanitize";

/**
 * Balises produites par l'éditeur du back-office (Tiptap StarterKit + extension Image).
 * Tout le reste est retiré.
 */
const ALLOWED_ELEMENTS = [
  "p",
  "br",
  "strong",
  "em",
  "s",
  "u",
  "code",
  "pre",
  "blockquote",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "hr",
  "a",
  "img",
  "span",
  "figure",
  "figcaption",
];

/** Attributs conservés, par balise. Tout le reste est retiré, gestionnaires d'évènement compris. */
const ATTRIBUTS_AUTORISES: Record<string, string[]> = {
  a: ["href", "target", "rel", "title"],
  img: ["src", "alt", "title"],
};

/** http(s) ou chemin interne. Bloque notamment `javascript:` et `data:`. */
const SCHEME_SUR = /^(https?:\/\/|\/)/i;

/**
 * Un `h1` posé par un rédacteur dans le corps d'un article créerait un second `h1` sur la page (le
 * premier est celui de l'en-tête d'article, hors de ce HTML). `h1` est donc absent de
 * `ALLOWED_ELEMENTS` — mais le retirer de la liste blanche seule le ferait *supprimer avec son
 * contenu* : le sanitizer d'ultrahtml, pour une balise hors liste, retire le nœud et tout son sous-
 * arbre (voir `sanitize.js` de la lib, action "drop"), donc le texte du titre disparaîtrait avec lui.
 *
 * On dégrade plutôt `h1` en `h2` avant le passage de `sanitize()` : le texte du rédacteur reste
 * visible et reste un titre (un `h2` dans le corps d'un article publié sous un `h1` d'en-tête est une
 * hiérarchie valide), plutôt que de le déballer en texte brut sans balise.
 */
function degraderH1(doc: Node): Node {
  walkSync(doc, (node) => {
    if (node.type === ELEMENT_NODE && String(node.name).toLowerCase() === "h1") {
      node.name = "h2";
    }
  });
  return doc;
}

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
    degraderH1,
    sanitize({
      allowElements: ALLOWED_ELEMENTS,
      allowComponents: false,
      allowCustomElements: false,
      allowComments: false,
    }),
    filtrerAttributs,
  ]);
}
