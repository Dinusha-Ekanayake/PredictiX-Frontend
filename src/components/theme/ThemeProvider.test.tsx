/**
 * Test plan case NS-07 — switch light/dark theme.
 *
 * The backend has no say in this: the theme is a client preference that
 * next-themes writes to localStorage and applies as a class on <html>. So the
 * case is proved here rather than in the API suite.
 */
import { render, screen, act } from "@testing-library/react";
import { useTheme } from "next-themes";
import { beforeEach, expect, test } from "vitest";

import { ThemeProvider } from "./ThemeProvider";

function ThemeProbe() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme ?? "unset"}</span>
      <span data-testid="resolved">{resolvedTheme ?? "unset"}</span>
      <button onClick={() => setTheme("dark")}>dark</button>
      <button onClick={() => setTheme("light")}>light</button>
    </div>
  );
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.className = "";
});

test("NS-07 the provider starts on the system preference rather than a hardcoded theme", () => {
  render(
    <ThemeProvider>
      <ThemeProbe />
    </ThemeProvider>,
  );
  expect(screen.getByTestId("theme").textContent).toBe("system");
});

test("NS-07 choosing dark applies the dark class to the document", async () => {
  render(
    <ThemeProvider>
      <ThemeProbe />
    </ThemeProvider>,
  );

  await act(async () => {
    screen.getByText("dark").click();
  });

  expect(screen.getByTestId("theme").textContent).toBe("dark");
  expect(document.documentElement.classList.contains("dark")).toBe(true);
});

test("NS-07 switching back to light removes the dark class", async () => {
  render(
    <ThemeProvider>
      <ThemeProbe />
    </ThemeProvider>,
  );

  await act(async () => {
    screen.getByText("dark").click();
  });
  await act(async () => {
    screen.getByText("light").click();
  });

  expect(screen.getByTestId("theme").textContent).toBe("light");
  expect(document.documentElement.classList.contains("dark")).toBe(false);
});

test("NS-07 the chosen theme survives a reload by being stored", async () => {
  render(
    <ThemeProvider>
      <ThemeProbe />
    </ThemeProvider>,
  );

  await act(async () => {
    screen.getByText("dark").click();
  });

  expect(localStorage.getItem("theme")).toBe("dark");
});
