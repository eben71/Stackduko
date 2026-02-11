import { describe, expect, it, vi } from "vitest";
import type { QueryFunctionContext } from "@tanstack/react-query";
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

  it("sends json headers/body when data is provided", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new MockResponse("", 200, true));
    vi.stubGlobal("fetch", fetchMock);

    await apiRequest("POST", "/api/scores", { value: 9 });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/scores",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: 9 }),
      }),
    );
  });

  it("throws with status and text when not ok", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new MockResponse("Bad", 400, false, "Bad Request"));
    vi.stubGlobal("fetch", fetchMock);

    await expect(apiRequest("GET", "/api/scores")).rejects.toThrow("400: Bad");
  });

  it("falls back to status text when response text is empty", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new MockResponse("", 403, false, "Forbidden from status text"));
    vi.stubGlobal("fetch", fetchMock);

    await expect(apiRequest("GET", "/api/scores")).rejects.toThrow(
      "403: Forbidden from status text",
    );
  });
});

describe("getQueryFn", () => {
  it("returns null on 401 when configured", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new MockResponse("{}", 401, false));
    vi.stubGlobal("fetch", fetchMock);

    const fn = getQueryFn({ on401: "returnNull" });
    const context = { queryKey: ["/api/users"] } as QueryFunctionContext;
    const result = await fn(context);
    expect(result).toBeNull();
  });

  it("throws on non-401 errors", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new MockResponse("Nope", 500, false));
    vi.stubGlobal("fetch", fetchMock);

    const fn = getQueryFn({ on401: "throw" });
    const context = { queryKey: ["/api/users"] } as QueryFunctionContext;
    await expect(fn(context)).rejects.toThrow("500: Nope");
  });

  it("returns json on success", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new MockResponse('{"ok":true}', 200, true));
    vi.stubGlobal("fetch", fetchMock);

    const fn = getQueryFn({ on401: "throw" });
    const context = { queryKey: ["/api/scores"] } as QueryFunctionContext;
    const result = await fn(context);
    expect(result).toEqual({ ok: true });
  });
});
