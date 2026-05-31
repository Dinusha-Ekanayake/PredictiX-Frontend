"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  /** icon size in px */
  size?: number;
};

export default function ThemeToggle({ className, size = 20 }: Props) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [bubbleActive, setBubbleActive] = React.useState(false);
  const [bubblePos, setBubblePos] = React.useState<{ left: number | string; top: number | string }>({
    left: "50%",
    top: "50%",
  });
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  const handleClick = () => {
    // Capture the button center now (refs must not be read during render).
    const btn = buttonRef.current;
    if (btn) {
      setBubblePos({
        left: btn.offsetLeft + btn.offsetWidth / 2,
        top: btn.offsetTop + btn.offsetHeight / 2,
      });
    }
    setBubbleActive(true);
    // toggle theme immediately
    setTheme(isDark ? "light" : "dark");
    // remove bubble animation class after animation completes
    setTimeout(() => setBubbleActive(false), 800);
  };

  return (
    <div className="relative">
      {/* Bubble overlay (expands on click) */}
      {bubbleActive && (
        <div
          className="pointer-events-none fixed inset-0 rounded-full animate-theme-bubble"
          style={{
            // position bubble at button center (captured on click)
            left: bubblePos.left,
            top: bubblePos.top,
            transform: "translate(-50%, -50%)",
            background:
              "radial-gradient(circle, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.) 70%)",
            zIndex: 9999,
          }}
        />
      )}

      <button
        ref={buttonRef}
        type="button"
        aria-label="Toggle theme"
        onClick={handleClick}
        className={cn(
          // ✅ bigger click area without a visible circle
          "relative z-10 inline-flex h-10 w-10 items-center justify-center",
          "text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white",
          "transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 dark:focus-visible:ring-slate-700",
          className
        )}
      >
        {isDark ? (
          <Moon style={{ width: size, height: size }} />
        ) : (
          <Sun style={{ width: size, height: size }} />
        )}
      </button>
    </div>
  );
}

