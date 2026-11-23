import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const logout = vi.fn();
const getAccessToken = vi.fn<() => string | null>();

vi.mock("./authService", () => ({
  logout: () => logout(),
  getAccessToken: () => getAccessToken(),
}));

import { ApiError, apiFetch, apiGet, apiPost } from "./apiClient";

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("apiClient", () => {
  const fetchMock = vi.fn<typeof fetch>();
  const originalLocation = window.location;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", fetchMock);
    // jsdom does not navigate; a plain object lets the test read the redirect.
    Object.defineProperty(window, "location", { configurable: true, value: { href: "/admin" } });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    Object.defineProperty(window, "location", { configurable: true, value: originalLocation });
  });

  it("sends the stored token as a Bearer header", async () => {
    getAccessToken.mockReturnValue("tok-123");
    fetchMock.mockResolvedValue(jsonResponse(200, {}));

    await apiFetch("/assets/");

    const headers = fetchMock.mock.calls[0][1]?.headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer tok-123");
    expect(headers["Content-Type"]).toBe("application/json");
  });

  it("sends no Authorization header when signed out", async () => {
    getAccessToken.mockReturnValue(null);
    fetchMock.mockResolvedValue(jsonResponse(200, {}));

    await apiFetch("/faq");

    const headers = fetchMock.mock.calls[0][1]?.headers as Record<string, string>;
    expect(headers.Authorization).toBeUndefined();
  });

  it("lets the browser set the multipart boundary for uploads", async () => {
    getAccessToken.mockReturnValue("tok");
    fetchMock.mockResolvedValue(jsonResponse(200, {}));

    await apiFetch("/assets/1/image", { method: "POST", body: new FormData() });

    const headers = fetchMock.mock.calls[0][1]?.headers as Record<string, string>;
    expect(headers["Content-Type"]).toBeUndefined();
  });

  it("signs out and returns to the login page on a 401", async () => {
    getAccessToken.mockReturnValue("expired");
    fetchMock.mockResolvedValue(jsonResponse(401, { detail: "Invalid token" }));

    await expect(apiFetch("/assets/")).rejects.toThrow("Session expired");
    expect(logout).toHaveBeenCalledOnce();
    expect(window.location.href).toBe("/login");
  });

  it("does not sign out on a 403 or 400", async () => {
    getAccessToken.mockReturnValue("tok");
    fetchMock.mockResolvedValueOnce(jsonResponse(403, { detail: "Admins only" }));
    fetchMock.mockResolvedValueOnce(jsonResponse(400, { detail: "Current password is incorrect." }));

    await expect(apiGet("/users/")).rejects.toThrow("Admins only");
    await expect(apiPost("/profiles/me/password", {})).rejects.toThrow("Current password is incorrect.");
    expect(logout).not.toHaveBeenCalled();
  });

  it("carries the HTTP status on a failed GET", async () => {
    getAccessToken.mockReturnValue("tok");
    fetchMock.mockResolvedValue(jsonResponse(404, { detail: "Asset not found" }));

    const error = await apiGet("/assets/x").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(404);
    expect((error as ApiError).message).toBe("Asset not found");
  });

  it("turns a 422 validation list into a readable message", async () => {
    getAccessToken.mockReturnValue("tok");
    fetchMock.mockResolvedValue(
      jsonResponse(422, {
        detail: [
          { loc: ["body", "due_date"], msg: "Invalid date", type: "value_error" },
          { loc: ["body", "priority"], msg: "Field required", type: "missing" },
        ],
      }),
    );

    await expect(apiPost("/tickets/", {})).rejects.toThrow("due_date: Invalid date; priority: Field required");
  });

  it("falls back to a generic message when the error body is not JSON", async () => {
    getAccessToken.mockReturnValue("tok");
    fetchMock.mockResolvedValue(new Response("<html>bad gateway</html>", { status: 502 }));

    await expect(apiGet("/assets/")).rejects.toThrow("Request failed with status 502");
  });
});
