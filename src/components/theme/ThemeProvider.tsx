"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";

function ScrollAccentController() {
  const { theme, resolvedTheme } = useTheme();

  React.useEffect(() => {
    let raf = 0;

    // color stops (dark purple, dark green, dark blue)
    const stops = [
      { r: 64, g: 0, b: 96 }, // deep purple
      { r: 6, g: 78, b: 59 }, // deep green
      { r: 11, g: 61, b: 145 }, // deep blue
    ];

    function lerp(a: number, b: number, t: number) {
      return Math.round(a + (b - a) * t);
    }

    function getColorAt(t: number) {
      // map t [0,1] across stops (0->stop0, 0.5->stop1, 1->stop2)
      const seg = t * (stops.length - 1);
      const i = Math.floor(seg);
      const localT = Math.min(1, Math.max(0, seg - i));
      const from = stops[i];
      const to = stops[Math.min(stops.length - 1, i + 1)];
      return {
        r: lerp(from.r, to.r, localT),
        g: lerp(from.g, to.g, localT),
        b: lerp(from.b, to.b, localT),
      };
    }

    function onScroll() {
      // only active when dark theme is active
      const active = (resolvedTheme || theme) === "dark";
      if (!active) return;

      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const doc = document.documentElement;
        const scrollTop = window.scrollY || window.pageYOffset || 0;
        const max = doc.scrollHeight - window.innerHeight || 1;
        const t = Math.max(0, Math.min(1, scrollTop / max));
        const c = getColorAt(t);

        // set CSS custom properties used by the design system
        document.documentElement.style.setProperty("--dynamic-accent-r", String(c.r));
        document.documentElement.style.setProperty("--dynamic-accent-g", String(c.g));
        document.documentElement.style.setProperty("--dynamic-accent-b", String(c.b));
        // also update shadcn --accent to allow components to pick it up
        document.documentElement.style.setProperty("--accent", `rgb(${c.r} ${c.g} ${c.b})`);
      });
    }

    // bind
    window.addEventListener("scroll", onScroll, { passive: true });
    // run once to initialize
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [theme, resolvedTheme]);

  return null;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      {/* controller must be inside provider */}
      <ScrollAccentController />
      {children}
    </NextThemesProvider>
  );
}
