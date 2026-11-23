import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end smoke tests against a real production build.
 *
 * The app is built with NEXT_PUBLIC_API_URL pointing at a host that does not
 * exist. Each test intercepts that host with page.route, so the suite needs no
 * backend, database or credentials and gives the same result on every run.
 */
export const E2E_API_URL = "http://api.e2e.invalid";
const PORT = 3100;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npx next build && npx next start -p ${PORT}`,
    url: `http://127.0.0.1:${PORT}/login`,
    timeout: 600_000,
    reuseExistingServer: !process.env.CI,
    env: {
      NEXT_PUBLIC_API_URL: E2E_API_URL,
      NEXT_PUBLIC_SUPABASE_URL: "",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
      NEXT_TELEMETRY_DISABLED: "1",
    },
  },
});
