import { afterEach, describe, expect, it, vi } from "vitest";
import { createDocumentWithUpload } from "@/features/librairie-admin/lib/create-document-with-upload";

afterEach(() => {
  vi.unstubAllGlobals();
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("createDocumentWithUpload", () => {
  it("upload le fichier puis finalise, sans couverture", async () => {
    const calls: string[] = [];
    const file = new File(["pdf"], "guide.pdf", { type: "application/pdf" });

    const fetchMock = vi.fn(async (url: string | URL, init?: RequestInit) => {
      const href = String(url);
      calls.push(href);
      if (href === "/api/admin/librairie/upload-url") {
        return jsonResponse({
          key: "librairie/doc-1/fichier.pdf",
          uploadUrl: "https://r2.example/fichier",
          expiresIn: 300,
          documentId: "doc-1",
        });
      }
      if (href === "https://r2.example/fichier") {
        expect(init?.method).toBe("PUT");
        return new Response(null, { status: 200 });
      }
      if (href === "/api/admin/librairie") {
        const body = JSON.parse(String(init?.body));
        expect(body).toEqual({
          title: "Guide",
          description: undefined,
          categorie: undefined,
          fichierKey: "librairie/doc-1/fichier.pdf",
          coverKey: undefined,
        });
        return jsonResponse({ id: "doc-1", title: "Guide" });
      }
      throw new Error(`URL inattendue: ${href}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    const steps: string[] = [];
    const result = await createDocumentWithUpload({
      title: "Guide",
      description: "",
      categorie: "",
      file,
      cover: null,
      onStep: (step) => steps.push(step),
    });

    expect(result).toEqual({ id: "doc-1", title: "Guide" });
    expect(steps).toEqual(["upload-fichier", "finalisation"]);
    expect(calls).toEqual([
      "/api/admin/librairie/upload-url",
      "https://r2.example/fichier",
      "/api/admin/librairie",
    ]);
  });

  it("upload aussi la couverture quand elle est fournie, en reutilisant le documentId", async () => {
    const file = new File(["pdf"], "guide.pdf", { type: "application/pdf" });
    const cover = new File(["img"], "cover.png", { type: "image/png" });
    const uploadUrlCalls: unknown[] = [];

    const fetchMock = vi.fn(async (url: string | URL, init?: RequestInit) => {
      const href = String(url);
      if (href === "/api/admin/librairie/upload-url") {
        const body = JSON.parse(String(init?.body));
        uploadUrlCalls.push(body);
        if (body.kind === "fichier") {
          return jsonResponse({
            key: "librairie/doc-2/fichier.pdf",
            uploadUrl: "https://r2.example/fichier",
            expiresIn: 300,
            documentId: "doc-2",
          });
        }
        return jsonResponse({
          key: "librairie/doc-2/cover.png",
          uploadUrl: "https://r2.example/cover",
          expiresIn: 300,
          documentId: "doc-2",
        });
      }
      if (href === "https://r2.example/fichier" || href === "https://r2.example/cover") {
        return new Response(null, { status: 200 });
      }
      if (href === "/api/admin/librairie") {
        return jsonResponse({ id: "doc-2", title: "Guide" });
      }
      throw new Error(`URL inattendue: ${href}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    const steps: string[] = [];
    await createDocumentWithUpload({
      title: "Guide",
      description: "",
      categorie: "",
      file,
      cover,
      onStep: (step) => steps.push(step),
    });

    expect(steps).toEqual(["upload-fichier", "upload-cover", "finalisation"]);
    expect(uploadUrlCalls).toEqual([
      { filename: "guide.pdf", contentType: "application/pdf", kind: "fichier" },
      { filename: "cover.png", contentType: "image/png", kind: "cover", documentId: "doc-2" },
    ]);
  });
});
