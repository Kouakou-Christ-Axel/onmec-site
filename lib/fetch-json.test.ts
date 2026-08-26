import { afterEach, describe, expect, it, vi } from "vitest";
import { deleteJson, getJson, patchJson, postJson, sendFormData } from "@/lib/fetch-json";
import { ApiError } from "@/lib/api-error";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetch-json helpers", () => {
  it("getJson effectue un GET et retourne le JSON parse", async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ id: "1" }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await getJson<{ id: string }>("/api/x");
    expect(result).toEqual({ id: "1" });
    expect(fetchMock).toHaveBeenCalledWith("/api/x");
  });

  it("postJson envoie un Content-Type JSON et le corps serialise", async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      expect(headers.get("Content-Type")).toBe("application/json");
      expect(init?.body).toBe(JSON.stringify({ a: 1 }));
      return jsonResponse({ ok: true });
    });
    vi.stubGlobal("fetch", fetchMock);

    await postJson("/api/x", { a: 1 });
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("patchJson utilise la methode PATCH", async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      expect(init?.method).toBe("PATCH");
      return jsonResponse({ ok: true });
    });
    vi.stubGlobal("fetch", fetchMock);

    await patchJson("/api/x", { a: 1 });
  });

  it("deleteJson utilise la methode DELETE sans corps", async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      expect(init?.method).toBe("DELETE");
      expect(init?.body).toBeUndefined();
      return jsonResponse({ ok: true });
    });
    vi.stubGlobal("fetch", fetchMock);

    await deleteJson("/api/x");
  });

  it("sendFormData envoie le FormData tel quel, sans poser de Content-Type", async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      expect(init?.body).toBeInstanceOf(FormData);
      const headers = new Headers(init?.headers);
      expect(headers.has("Content-Type")).toBe(false);
      return jsonResponse({ ok: true });
    });
    vi.stubGlobal("fetch", fetchMock);

    const formData = new FormData();
    formData.set("a", "1");
    await sendFormData("/api/x", "POST", formData);
  });

  it("leve une ApiError quand la reponse n'est pas ok", async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ message: "Erreur" }, 400));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getJson("/api/x")).rejects.toBeInstanceOf(ApiError);
  });
});
