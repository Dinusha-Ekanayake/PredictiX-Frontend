// // // // "use client";

// // // // import * as React from "react";
// // // // import { useTheme } from "next-themes";
// // // // import { Moon, Sun } from "lucide-react";

// // // // /**
// // // //  * Theme toggle — pill-shaped switch with a moon/sun icon.
// // // //  * Uses semi-transparent white so it works on both the purple gradient header
// // // //  * and standalone on darker backgrounds (login page, etc.).
// // // //  */
// // // // export default function ThemeToggle() {
// // // //   const { resolvedTheme, setTheme } = useTheme();
// // // //   const [mounted, setMounted] = React.useState(false);

// // // //   React.useEffect(() => setMounted(true), []);
// // // //   if (!mounted) return null;

// // // //   const isDark = resolvedTheme === "dark";

// // // //   return (
// // // //     <div className="flex items-center gap-1.5">
// // // //       {/* Toggle switch track */}
// // // //       <button
// // // //         type="button"
// // // //         role="switch"
// // // //         aria-checked={isDark}
// // // //         aria-label="Toggle theme"
// // // //         onClick={() => setTheme(isDark ? "light" : "dark")}
// // // //         className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-white/20 bg-white/15 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
// // // //       >
// // // //         {/* Thumb */}
// // // //         <span
// // // //           className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
// // // //             isDark ? "translate-x-[22px]" : "translate-x-[3px]"
// // // //           }`}
// // // //         />
// // // //       </button>

// // // //       {/* Icon beside the toggle */}
// // // //       {isDark ? (
// // // //         <Moon className="h-4 w-4 text-white/60" />
// // // //       ) : (
// // // //         <Sun className="h-4 w-4 text-white/60" />
// // // //       )}
// // // //     </div>
// // // //   );
// // // // }


// // // // VERSION 02

// // // "use client";

// // // import * as React from "react";
// // // import { useTheme } from "next-themes";
// // // import { Moon, Sun } from "lucide-react";
// // // import { cn } from "@/lib/utils";

// // // /**
// // //  * Theme toggle — pill switch that stays visible on BOTH:
// // //  * - light headers (white background)
// // //  * - dark headers (dark background)
// // //  */
// // // export default function ThemeToggle() {
// // //   const { resolvedTheme, setTheme } = useTheme();
// // //   const [mounted, setMounted] = React.useState(false);

// // //   React.useEffect(() => setMounted(true), []);
// // //   if (!mounted) return null;

// // //   const isDark = resolvedTheme === "dark";

// // //   return (
// // //     <button
// // //       type="button"
// // //       role="switch"
// // //       aria-checked={isDark}
// // //       aria-label="Toggle theme"
// // //       onClick={() => setTheme(isDark ? "light" : "dark")}
// // //       className={cn(
// // //         "relative inline-flex h-9 w-14 items-center rounded-full border transition-colors",
// // //         "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
// // //         // ✅ Visible on light navbar
// // //         "bg-slate-900/10 border-slate-900/10",
// // //         // ✅ Visible on dark navbar
// // //         "dark:bg-white/10 dark:border-white/15"
// // //       )}
// // //     >
// // //       {/* Thumb */}
// // //       <span
// // //         className={cn(
// // //           "pointer-events-none absolute left-1 grid h-7 w-7 place-items-center rounded-full shadow-sm transition-transform",
// // //           "bg-white text-slate-900",
// // //           "dark:bg-slate-950 dark:text-white",
// // //           isDark ? "translate-x-5" : "translate-x-0"
// // //         )}
// // //       >
// // //         {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
// // //       </span>
// // //     </button>
// // //   );
// // // }


// // // VERSION 03

// // "use client";

// // import * as React from "react";
// // import { useTheme } from "next-themes";
// // import { Moon, Sun } from "lucide-react";
// // import { cn } from "@/lib/utils";

// // /**
// //  * Icon-only theme toggle (Moon/Sun button)
// //  * - Looks good on white headers and dark headers
// //  * - No switch/track UI
// //  */
// // export default function ThemeToggle({
// //   className,
// //   size = 40,
// // }: {
// //   className?: string;
// //   size?: number; // button size in px
// // }) {
// //   const { resolvedTheme, setTheme } = useTheme();
// //   const [mounted, setMounted] = React.useState(false);

// //   React.useEffect(() => setMounted(true), []);
// //   if (!mounted) return null;

// //   const isDark = resolvedTheme === "dark";

// //   return (
// //     <button
// //       type="button"
// //       aria-label="Toggle theme"
// //       onClick={() => setTheme(isDark ? "light" : "dark")}
// //       className={cn(
// //         "inline-flex items-center justify-center rounded-full border transition",
// //         "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
// //         // ✅ Visible on white navbar
// //         "bg-slate-900/5 border-slate-900/10 hover:bg-slate-900/10",
// //         // ✅ Visible on dark header
// //         "dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10",
// //         className
// //       )}
// //       style={{ width: size, height: size }}
// //     >
// //       {isDark ? (
// //         <Sun className="h-5 w-5 text-slate-700 dark:text-slate-200" />
// //       ) : (
// //         <Moon className="h-5 w-5 text-slate-700 dark:text-slate-200" />
// //       )}
// //     </button>
// //   );
// // }

// // VERSION 04

// "use client";

// import * as React from "react";
// import { useTheme } from "next-themes";
// import { Moon, Sun } from "lucide-react";
// import { cn } from "@/lib/utils";

// export default function ThemeToggle({
//   className,
//   size = 18, // smaller icon size
// }: {
//   className?: string;
//   size?: number;
// }) {
//   const { resolvedTheme, setTheme } = useTheme();
//   const [mounted, setMounted] = React.useState(false);

//   React.useEffect(() => setMounted(true), []);
//   if (!mounted) return null;

//   const isDark = resolvedTheme === "dark";

//   return (
//     <button
//       type="button"
//       aria-label="Toggle theme"
//       onClick={() => setTheme(isDark ? "light" : "dark")}
//       className={cn(
//         "inline-flex items-center justify-center transition-colors duration-200",
//         "text-slate-700 hover:text-slate-900",
//         "dark:text-slate-300 dark:hover:text-white",
//         className
//       )}
//     >
//       {isDark ? (
//         <Sun size={size} />
//       ) : (
//         <Moon size={size} />
//       )}
//     </button>
//   );
// }

  // VERSION 05

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

  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        // ✅ bigger click area without a visible circle
        "inline-flex h-10 w-10 items-center justify-center",
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
  );
}
