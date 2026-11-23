import { expect, test } from "@playwright/test";

test.describe("production hardening", () => {
  test("serves the security headers on every page", async ({ request }) => {
    const response = await request.get("/login");
    expect(response.status()).toBe(200);

    const headers = response.headers();
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("SAMEORIGIN");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["strict-transport-security"]).toContain("max-age=");
    expect(headers["permissions-policy"]).toContain("camera=()");
    expect(headers["content-security-policy-report-only"]).toContain("frame-ancestors");
    expect(headers["x-powered-by"]).toBeUndefined();
  });

  test("disables the development API relays in a production build", async ({ request }) => {
    expect((await request.get("/api/proxy/assets/")).status()).toBe(404);
    expect((await request.get("/api/proxy-port")).status()).toBe(404);
  });
});
