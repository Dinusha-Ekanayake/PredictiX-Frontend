"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

/**
 * Theme toggle — pill-shaped switch with a moon/sun icon.
 * Uses semi-transparent white so it works on both the purple gradient header
 * and standalone on darker backgrounds (login page, etc.).
 */
export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  return (
    <div className="flex items-center gap-1.5">
      {/* Toggle switch track */}
      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label="Toggle theme"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-white/20 bg-white/15 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
      >
        {/* Thumb */}
        <span
          className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
            isDark ? "translate-x-[22px]" : "translate-x-[3px]"
          }`}
        />
      </button>

      {/* Icon beside the toggle */}
      {isDark ? (
        <Moon className="h-4 w-4 text-white/60" />
      ) : (
        <Sun className="h-4 w-4 text-white/60" />
      )}
    </div>
  );
}
