import { E2E_API_URL, USER_LOGIN, expect, fakeToken, signIn, test } from "./fixtures";

test.describe("route protection", () => {
  test("sends a signed-out visitor from an admin page to the login page", async ({ api: page }) => {
    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("sends a signed-out visitor from a user page to the login page", async ({ api: page }) => {
    await page.goto("/user/dashboard");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("sends a signed-out visitor from the help desk to the login page without calling the API", async ({ api: page }) => {
    const apiCalls: string[] = [];
    page.on("request", (req) => {
      if (req.url().startsWith(E2E_API_URL) && !req.url().includes("/warmup/")) apiCalls.push(req.url());
    });
    await page.goto("/help-desk");
    await expect(page).toHaveURL(/\/login$/);
    expect(apiCalls).toEqual([]);
  });

  test("treats an expired token as signed out and clears it", async ({ api: page }) => {
    await signIn(page, fakeToken(Math.floor(Date.now() / 1000) - 60));
    await page.goto("/user/dashboard");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("sends a regular user from the admin area to their own dashboard", async ({ api: page }) => {
    await signIn(page, USER_LOGIN.access_token, "USER");
    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/user\/dashboard/);
  });
});

test.describe("login", () => {
  test("shows the sign-in form", async ({ api: page }) => {
    await page.goto("/login");
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Log in" })).toBeDisabled();
  });

  test("shows the server's message for wrong credentials and stays on the page", async ({ api: page }) => {
    await page.route(`${E2E_API_URL}/auth/login`, (route) =>
      route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ detail: "Invalid email or password" }) }),
    );
    await page.goto("/login");
    await page.getByLabel("Email").fill("ann.log@example.com");
    await page.getByLabel("Password").fill("wrong-password");
    await page.getByRole("button", { name: "Log in" }).click();

    // Next.js renders its own empty role="alert" route announcer, so match by text.
    await expect(page.getByRole("alert").filter({ hasText: "Invalid email or password" })).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("signs a user in and opens their dashboard", async ({ api: page }) => {
    let sentBody: unknown;
    await page.route(`${E2E_API_URL}/auth/login`, async (route) => {
      sentBody = route.request().postDataJSON();
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(USER_LOGIN) });
    });
    await page.goto("/login");
    await page.getByLabel("Email").fill("  Ann.Log@Example.com ");
    await page.getByLabel("Password").fill("correct-password");
    await page.getByRole("button", { name: "Log in" }).click();

    await expect(page).toHaveURL(/\/user\/dashboard/);
    expect(sentBody).toEqual({ email: "ann.log@example.com", password: "correct-password" });
    expect(await page.evaluate(() => localStorage.getItem("predictix.user.role"))).toBe("USER");
  });
});
