/**
 * Test plan case NS-08 — navigate between main application areas.
 *
 * A browser test would prove a click paints a page, which needs a running
 * server. What can be proved without one, and is the failure that actually
 * happens, is that every link in the navbar points at a route the app router
 * can serve. A link to a folder with no page.tsx is a 404 in production and
 * silently passes typecheck, so it is worth asserting.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { expect, test } from "vitest";

const ROOT = process.cwd();
const NAVBAR = join(ROOT, "src/components/navigation/AdminNavbar.tsx");
const APP = join(ROOT, "src/app");

/** Route groups like (admin) do not appear in the URL, so a href maps to
 *  either src/app/<href> or src/app/(group)/<href>. */
function routeExists(href: string): boolean {
  const direct = join(APP, href, "page.tsx");
  if (existsSync(direct)) return true;
  for (const group of ["(admin)", "(user)", "(auth)"]) {
    if (existsSync(join(APP, group, href, "page.tsx"))) return true;
  }
  return false;
}

function navHrefs(): string[] {
  const src = readFileSync(NAVBAR, "utf8");
  const block = src.slice(src.indexOf("const NAV = ["));
  const list = block.slice(0, block.indexOf("] as const"));
  return [...list.matchAll(/href:\s*"([^"]+)"/g)].map((m) => m[1]);
}

test("NS-08 the navbar declares the expected admin areas", () => {
  const hrefs = navHrefs();
  expect(hrefs.length).toBeGreaterThan(0);
  expect(hrefs).toContain("/admin/dashboard");
  expect(hrefs).toContain("/admin/assets");
  expect(hrefs).toContain("/admin/tickets");
  expect(hrefs).toContain("/admin/users");
});

test("NS-08 every navbar link resolves to a route that exists", () => {
  const broken = navHrefs().filter((href) => !routeExists(href));
  expect(broken, `navbar links with no page.tsx behind them: ${broken.join(", ")}`)
    .toEqual([]);
});

test("NS-08 the profile and settings destinations exist", () => {
  // Reached from the avatar dropdown rather than the main nav, so they are
  // not in NAV and would otherwise go unchecked.
  for (const href of ["/admin/profile", "/admin/settings"]) {
    expect(routeExists(href), `${href} has no page.tsx`).toBe(true);
  }
});
