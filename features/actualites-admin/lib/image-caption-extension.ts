import { mergeAttributes } from "@tiptap/core";
import BaseImage from "@tiptap/extension-image";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { ImageCaptionView } from "@/features/actualites-admin/lib/image-caption-node-view";

/**
 * Étend l'extension Image de base pour rendre `<figure><img/><figcaption/></figure>` : la légende
 * n'a pas d'équivalent en attribut `<img>`, donc `caption` est portée par le nœud lui-même et lue
 * depuis le `<figcaption>` voisin au parsing (les `<img>` déjà en base sans `<figure>` restent
 * compatibles, `caption` vaut alors `null`).
 */
export const ImageCaption = BaseImage.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      caption: {
        default: null,
        parseHTML: (element) =>
          element.closest("figure")?.querySelector("figcaption")?.textContent || null,
        renderHTML: () => ({}),
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageCaptionView);
  },

  renderHTML({ node, HTMLAttributes }) {
    const img = ["img", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)] as const;
    if (!node.attrs.caption) {
      return ["figure", {}, img];
    }
    return ["figure", {}, img, ["figcaption", {}, node.attrs.caption]];
  },
});
