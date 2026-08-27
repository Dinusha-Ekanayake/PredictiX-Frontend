/**
 * The asset section has to read in both themes.
 *
 * A class like `text-white/70` or `bg-white/4` is invisible on a light ground,
 * and an accent tuned for dark (`text-red-400`) drops below readable contrast
 * there. Nothing fails at build time when one appears, and the panel still
 * renders, so only a check like this notices. Use a semantic token
 * (`text-foreground`, `text-muted-foreground`, `bg-muted`, `border-border`) or
 * pair the accent with a light value: `text-red-600 dark:text-red-400`.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, test } from "vitest";

const DIR = join(process.cwd(), "src/components/admin/assets");

const SOURCES = readdirSync(DIR).filter(
  (f) => f.endsWith(".tsx") && !f.includes(".test."),
);

/**
 * Every whitespace-separated class token in the file.
 *
 * Tokens are inspected whole rather than by looking backwards from the utility,
 * because a variant chain can be arbitrarily long: `dark:hover:bg-white/3` and
 * `dark:data-[state=active]:bg-white/8` are both correct, and both would be
 * missed by a rule that only checks the characters immediately before.
 */
function classTokens(src: string): string[] {
  return src.split(/[\s"'`{}()<>,;]+/).filter(Boolean);
}

/** True when a token only ever applies in dark mode. */
const isDarkScoped = (token: string) => token.split(":").slice(0, -1).includes("dark");

/** White overlays that also apply in light mode, where they vanish. */
function bareWhiteOverlays(src: string): string[] {
  return classTokens(src).filter(
    (t) => /(?:^|:)(?:bg|text|border|ring|divide)-white\/\d+$/.test(t) && !isDarkScoped(t),
  );
}

/** Accent shades tuned for a dark ground, applied without a light counterpart. */
function darkOnlyAccents(src: string): string[] {
  return classTokens(src).filter(
    (t) =>
      /(?:^|:)text-(?:red|emerald|amber|teal|violet|sky|orange|rose)-(?:300|400)$/.test(t) &&
      !isDarkScoped(t),
  );
}

describe("asset section theming", () => {
  test("there are components to check", () => {
    expect(SOURCES.length).toBeGreaterThan(0);
  });

  test.each(SOURCES)("%s uses no bare white overlay", (file) => {
    const found = bareWhiteOverlays(readFileSync(join(DIR, file), "utf8"));

    expect(found, `invisible in light mode: ${found.join(", ")}`).toEqual([]);
  });

  test.each(SOURCES)("%s pairs every dark accent with a light one", (file) => {
    const found = darkOnlyAccents(readFileSync(join(DIR, file), "utf8"));

    expect(found, `unreadable in light mode: ${found.join(", ")}`).toEqual([]);
  });

  test("the checks actually catch a regression", () => {
    // Guards the guard: a matcher that never fires is worse than no matcher.
    expect(bareWhiteOverlays(`<div className="bg-white/4 text-white/70" />`))
      .toEqual(["bg-white/4", "text-white/70"]);
    expect(darkOnlyAccents(`<p className="text-red-400" />`)).toEqual(["text-red-400"]);

    // Longer variant chains are still dark-scoped and must not be reported.
    for (const ok of [
      "dark:bg-white/4",
      "dark:hover:bg-white/3",
      "dark:data-[state=active]:bg-white/8",
      "dark:hover:text-teal-300",
    ]) {
      expect(bareWhiteOverlays(`<div className="${ok}" />`), ok).toEqual([]);
      expect(darkOnlyAccents(`<div className="${ok}" />`), ok).toEqual([]);
    }
    expect(darkOnlyAccents(`<p className="text-red-600 dark:text-red-400" />`)).toEqual([]);
  });
});
