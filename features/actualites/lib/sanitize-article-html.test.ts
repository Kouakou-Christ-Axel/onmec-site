import { describe, expect, it } from "vitest";
import { sanitizeArticleHtml } from "@/features/actualites/lib/sanitize-article-html";

describe("sanitizeArticleHtml", () => {
  it("conserve ce que produit l'éditeur du back-office", () => {
    const html =
      '<p>Bonjour, je suis <strong>Axel</strong></p><img src="http://localhost:8081/uploads/a.webp">';
    const result = sanitizeArticleHtml(html);
    expect(result).toContain("<strong>Axel</strong>");
    expect(result).toContain('src="http://localhost:8081/uploads/a.webp"');
  });

  it("retire les balises hors liste blanche", () => {
    expect(sanitizeArticleHtml('<p>ok</p><script>alert(1)</script>')).not.toContain("alert(1)");
    expect(sanitizeArticleHtml('<iframe src="https://evil.test"></iframe>')).not.toContain("iframe");
  });

  it("retire les gestionnaires d'évènements", () => {
    expect(sanitizeArticleHtml('<p onclick="alert(1)">x</p>')).not.toContain("onclick");
  });

  it("bloque les URL à schéma dangereux, que la liste blanche laisserait passer", () => {
    expect(sanitizeArticleHtml('<a href="javascript:alert(1)">x</a>')).not.toContain("javascript:");
    expect(sanitizeArticleHtml('<img src="data:text/html;base64,PHN2Zz4=">')).not.toContain("data:");
  });

  it("laisse passer les liens http(s) et internes", () => {
    expect(sanitizeArticleHtml('<a href="https://mec-ci.org">x</a>')).toContain("https://mec-ci.org");
    expect(sanitizeArticleHtml('<a href="/actualites">x</a>')).toContain('href="/actualites"');
  });
});

describe("filtrage des attributs", () => {
  it("retire tout attribut hors liste, y compris ceux ajoutés par un thème", () => {
    const result = sanitizeArticleHtml('<p class="x" style="color:red" data-x="1">t</p>');
    expect(result).not.toContain("class");
    expect(result).not.toContain("style");
    expect(result).not.toContain("data-x");
    expect(result).toContain("t");
  });

  it("conserve les attributs légitimes des liens et des images", () => {
    const result = sanitizeArticleHtml('<a href="https://mec-ci.org" title="MEC">x</a>');
    expect(result).toContain('href="https://mec-ci.org"');
    expect(result).toContain('title="MEC"');
  });
});
