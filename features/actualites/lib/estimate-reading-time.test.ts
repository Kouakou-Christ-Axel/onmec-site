import { describe, expect, it } from "vitest";
import { estimateReadingTime } from "@/features/actualites/lib/estimate-reading-time";
import { formatArticleDate } from "@/features/actualites/lib/format-article-date";

describe("estimateReadingTime", () => {
  it("ne compte pas les balises comme des mots", () => {
    const html = `<p>${"mot ".repeat(200)}</p>`;
    expect(estimateReadingTime(html)).toBe("1 min");
  });

  it("arrondit au supérieur et ne descend jamais sous une minute", () => {
    expect(estimateReadingTime("<p>Bonjour</p>")).toBe("1 min");
    expect(estimateReadingTime("")).toBe("1 min");
    expect(estimateReadingTime(`<p>${"mot ".repeat(1100)}</p>`)).toBe("6 min");
  });
});

describe("formatArticleDate", () => {
  it("convertit l'ISO de l'API en format court français", () => {
    expect(formatArticleDate("2026-08-26T00:00:00.000Z")).toBe("26/08/2026");
    expect(formatArticleDate("2026-04-21T08:00:00.000Z")).toBe("21/04/2026");
  });

  it("renvoie une chaîne vide sur une date invalide plutôt que « Invalid Date »", () => {
    expect(formatArticleDate("pas-une-date")).toBe("");
  });
});
