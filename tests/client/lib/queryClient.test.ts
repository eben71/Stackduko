import { describe, expect, it, vi } from "vitest";
import { cn } from "../../../client/src/lib/utils";
import { apiRequest, getQueryFn } from "../../../client/src/lib/queryClient";

class MockResponse {
  constructor(
    private body: string,
    public status: number,
    public ok: boolean,
    public statusText = "",
  ) {}

  async text() {
    return this.body;
  }

  async json() {
    return JSON.parse(this.body);
  }
}

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });
});

describe("apiRequest", () => {
  it("returns response when ok", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new MockResponse("", 200, true));
    vi.stubGlobal("fetch", fetchMock);

    const res = await apiRequest("GET", "/api/scores");
    expect(res.ok).toBe(true);
  });

  it("throws with status and text when not ok", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new MockResponse("Bad", 400, false, "Bad Request"));
    vi.stubGlobal("fetch", fetchMock);

    await expect(apiRequest("GET", "/api/scores")).rejects.toThrow("400: Bad");
  });
});

describe("getQueryFn", () => {
  it("returns null on 401 when configured", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new MockResponse("{}", 401, false));
    vi.stubGlobal("fetch", fetchMock);

    const fn = getQueryFn({ on401: "returnNull" });
    const result = await fn({ queryKey: ["/api/users"] } as any);
    expect(result).toBeNull();
  });

  it("throws on non-401 errors", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new MockResponse("Nope", 500, false));
    vi.stubGlobal("fetch", fetchMock);

    const fn = getQueryFn({ on401: "throw" });
    await expect(fn({ queryKey: ["/api/users"] } as any)).rejects.toThrow(
      "500: Nope",
    );
  });

  it("returns json on success", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new MockResponse("{\"ok\":true}", 200, true));
    vi.stubGlobal("fetch", fetchMock);

    const fn = getQueryFn({ on401: "throw" });
    const result = await fn({ queryKey: ["/api/scores"] } as any);
    expect(result).toEqual({ ok: true });
  });
});
