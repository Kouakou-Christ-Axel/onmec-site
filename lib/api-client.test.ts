import { afterEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "@/lib/api-client";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("apiFetch", () => {
  it("laisse fetch poser son propre Content-Type pour un corps FormData", async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      expect(headers.has("Content-Type")).toBe(false);
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const formData = new FormData();
    formData.set("title", "Test");

    const result = await apiFetch("/actualites", { method: "POST", body: formData, auth: false });
    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("pose toujours Content-Type: application/json pour un corps chaine classique", async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      expect(headers.get("Content-Type")).toBe("application/json");
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    await apiFetch("/actualites", { method: "POST", body: JSON.stringify({ a: 1 }), auth: false });
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});
