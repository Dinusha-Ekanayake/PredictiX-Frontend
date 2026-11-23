import { test as base, type Page } from "@playwright/test";

import { E2E_API_URL } from "../playwright.config";

/** A JWT-shaped token whose payload carries the given expiry (seconds). */
export function fakeToken(expSeconds: number): string {
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ sub: "user-1", exp: expSeconds })}.signature`;
}

export const USER_LOGIN = {
  access_token: fakeToken(Math.floor(Date.now() / 1000) + 8 * 3600),
  token_type: "bearer",
  user_id: "00000000-0000-0000-0000-000000000001",
  email: "ann.log@example.com",
  role: "user",
  full_name: "Ann Lee",
  warehouse_id: "11111111-1111-1111-1111-111111111111",
  warehouse_name: "Colombo",
};

/** Store a signed-in session in localStorage before the app's scripts run. */
export async function signIn(page: Page, token: string, role = "USER"): Promise<void> {
  await page.addInitScript(
    ([t, r]) => {
      localStorage.setItem("predictix.access_token", t);
      localStorage.setItem("token", t);
      localStorage.setItem("predictix.user.role", r);
      localStorage.setItem(
        "predictix.user",
        JSON.stringify({ id: "user-1", email: "ann.log@example.com", role: r, full_name: "Ann Lee" }),
      );
    },
    [token, role],
  );
}

/**
 * Every request to the fake API host is answered here. Unlisted endpoints get
 * an empty list, which pages treat as "no data yet". Tests add their own
 * handlers for the endpoints they care about.
 */
export const test = base.extend<{ api: Page }>({
  api: async ({ page }, provide) => {
    await page.route(`${E2E_API_URL}/**`, (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: "[]" }),
    );
    await provide(page);
  },
});

export { expect } from "@playwright/test";
export { E2E_API_URL };
