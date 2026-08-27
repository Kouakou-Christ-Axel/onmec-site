import { afterEach, describe, expect, it, vi } from "vitest";
import { putFileToUploadUrl } from "@/features/librairie-admin/lib/upload-to-r2";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("putFileToUploadUrl", () => {
  it("envoie un PUT avec le Content-Type et le fichier en corps", async () => {
    const file = new File(["contenu"], "guide.pdf", { type: "application/pdf" });
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      expect(init?.method).toBe("PUT");
      const headers = new Headers(init?.headers);
      expect(headers.get("Content-Type")).toBe("application/pdf");
      expect(init?.body).toBe(file);
      return new Response(null, { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);

    await putFileToUploadUrl("https://r2.example/upload-url", file, "application/pdf");
    expect(fetchMock).toHaveBeenCalledWith("https://r2.example/upload-url", expect.anything());
  });

  it("leve une erreur si la reponse n'est pas ok", async () => {
    const file = new File(["contenu"], "guide.pdf", { type: "application/pdf" });
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(null, { status: 403 })),
    );

    await expect(
      putFileToUploadUrl("https://r2.example/upload-url", file, "application/pdf"),
    ).rejects.toThrow("403");
  });
});
