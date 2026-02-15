// // // // // // // "use client";

// // // // // // // import * as React from "react";
// // // // // // // import Link from "next/link";
// // // // // // // import { usePathname } from "next/navigation";
// // // // // // // import { LayoutDashboard, Ticket, Boxes, Warehouse, Users } from "lucide-react";

// // // // // // // import PredictiXLogo from "@/components/brand/PredictiXLogo";
// // // // // // // import ThemeToggle from "@/components/theme/ThemeToggle";
// // // // // // // import { cn } from "@/lib/utils";

// // // // // // // const NAV = [
// // // // // // //   { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
// // // // // // //   { href: "/admin/tickets", label: "Tickets", icon: Ticket },
// // // // // // //   { href: "/admin/assets", label: "Assets", icon: Boxes },
// // // // // // //   { href: "/admin/warehouse", label: "Warehouse", icon: Warehouse },
// // // // // // //   { href: "/admin/users", label: "Users", icon: Users },
// // // // // // // ] as const;

// // // // // // // function isActive(pathname: string, href: string) {
// // // // // // //   return pathname === href || pathname.startsWith(href + "/");
// // // // // // // }

// // // // // // // export default function AdminNavbar() {
// // // // // // //   const pathname = usePathname() ?? "";
// // // // // // //   const [scrolled, setScrolled] = React.useState(false);

// // // // // // //   React.useEffect(() => {
// // // // // // //     const onScroll = () => setScrolled(window.scrollY > 90);
// // // // // // //     onScroll();
// // // // // // //     window.addEventListener("scroll", onScroll, { passive: true });
// // // // // // //     return () => window.removeEventListener("scroll", onScroll);
// // // // // // //   }, []);

// // // // // // //   return (
// // // // // // //     <>
// // // // // // //       {/* Sticky (on scroll) */}
// // // // // // //       <div
// // // // // // //         className={cn(
// // // // // // //           "fixed left-0 top-0 z-50 w-full transition-all duration-300",
// // // // // // //           scrolled
// // // // // // //             ? "opacity-100 translate-y-0"
// // // // // // //             : "opacity-0 -translate-y-3 pointer-events-none"
// // // // // // //         )}
// // // // // // //       >
// // // // // // //         <div className="border-b border-slate-200 bg-white/75 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/60">
// // // // // // //           <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
// // // // // // //             <Link href="/admin/dashboard" className="flex items-center gap-2">
// // // // // // //               <PredictiXLogo size={28} showText={false} />
// // // // // // //               <span className="text-sm font-semibold">PredictiX</span>
// // // // // // //             </Link>

// // // // // // //             <nav className="hidden md:flex items-center gap-1 rounded-2xl bg-slate-100 p-1 dark:bg-slate-900/70">
// // // // // // //               {NAV.map((item) => {
// // // // // // //                 const active = isActive(pathname, item.href);
// // // // // // //                 const Icon = item.icon;
// // // // // // //                 return (
// // // // // // //                   <Link
// // // // // // //                     key={item.href}
// // // // // // //                     href={item.href}
// // // // // // //                     className={cn(
// // // // // // //                       "flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-medium transition",
// // // // // // //                       "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-50",
// // // // // // //                       active &&
// // // // // // //                         "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200 dark:bg-slate-950 dark:text-slate-50 dark:ring-slate-800"
// // // // // // //                     )}
// // // // // // //                   >
// // // // // // //                     <Icon className="h-4 w-4" />
// // // // // // //                     {item.label}
// // // // // // //                   </Link>
// // // // // // //                 );
// // // // // // //               })}
// // // // // // //             </nav>

// // // // // // //             <div className="flex items-center gap-3">
// // // // // // //               <ThemeToggle />
// // // // // // //               <div className="h-9 w-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-semibold dark:bg-slate-100 dark:text-slate-900">
// // // // // // //                 AD
// // // // // // //               </div>
// // // // // // //             </div>
// // // // // // //           </div>
// // // // // // //         </div>
// // // // // // //       </div>

// // // // // // //       {/* Big header (top) */}
// // // // // // //       <header className="mx-auto max-w-7xl px-4 pt-6">
// // // // // // //         <div
// // // // // // //           className={cn(
// // // // // // //             "rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950/50 transition-all duration-300",
// // // // // // //             scrolled && "opacity-0 pointer-events-none -translate-y-2"
// // // // // // //           )}
// // // // // // //         >
// // // // // // //           <div className="flex items-center justify-between px-6 py-4">
// // // // // // //             <Link href="/admin/dashboard" className="flex items-center gap-3">
// // // // // // //               <PredictiXLogo size={40} />
// // // // // // //             </Link>

// // // // // // //             <nav className="hidden md:flex items-center gap-8">
// // // // // // //               {NAV.map((item) => {
// // // // // // //                 const active = isActive(pathname, item.href);
// // // // // // //                 const Icon = item.icon;
// // // // // // //                 return (
// // // // // // //                   <Link
// // // // // // //                     key={item.href}
// // // // // // //                     href={item.href}
// // // // // // //                     className={cn(
// // // // // // //                       "flex items-center gap-2 text-sm font-semibold transition",
// // // // // // //                       "text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white",
// // // // // // //                       active && "text-slate-900 dark:text-white"
// // // // // // //                     )}
// // // // // // //                   >
// // // // // // //                     <Icon className="h-4 w-4" />
// // // // // // //                     {item.label}
// // // // // // //                   </Link>
// // // // // // //                 );
// // // // // // //               })}
// // // // // // //             </nav>

// // // // // // //             <div className="flex items-center gap-4">
// // // // // // //               <ThemeToggle />
// // // // // // //               <div className="flex items-center gap-3">
// // // // // // //                 <div className="text-right leading-tight hidden sm:block">
// // // // // // //                   <div className="text-sm font-semibold">Admin</div>
// // // // // // //                   <div className="text-xs text-muted-foreground">PredictiX</div>
// // // // // // //                 </div>
// // // // // // //                 <div className="h-12 w-12 rounded-full bg-violet-600/90 text-white flex items-center justify-center font-semibold">
// // // // // // //                   A
// // // // // // //                 </div>
// // // // // // //               </div>
// // // // // // //             </div>
// // // // // // //           </div>
// // // // // // //         </div>

// // // // // // //         <div className="h-6" />
// // // // // // //       </header>

// // // // // // //       {/* spacer for fixed sticky bar */}
// // // // // // //       <div className="h-14" />
// // // // // // //     </>
// // // // // // //   );
// // // // // // // }


// // // // // // "use client";

// // // // // // import * as React from "react";
// // // // // // import Link from "next/link";
// // // // // // import { usePathname } from "next/navigation";
// // // // // // import { LayoutDashboard, Ticket, Boxes, Warehouse, Users } from "lucide-react";

// // // // // // import PredictiXLogo from "@/components/brand/PredictiXLogo";
// // // // // // import ThemeToggle from "@/components/theme/ThemeToggle";
// // // // // // import { cn } from "@/lib/utils";

// // // // // // const NAV = [
// // // // // //   { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
// // // // // //   { href: "/admin/tickets", label: "Tickets", icon: Ticket },
// // // // // //   { href: "/admin/assets", label: "Assets", icon: Boxes },
// // // // // //   { href: "/admin/warehouse", label: "Warehouse", icon: Warehouse },
// // // // // //   { href: "/admin/users", label: "Users", icon: Users },
// // // // // // ] as const;

// // // // // // function isActive(pathname: string, href: string) {
// // // // // //   return pathname === href || pathname.startsWith(href + "/");
// // // // // // }

// // // // // // export default function AdminNavbar() {
// // // // // //   const pathname = usePathname() ?? "";
// // // // // //   const [scrolled, setScrolled] = React.useState(false);

// // // // // //   React.useEffect(() => {
// // // // // //     const onScroll = () => setScrolled(window.scrollY > 80);
// // // // // //     onScroll();
// // // // // //     window.addEventListener("scroll", onScroll, { passive: true });
// // // // // //     return () => window.removeEventListener("scroll", onScroll);
// // // // // //   }, []);

// // // // // //   return (
// // // // // //     <>
// // // // // //       {/* The wrapper changes style depending on scroll */}
// // // // // //       <header
// // // // // //         className={cn(
// // // // // //           "z-50 w-full transition-all duration-300",
// // // // // //           // ✅ At top: attached to the top (not floating)
// // // // // //           !scrolled && "sticky top-0",
// // // // // //           // ✅ After scroll: fixed + floating (separated look)
// // // // // //           scrolled && "fixed top-4 left-0"
// // // // // //         )}
// // // // // //       >
// // // // // //         <div
// // // // // //           className={cn(
// // // // // //             "transition-all duration-300",
// // // // // //             // width behavior:
// // // // // //             !scrolled && "w-full",
// // // // // //             scrolled && "mx-auto max-w-7xl px-4"
// // // // // //           )}
// // // // // //         >
// // // // // //           <div
// // // // // //             className={cn(
// // // // // //               "flex items-center justify-between",
// // // // // //               "bg-white/80 backdrop-blur-md dark:bg-slate-950/60",
// // // // // //               "border border-slate-200 dark:border-slate-800",
// // // // // //               "transition-all duration-300",
// // // // // //               // ✅ Top state: attached bar style (no rounded, no shadow)
// // // // // //               !scrolled && "h-16 rounded-none border-x-0 border-t-0 shadow-none px-4",
// // // // // //               // ✅ Scrolled state: floating “card” style (rounded + shadow + gap)
// // // // // //               scrolled && "h-14 rounded-3xl shadow-lg px-5"
// // // // // //             )}
// // // // // //           >
// // // // // //             {/* Left: Brand */}
// // // // // //             <Link href="/admin/dashboard" className="flex items-center gap-3">
// // // // // //               <PredictiXLogo size={scrolled ? 30 : 38} showText={!scrolled} />
// // // // // //               {scrolled && (
// // // // // //                 <span className="text-sm font-semibold hidden sm:inline">PredictiX</span>
// // // // // //               )}
// // // // // //             </Link>

// // // // // //             {/* Center: Nav */}
// // // // // //             <nav
// // // // // //               className={cn(
// // // // // //                 "hidden md:flex items-center transition-all duration-300",
// // // // // //                 // Top: simple spaced links
// // // // // //                 !scrolled && "gap-8",
// // // // // //                 // Scrolled: pill/tabs container
// // // // // //                 scrolled && "gap-1 rounded-2xl bg-slate-100 p-1 dark:bg-slate-900/70"
// // // // // //               )}
// // // // // //             >
// // // // // //               {NAV.map((item) => {
// // // // // //                 const active = isActive(pathname, item.href);
// // // // // //                 const Icon = item.icon;

// // // // // //                 return (
// // // // // //                   <Link
// // // // // //                     key={item.href}
// // // // // //                     href={item.href}
// // // // // //                     className={cn(
// // // // // //                       "flex items-center gap-2 text-sm font-semibold transition",
// // // // // //                       "text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white",

// // // // // //                       // Scrolled pill style
// // // // // //                       scrolled &&
// // // // // //                         "rounded-xl px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-50",

// // // // // //                       // Active states
// // // // // //                       !scrolled && active && "text-slate-900 dark:text-white",
// // // // // //                       scrolled &&
// // // // // //                         active &&
// // // // // //                         "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200 dark:bg-slate-950 dark:text-slate-50 dark:ring-slate-800"
// // // // // //                     )}
// // // // // //                   >
// // // // // //                     <Icon className="h-4 w-4" />
// // // // // //                     {item.label}
// // // // // //                   </Link>
// // // // // //                 );
// // // // // //               })}
// // // // // //             </nav>

// // // // // //             {/* Right: theme + avatar */}
// // // // // //             <div className="flex items-center gap-3">
// // // // // //               <ThemeToggle />

// // // // // //               <div className="flex items-center gap-3">
// // // // // //                 {/* hide text when scrolled to stay compact */}
// // // // // //                 {!scrolled && (
// // // // // //                   <div className="text-right leading-tight hidden sm:block">
// // // // // //                     <div className="text-sm font-semibold">Dinusha Ekanayake</div>
// // // // // //                     <div className="text-xs text-muted-foreground">Admin</div>
// // // // // //                   </div>
// // // // // //                 )}

// // // // // //                 <div
// // // // // //                   className={cn(
// // // // // //                     "flex items-center justify-center font-semibold text-white",
// // // // // //                     "rounded-full bg-violet-600/90",
// // // // // //                     scrolled ? "h-9 w-9 text-sm" : "h-12 w-12 text-base"
// // // // // //                   )}
// // // // // //                 >
// // // // // //                   D
// // // // // //                 </div>
// // // // // //               </div>
// // // // // //             </div>
// // // // // //           </div>
// // // // // //         </div>
// // // // // //       </header>

// // // // // //       {/* Spacer so page content doesn't go under the fixed navbar when scrolled */}
// // // // // //       <div className={cn(!scrolled ? "h-0" : "h-20")} />
// // // // // //     </>
// // // // // //   );
// // // // // // }


// // // // // "use client";

// // // // // import * as React from "react";
// // // // // import Link from "next/link";
// // // // // import { usePathname } from "next/navigation";
// // // // // import { LayoutDashboard, Ticket, Boxes, Warehouse, Users } from "lucide-react";

// // // // // import PredictiXLogo from "@/components/brand/PredictiXLogo";
// // // // // import ThemeToggle from "@/components/theme/ThemeToggle";
// // // // // import { cn } from "@/lib/utils";

// // // // // const NAV = [
// // // // //   { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
// // // // //   { href: "/admin/tickets", label: "Tickets", icon: Ticket },
// // // // //   { href: "/admin/assets", label: "Assets", icon: Boxes },
// // // // //   { href: "/admin/warehouse", label: "Warehouse", icon: Warehouse },
// // // // //   { href: "/admin/users", label: "Users", icon: Users },
// // // // // ] as const;

// // // // // function isActive(pathname: string, href: string) {
// // // // //   return pathname === href || pathname.startsWith(href + "/");
// // // // // }

// // // // // export default function AdminNavbar() {
// // // // //   const pathname = usePathname() ?? "";
// // // // //   const [scrolled, setScrolled] = React.useState(false);

// // // // //   React.useEffect(() => {
// // // // //     const onScroll = () => setScrolled(window.scrollY > 80);
// // // // //     onScroll();
// // // // //     window.addEventListener("scroll", onScroll, { passive: true });
// // // // //     return () => window.removeEventListener("scroll", onScroll);
// // // // //   }, []);

// // // // //   return (
// // // // //     <>
// // // // //       <header
// // // // //         className={cn(
// // // // //           "z-50 w-full transition-all duration-300",
// // // // //           !scrolled && "sticky top-0",
// // // // //           scrolled && "fixed left-0 top-4"
// // // // //         )}
// // // // //       >
// // // // //         <div
// // // // //           className={cn(
// // // // //             "transition-all duration-300",
// // // // //             !scrolled && "w-full",
// // // // //             scrolled && "mx-auto max-w-7xl px-4"
// // // // //           )}
// // // // //         >
// // // // //           <div
// // // // //             className={cn(
// // // // //               "relative flex items-center justify-between",
// // // // //               "bg-white/75 backdrop-blur-xl dark:bg-slate-950/55",
// // // // //               "transition-all duration-300 ease-out",
// // // // //               !scrolled
// // // // //                 ? [
// // // // //                     // attached top bar
// // // // //                     "h-16 px-4",
// // // // //                     "border-b border-slate-200/70 dark:border-slate-800/70",
// // // // //                     "shadow-[0_1px_0_rgba(15,23,42,0.04)] dark:shadow-[0_1px_0_rgba(255,255,255,0.04)]",
// // // // //                     "rounded-none",
// // // // //                   ].join(" ")
// // // // //                 : [
// // // // //                     // floating bar
// // // // //                     "h-14 px-5",
// // // // //                     "rounded-3xl",
// // // // //                     "border border-slate-200/60 dark:border-slate-800/60",
// // // // //                     "shadow-[0_18px_45px_-18px_rgba(15,23,42,0.35)] dark:shadow-[0_18px_45px_-18px_rgba(0,0,0,0.60)]",
// // // // //                     "ring-1 ring-white/35 dark:ring-white/10",
// // // // //                     "scale-[0.995]",
// // // // //                   ].join(" ")
// // // // //             )}
// // // // //           >
// // // // //             {/* subtle top glow (only when floating) */}
// // // // //             {scrolled && (
// // // // //               <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-b from-white/40 via-transparent to-transparent opacity-70 dark:from-white/10" />
// // // // //             )}

// // // // //             {/* Left */}
// // // // //             <Link href="/admin/dashboard" className="relative flex items-center gap-3">
// // // // //               <PredictiXLogo
// // // // //                 size={scrolled ? 30 : 40}
// // // // //                 showText={false}   // 🔥 Disable internal text
// // // // //               />

// // // // //               <div className="leading-tight">
// // // // //                 <div
// // // // //                   className={cn(
// // // // //                     "transition-all duration-300",
// // // // //                     scrolled
// // // // //                       ? "text-[20px] font-medium tracking-wide"
// // // // //                       : "text-[25px] font-semibold tracking-tight"  // 👈 CONTROL TOP SIZE HERE
// // // // //                   )}
// // // // //                 >
// // // // //                   PredictiX
// // // // //                 </div>

// // // // //                 {!scrolled && (
// // // // //                   <div className="text-sm font-medium text-muted-foreground">
// // // // //                     AI-Powered Asset Management
// // // // //                   </div>
// // // // //                 )}
// // // // //               </div>
// // // // //             </Link>


// // // // //             {/* Center nav */}
// // // // //             <nav
// // // // //               className={cn(
// // // // //                 "relative hidden md:flex items-center transition-all duration-300",
// // // // //                 !scrolled && "gap-9",
// // // // //                 scrolled && "gap-1 rounded-2xl bg-slate-100/80 p-1 dark:bg-slate-900/60"
// // // // //               )}
// // // // //             >
// // // // //               {NAV.map((item) => {
// // // // //                 const active = isActive(pathname, item.href);
// // // // //                 const Icon = item.icon;

// // // // //                 return (
// // // // //                   <Link
// // // // //                     key={item.href}
// // // // //                     href={item.href}
// // // // //                     className={cn(
// // // // //                       "group flex items-center gap-2 rounded-xl text-sm transition-all duration-200",
// // // // //                       "select-none",
// // // // //                       !scrolled
// // // // //                         ? [
// // // // //                             "px-2 py-2",
// // // // //                             "font-semibold",
// // // // //                             "text-slate-700/90 hover:text-slate-900",
// // // // //                             "dark:text-slate-200/90 dark:hover:text-white",
// // // // //                           ].join(" ")
// // // // //                         : [
// // // // //                             "px-3 py-1.5",
// // // // //                             "font-medium",
// // // // //                             "text-slate-600 hover:text-slate-900",
// // // // //                             "dark:text-slate-300 dark:hover:text-slate-50",
// // // // //                             "hover:bg-white/70 dark:hover:bg-slate-950/60",
// // // // //                           ].join(" "),
// // // // //                       active &&
// // // // //                         (scrolled
// // // // //                           ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/70 dark:bg-slate-950 dark:text-slate-50 dark:ring-slate-800/70"
// // // // //                           : "text-slate-900 dark:text-white")
// // // // //                     )}
// // // // //                   >
// // // // //                     <Icon className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-[1px]" />
// // // // //                     {item.label}
// // // // //                   </Link>
// // // // //                 );
// // // // //               })}
// // // // //             </nav>

// // // // //             {/* Right */}
// // // // //             <div className="relative flex items-center gap-3">
// // // // //               <ThemeToggle />

// // // // //               <div className="flex items-center gap-3">
// // // // //                 {!scrolled && (
// // // // //                   <div className="hidden sm:block text-right leading-tight">
// // // // //                     <div className="text-sm font-semibold tracking-tight">
// // // // //                       Dinusha Ekanayake
// // // // //                     </div>
// // // // //                     <div className="text-xs text-muted-foreground">Admin</div>
// // // // //                   </div>
// // // // //                 )}

// // // // //                 <div
// // // // //                   className={cn(
// // // // //                     "grid place-items-center rounded-full font-semibold text-white",
// // // // //                     "bg-gradient-to-br from-violet-600 to-indigo-600",
// // // // //                     "shadow-[0_10px_25px_-15px_rgba(99,102,241,0.9)]",
// // // // //                     "ring-1 ring-white/40 dark:ring-white/10",
// // // // //                     "transition-all duration-200",
// // // // //                     scrolled ? "h-9 w-9 text-sm" : "h-12 w-12 text-base"
// // // // //                   )}
// // // // //                 >
// // // // //                   D
// // // // //                 </div>
// // // // //               </div>
// // // // //             </div>
// // // // //           </div>
// // // // //         </div>
// // // // //       </header>

// // // // //       {/* Spacer so content doesn't jump under fixed navbar */}
// // // // //       <div className={cn(!scrolled ? "h-0" : "h-20")} />
// // // // //     </>
// // // // //   );
// // // // // }


// // // // // VERSION 2

// // // // "use client";

// // // // import * as React from "react";
// // // // import Link from "next/link";
// // // // import { usePathname } from "next/navigation";
// // // // import { LayoutDashboard, Ticket, Boxes, Warehouse, Users } from "lucide-react";

// // // // import PredictiXLogo from "@/components/brand/PredictiXLogo";
// // // // import ThemeToggle from "@/components/theme/ThemeToggle";
// // // // import { cn } from "@/lib/utils";

// // // // const NAV = [
// // // //   { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
// // // //   { href: "/admin/tickets", label: "Tickets", icon: Ticket },
// // // //   { href: "/admin/assets", label: "Assets", icon: Boxes },
// // // //   { href: "/admin/warehouse", label: "Warehouse", icon: Warehouse },
// // // //   { href: "/admin/users", label: "Users", icon: Users },
// // // // ] as const;

// // // // function isActive(pathname: string, href: string) {
// // // //   return pathname === href || pathname.startsWith(href + "/");
// // // // }

// // // // export default function AdminNavbar() {
// // // //   const pathname = usePathname() ?? "";
// // // //   const [scrolled, setScrolled] = React.useState(false);

// // // //   React.useEffect(() => {
// // // //     const onScroll = () => setScrolled(window.scrollY > 80);
// // // //     onScroll();
// // // //     window.addEventListener("scroll", onScroll, { passive: true });
// // // //     return () => window.removeEventListener("scroll", onScroll);
// // // //   }, []);

// // // //   return (
// // // //     <>
// // // //       <header
// // // //         className={cn(
// // // //           "z-50 w-full transition-all duration-300",
// // // //           // Top: attached
// // // //           !scrolled && "sticky top-0",
// // // //           // Scrolled: floating
// // // //           scrolled && "fixed left-0 top-4"
// // // //         )}
// // // //       >
// // // //         <div
// // // //           className={cn(
// // // //             "transition-all duration-300",
// // // //             !scrolled && "w-full",
// // // //             scrolled && "mx-auto max-w-7xl px-4"
// // // //           )}
// // // //         >
// // // //           <div
// // // //             className={cn(
// // // //               "relative flex items-center justify-between",
// // // //               "bg-white/80 backdrop-blur-xl dark:bg-slate-950/60",
// // // //               "transition-all duration-300 ease-out",
// // // //               !scrolled
// // // //                 ? [
// // // //                     // Attached bar
// // // //                     "h-16 px-4",
// // // //                     "border-b border-slate-200/70 dark:border-slate-800/70",
// // // //                     "shadow-[0_1px_0_rgba(15,23,42,0.04)] dark:shadow-[0_1px_0_rgba(255,255,255,0.04)]",
// // // //                     "rounded-none",
// // // //                   ].join(" ")
// // // //                 : [
// // // //                     // ✅ Floating bar is taller + roomier now
// // // //                     "h-16 px-6", // ⬅ increased from h-14/px-5
// // // //                     "rounded-3xl",
// // // //                     "border border-slate-200/60 dark:border-slate-800/60",
// // // //                     "shadow-[0_18px_45px_-18px_rgba(15,23,42,0.35)] dark:shadow-[0_18px_45px_-18px_rgba(0,0,0,0.60)]",
// // // //                     "ring-1 ring-white/35 dark:ring-white/10",
// // // //                   ].join(" ")
// // // //             )}
// // // //           >
// // // //             {/* subtle top glow (only when floating) */}
// // // //             {scrolled && (
// // // //               <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-b from-white/35 via-transparent to-transparent opacity-70 dark:from-white/10" />
// // // //             )}

// // // //             {/* Left: Logo + custom text (navbar-only) */}
// // // //             <Link href="/admin/dashboard" className="relative flex items-center gap-3">
// // // //               <PredictiXLogo size={scrolled ? 30 : 40} showText={false} />

// // // //               <div className="leading-tight">
// // // //                 <div
// // // //                   className={cn(
// // // //                     "transition-all duration-300",
// // // //                     scrolled
// // // //                       ? "text-[20px] font-semibold tracking-tight" // ⬅ slightly stronger for floating
// // // //                       : "text-[20px] font-semibold tracking-tight"
// // // //                   )}
// // // //                 >
// // // //                   PredictiX
// // // //                 </div>

// // // //                 {!scrolled && (
// // // //                   <div className="text-sm font-medium text-muted-foreground">
// // // //                     AI-Powered Asset Management
// // // //                   </div>
// // // //                 )}
// // // //               </div>
// // // //             </Link>

// // // //             {/* Center nav */}
// // // //             <nav
// // // //               className={cn(
// // // //                 "relative hidden md:flex items-center transition-all duration-300",
// // // //                 !scrolled && "gap-9",
// // // //                 scrolled && "gap-1 rounded-2xl bg-slate-100/80 p-1.5 dark:bg-slate-900/60" // ⬅ slightly more padding
// // // //               )}
// // // //             >
// // // //               {NAV.map((item) => {
// // // //                 const active = isActive(pathname, item.href);
// // // //                 const Icon = item.icon;

// // // //                 return (
// // // //                   <Link
// // // //                     key={item.href}
// // // //                     href={item.href}
// // // //                     className={cn(
// // // //                       "group flex items-center gap-2 rounded-xl transition-all duration-200 select-none",
// // // //                       !scrolled
// // // //                         ? [
// // // //                             "px-2 py-2",
// // // //                             "text-sm font-semibold",
// // // //                             "text-slate-700/90 hover:text-slate-900",
// // // //                             "dark:text-slate-200/90 dark:hover:text-white",
// // // //                           ].join(" ")
// // // //                         : [
// // // //                             // ✅ slightly taller pill buttons
// // // //                             "px-3.5 py-2",
// // // //                             "text-sm font-medium",
// // // //                             "text-slate-600 hover:text-slate-900",
// // // //                             "dark:text-slate-300 dark:hover:text-slate-50",
// // // //                             "hover:bg-white/70 dark:hover:bg-slate-950/60",
// // // //                           ].join(" "),
// // // //                       active &&
// // // //                         (scrolled
// // // //                           ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/70 dark:bg-slate-950 dark:text-slate-50 dark:ring-slate-800/70"
// // // //                           : "text-slate-900 dark:text-white")
// // // //                     )}
// // // //                   >
// // // //                     {/* ✅ icons slightly larger on floating */}
// // // //                     <Icon
// // // //                       className={cn(
// // // //                         "transition-transform duration-200 group-hover:-translate-y-[1px]",
// // // //                         scrolled ? "h-[18px] w-[18px]" : "h-4 w-4"
// // // //                       )}
// // // //                     />
// // // //                     {item.label}
// // // //                   </Link>
// // // //                 );
// // // //               })}
// // // //             </nav>

// // // //             {/* Right: theme + avatar */}
// // // //             <div className="relative flex items-center gap-3">
// // // //               <ThemeToggle />

// // // //               <div
// // // //                 className={cn(
// // // //                   "grid place-items-center rounded-full font-semibold text-white",
// // // //                   "bg-gradient-to-br from-violet-600 to-indigo-600",
// // // //                   "shadow-[0_10px_25px_-15px_rgba(99,102,241,0.9)]",
// // // //                   "ring-1 ring-white/40 dark:ring-white/10",
// // // //                   "transition-all duration-200",
// // // //                   scrolled ? "h-10 w-10 text-sm" : "h-12 w-12 text-base" // ⬅ slightly bigger when scrolled
// // // //                 )}
// // // //               >
// // // //                 D
// // // //               </div>
// // // //             </div>
// // // //           </div>
// // // //         </div>
// // // //       </header>

// // // //       {/* Spacer so content doesn't go under the floating navbar */}
// // // //       <div className={cn(!scrolled ? "h-0" : "h-24")} />
// // // //     </>
// // // //   );
// // // // }


// // // // VERSION 03


// // // "use client";

// // // import * as React from "react";
// // // import Link from "next/link";
// // // import { usePathname } from "next/navigation";
// // // import { LayoutDashboard, Ticket, Boxes, Warehouse, Users } from "lucide-react";

// // // import PredictiXLogo from "@/components/brand/PredictiXLogo";
// // // import ThemeToggle from "@/components/theme/ThemeToggle";
// // // import { cn } from "@/lib/utils";

// // // const NAV = [
// // //   { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
// // //   { href: "/admin/tickets", label: "Tickets", icon: Ticket },
// // //   { href: "/admin/assets", label: "Assets", icon: Boxes },
// // //   { href: "/admin/warehouse", label: "Warehouse", icon: Warehouse },
// // //   { href: "/admin/users", label: "Users", icon: Users },
// // // ] as const;

// // // function isActive(pathname: string, href: string) {
// // //   return pathname === href || pathname.startsWith(href + "/");
// // // }

// // // export default function AdminNavbar() {
// // //   const pathname = usePathname() ?? "";
// // //   const [scrolled, setScrolled] = React.useState(false);

// // //   React.useEffect(() => {
// // //     const onScroll = () => setScrolled(window.scrollY > 80);
// // //     onScroll();
// // //     window.addEventListener("scroll", onScroll, { passive: true });
// // //     return () => window.removeEventListener("scroll", onScroll);
// // //   }, []);

// // //   return (
// // //     <>
// // //       <header
// // //         className={cn(
// // //           "z-50 w-full transition-all duration-300",
// // //           !scrolled && "sticky top-0",
// // //           // ✅ top gap increased
// // //           scrolled && "fixed left-0 top-5"
// // //         )}
// // //       >
// // //         <div
// // //           className={cn(
// // //             "transition-all duration-300",
// // //             !scrolled && "w-full",
// // //             // ✅ floating bar width changed to max-w-6xl (and centered)
// // //             scrolled && "mx-auto max-w-6xl px-4"
// // //           )}
// // //         >
// // //           <div
// // //             className={cn(
// // //               "relative overflow-hidden",
// // //               "bg-white/80 backdrop-blur-xl dark:bg-slate-950/60",
// // //               "transition-all duration-300 ease-out",
// // //               !scrolled
// // //                 ? [
// // //                     "h-16",
// // //                     "border-b border-slate-200/70 dark:border-slate-800/70",
// // //                     "shadow-[0_1px_0_rgba(15,23,42,0.04)] dark:shadow-[0_1px_0_rgba(255,255,255,0.04)]",
// // //                     "rounded-none",
// // //                   ].join(" ")
// // //                 : [
// // //                     "h-16",
// // //                     "rounded-3xl",
// // //                     "border border-slate-200/60 dark:border-slate-800/60",
// // //                     "shadow-[0_18px_45px_-18px_rgba(15,23,42,0.35)] dark:shadow-[0_18px_45px_-18px_rgba(0,0,0,0.60)]",
// // //                     "ring-1 ring-white/35 dark:ring-white/10",
// // //                   ].join(" ")
// // //             )}
// // //           >
// // //             {/* subtle top glow (only when floating) */}
// // //             {scrolled && (
// // //               <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-b from-white/35 via-transparent to-transparent opacity-70 dark:from-white/10" />
// // //             )}

// // //             {/* ✅ Soft border glow in dark mode (floating only) */}
// // //             {scrolled && (
// // //               <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 dark:opacity-100">
// // //                 <div className="absolute inset-[-2px] rounded-[26px] bg-[radial-gradient(60%_60%_at_50%_0%,rgba(99,102,241,0.25),transparent_70%)]" />
// // //                 <div className="absolute inset-[-2px] rounded-[26px] bg-[radial-gradient(50%_50%_at_0%_50%,rgba(56,189,248,0.18),transparent_65%)]" />
// // //               </div>
// // //             )}

// // //             {/* ✅ True-centered layout: 3-column grid */}
// // //             <div
// // //               className={cn(
// // //                 "relative h-full",
// // //                 "grid items-center",
// // //                 // left / center / right columns
// // //                 "grid-cols-[1fr_auto_1fr]",
// // //                 !scrolled ? "px-4" : "px-6"
// // //               )}
// // //             >
// // //               {/* LEFT */}
// // //               <Link href="/admin/dashboard" className="flex items-center gap-3 justify-self-start">
// // //                 <PredictiXLogo size={scrolled ? 30 : 40} showText={false} />

// // //                 <div className="leading-tight">
// // //                   <div
// // //                     className={cn(
// // //                       "transition-all duration-300 font-semibold tracking-tight",
// // //                       scrolled ? "text-[16px]" : "text-[20px]"
// // //                     )}
// // //                   >
// // //                     PredictiX
// // //                   </div>

// // //                   {!scrolled && (
// // //                     <div className="text-sm font-medium text-muted-foreground">
// // //                       AI-Powered Asset Management
// // //                     </div>
// // //                   )}
// // //                 </div>
// // //               </Link>

// // //               {/* CENTER (perfectly centered now) */}
// // //               <nav
// // //                 className={cn(
// // //                   "justify-self-center hidden md:flex items-center transition-all duration-300",
// // //                   !scrolled && "gap-9",
// // //                   scrolled && "gap-1 rounded-2xl bg-slate-100/80 p-1.5 dark:bg-slate-900/60"
// // //                 )}
// // //               >
// // //                 {NAV.map((item) => {
// // //                   const active = isActive(pathname, item.href);
// // //                   const Icon = item.icon;

// // //                   return (
// // //                     <Link
// // //                       key={item.href}
// // //                       href={item.href}
// // //                       className={cn(
// // //                         "group flex items-center gap-2 rounded-xl transition-all duration-200 select-none",
// // //                         !scrolled
// // //                           ? [
// // //                               "px-2 py-2",
// // //                               "text-sm font-semibold",
// // //                               "text-slate-700/90 hover:text-slate-900",
// // //                               "dark:text-slate-200/90 dark:hover:text-white",
// // //                             ].join(" ")
// // //                           : [
// // //                               "px-3.5 py-2",
// // //                               "text-sm font-medium",
// // //                               "text-slate-600 hover:text-slate-900",
// // //                               "dark:text-slate-300 dark:hover:text-slate-50",
// // //                               "hover:bg-white/70 dark:hover:bg-slate-950/60",
// // //                             ].join(" "),
// // //                         active &&
// // //                           (scrolled
// // //                             ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/70 dark:bg-slate-950 dark:text-slate-50 dark:ring-slate-800/70"
// // //                             : "text-slate-900 dark:text-white")
// // //                       )}
// // //                     >
// // //                       <Icon
// // //                         className={cn(
// // //                           "transition-transform duration-200 group-hover:-translate-y-[1px]",
// // //                           scrolled ? "h-[18px] w-[18px]" : "h-4 w-4"
// // //                         )}
// // //                       />
// // //                       {item.label}
// // //                     </Link>
// // //                   );
// // //                 })}
// // //               </nav>

// // //               {/* RIGHT */}
// // //               <div className="flex items-center gap-3 justify-self-end">
// // //                 <ThemeToggle />

// // //                 <div
// // //                   className={cn(
// // //                     "grid place-items-center rounded-full font-semibold text-white",
// // //                     "bg-gradient-to-br from-violet-600 to-indigo-600",
// // //                     "shadow-[0_10px_25px_-15px_rgba(99,102,241,0.9)]",
// // //                     "ring-1 ring-white/40 dark:ring-white/10",
// // //                     "transition-all duration-200",
// // //                     scrolled ? "h-10 w-10 text-sm" : "h-12 w-12 text-base"
// // //                   )}
// // //                 >
// // //                   D
// // //                 </div>
// // //               </div>
// // //             </div>
// // //           </div>
// // //         </div>
// // //       </header>

// // //       {/* Spacer so content doesn't go under floating navbar */}
// // //       <div className={cn(!scrolled ? "h-0" : "h-24")} />
// // //     </>
// // //   );
// // // }

// // // VERSION 04:

// // "use client";

// // import * as React from "react";
// // import Link from "next/link";
// // import { usePathname } from "next/navigation";
// // import {
// //   LayoutDashboard,
// //   Ticket,
// //   Boxes,
// //   Warehouse,
// //   Users,
// //   Menu,
// // } from "lucide-react";

// // import PredictiXLogo from "@/components/brand/PredictiXLogo";
// // import ThemeToggle from "@/components/theme/ThemeToggle";
// // import { cn } from "@/lib/utils";
// // import { Button } from "@/components/ui/button";
// // import {
// //   Sheet,
// //   SheetContent,
// //   SheetHeader,
// //   SheetTitle,
// //   SheetTrigger,
// // } from "@/components/ui/sheet";

// // const NAV = [
// //   { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
// //   { href: "/admin/tickets", label: "Tickets", icon: Ticket },
// //   { href: "/admin/assets", label: "Assets", icon: Boxes },
// //   { href: "/admin/warehouse", label: "Warehouse", icon: Warehouse },
// //   { href: "/admin/users", label: "Users", icon: Users },
// // ] as const;

// // function isActive(pathname: string, href: string) {
// //   return pathname === href || pathname.startsWith(href + "/");
// // }

// // type UserRole = "ADMIN" | "USER";

// // type Props = {
// //   // You can pass real user data later from session/auth
// //   name?: string;
// //   role?: UserRole;
// //   initials?: string; // optional override
// // };

// // function getInitials(name: string) {
// //   const parts = name.trim().split(/\s+/).filter(Boolean);
// //   if (parts.length === 0) return "U";
// //   if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
// //   return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
// // }

// // export default function AdminNavbar({
// //   name = "Dinusha Ekanayake",
// //   role = "ADMIN",
// //   initials,
// // }: Props) {
// //   const pathname = usePathname() ?? "";
// //   const [scrolled, setScrolled] = React.useState(false);
// //   const [open, setOpen] = React.useState(false);

// //   const badgeText = role === "ADMIN" ? "Admin" : "User";
// //   const avatarText = initials ?? getInitials(name);

// //   React.useEffect(() => {
// //     const onScroll = () => setScrolled(window.scrollY > 80);
// //     onScroll();
// //     window.addEventListener("scroll", onScroll, { passive: true });
// //     return () => window.removeEventListener("scroll", onScroll);
// //   }, []);

// //   return (
// //     <>
// //       <header
// //         className={cn(
// //           "z-50 w-full transition-all duration-300",
// //           !scrolled && "sticky top-0",
// //           scrolled && "fixed left-0 top-5"
// //         )}
// //       >
// //         <div
// //           className={cn(
// //             "transition-all duration-300",
// //             !scrolled && "w-full",
// //             scrolled && "mx-auto max-w-6xl px-4"
// //           )}
// //         >
// //           <div
// //             className={cn(
// //               "relative overflow-hidden",
// //               "bg-white/80 backdrop-blur-xl dark:bg-slate-950/60",
// //               "transition-all duration-300 ease-out",
// //               !scrolled
// //                 ? [
// //                     "h-16",
// //                     "border-b border-slate-200/70 dark:border-slate-800/70",
// //                     "shadow-[0_1px_0_rgba(15,23,42,0.04)] dark:shadow-[0_1px_0_rgba(255,255,255,0.04)]",
// //                     "rounded-none",
// //                   ].join(" ")
// //                 : [
// //                     "h-16",
// //                     "rounded-3xl",
// //                     "border border-slate-200/60 dark:border-slate-800/60",
// //                     "shadow-[0_18px_45px_-18px_rgba(15,23,42,0.35)] dark:shadow-[0_18px_45px_-18px_rgba(0,0,0,0.60)]",
// //                     "ring-1 ring-white/35 dark:ring-white/10",
// //                   ].join(" ")
// //             )}
// //           >
// //             {/* top glow when floating */}
// //             {scrolled && (
// //               <div className="pointer-events-none absolute inset-0 rounded-3xl bg-linear-to-brom-white/35 via-transparent to-transparent opacity-70 dark:from-white/10" />
// //             )}

// //             {/* soft border glow in dark mode (floating) */}
// //             {scrolled && (
// //               <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 dark:opacity-100">
// //                 <div className="absolute -inset-0.5ounded-[26px] bg-[radial-gradient(60%_60%_at_50%_0%,rgba(99,102,241,0.25),transparent_70%)]" />
// //                 <div className="absolute -inset-0.5 rounded-[26px] bg-[radial-gradient(50%_50%_at_0%_50%,rgba(56,189,248,0.18),transparent_65%)]" />
// //               </div>
// //             )}

// //             {/* 3-column grid for true centering */}
// //             <div
// //               className={cn(
// //                 "relative h-full",
// //                 "grid items-center",
// //                 "grid-cols-[1fr_auto_1fr]",
// //                 !scrolled ? "px-4" : "px-6"
// //               )}
// //             >
// //               {/* LEFT: Brand */}
// //               <Link href="/admin/dashboard" className="flex items-center gap-3 justify-self-start">
// //                 <PredictiXLogo size={scrolled ? 30 : 40} showText={false} />
// //                 <div className="leading-tight">
// //                   <div
// //                     className={cn(
// //                       "transition-all duration-300 font-semibold tracking-tight",
// //                       scrolled ? "text-[16px]" : "text-[20px]"
// //                     )}
// //                   >
// //                     PredictiX
// //                   </div>
// //                   {!scrolled && (
// //                     <div className="hidden sm:block text-sm font-medium text-muted-foreground">
// //                       AI-Powered Asset Management
// //                     </div>
// //                   )}
// //                 </div>
// //               </Link>

// //               {/* CENTER: Desktop nav */}
// //               <nav
// //                 className={cn(
// //                   "justify-self-center hidden md:flex items-center transition-all duration-300",
// //                   !scrolled && "gap-9",
// //                   scrolled && "gap-1 rounded-2xl bg-slate-100/80 p-1.5 dark:bg-slate-900/60"
// //                 )}
// //               >
// //                 {NAV.map((item) => {
// //                   const active = isActive(pathname, item.href);
// //                   const Icon = item.icon;

// //                   return (
// //                     <Link
// //                       key={item.href}
// //                       href={item.href}
// //                       className={cn(
// //                         "group flex items-center gap-2 rounded-xl transition-all duration-200 select-none",
// //                         !scrolled
// //                           ? [
// //                               "px-2 py-2",
// //                               "text-sm font-semibold",
// //                               "text-slate-700/90 hover:text-slate-900",
// //                               "dark:text-slate-200/90 dark:hover:text-white",
// //                             ].join(" ")
// //                           : [
// //                               "px-3.5 py-2",
// //                               "text-sm font-medium",
// //                               "text-slate-600 hover:text-slate-900",
// //                               "dark:text-slate-300 dark:hover:text-slate-50",
// //                               "hover:bg-white/70 dark:hover:bg-slate-950/60",
// //                             ].join(" "),
// //                         active &&
// //                           (scrolled
// //                             ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/70 dark:bg-slate-950 dark:text-slate-50 dark:ring-slate-800/70"
// //                             : "text-slate-900 dark:text-white")
// //                       )}
// //                     >
// //                       <Icon
// //                         className={cn(
// //                           "transition-transform duration-200 group-hover:-translate-y-px",
// //                           scrolled ? "h-4.5 w-4.5" : "h-4 w-4"
// //                         )}
// //                       />
// //                       {item.label}
// //                     </Link>
// //                   );
// //                 })}
// //               </nav>

// //               {/* RIGHT: Theme + user chip + mobile menu */}
// //               <div className="flex items-center gap-2 justify-self-end">
// //                 <ThemeToggle />

// //                 {/* User info chip (responsive) */}
// //                 {/* User info (clean, no rectangle) */}
// //                 <div className="hidden sm:flex items-center gap-3">
// //                   <div className="text-right leading-tight">
// //                     <div className="text-sm font-semibold tracking-tight">
// //                       {name}
// //                     </div>
// //                     <div className="text-xs text-muted-foreground">
// //                       {badgeText}
// //                     </div>
// //                   </div>

// //                   <div
// //                     className={cn(
// //                       "grid place-items-center rounded-full font-semibold text-white",
// //                       "bg-linear-to-br from-violet-600 to-indigo-600",
// //                       "shadow-[0_10px_25px_-15px_rgba(99,102,241,0.9)]",
// //                       "ring-1 ring-white/40 dark:ring-white/10",
// //                       "h-10 w-10 text-sm transition-transform duration-200 hover:scale-105"
// //                     )}
// //                   >
// //                     {avatarText}
// //                   </div>
// //                 </div>


// //                 {/* Compact avatar on xs */}
// //                 <div
// //                   className={cn(
// //                     "sm:hidden grid place-items-center rounded-full font-semibold text-white",
// //                     "bg-linear-to-brrom-violet-600 to-indigo-600",
// //                     "shadow-[0_10px_25px_-15px_rgba(99,102,241,0.9)]",
// //                     "ring-1 ring-white/40 dark:ring-white/10",
// //                     "h-10 w-10 text-sm"
// //                   )}
// //                   title={`${name} • ${badgeText}`}
// //                 >
// //                   {avatarText}
// //                 </div>

// //                 {/* Mobile menu (md and below) */}
// //                 <div className="md:hidden">
// //                   <Sheet open={open} onOpenChange={setOpen}>
// //                     <SheetTrigger asChild>
// //                       <Button variant="outline" size="icon" className="rounded-2xl">
// //                         <Menu className="h-5 w-5" />
// //                       </Button>
// //                     </SheetTrigger>

// //                     <SheetContent side="right" className="w-[320px] sm:w-90">
// //                       <SheetHeader>
// //                         <SheetTitle className="flex items-center gap-3">
// //                           <PredictiXLogo size={32} showText={false} />
// //                           <span className="font-semibold tracking-tight">PredictiX</span>
// //                         </SheetTitle>
// //                       </SheetHeader>

// //                       <div className="mt-5 rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
// //                         <div className="flex items-center justify-between gap-3">
// //                           <div className="leading-tight">
// //                             <div className="text-sm font-semibold">{name}</div>
// //                             <div className="text-xs text-muted-foreground">{badgeText}</div>
// //                           </div>

// //                           <div
// //                             className={cn(
// //                               "grid place-items-center rounded-full font-semibold text-white",
// //                               "bg-linear-to-br from-violet-600 to-indigo-600",
// //                               "ring-1 ring-white/40 dark:ring-white/10",
// //                               "h-10 w-10 text-sm"
// //                             )}
// //                           >
// //                             {avatarText}
// //                           </div>
// //                         </div>
// //                       </div>

// //                       <nav className="mt-6 flex flex-col gap-2">
// //                         {NAV.map((item) => {
// //                           const active = isActive(pathname, item.href);
// //                           const Icon = item.icon;

// //                           return (
// //                             <Link
// //                               key={item.href}
// //                               href={item.href}
// //                               onClick={() => setOpen(false)}
// //                               className={cn(
// //                                 "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition",
// //                                 "hover:bg-slate-100 dark:hover:bg-slate-900/60",
// //                                 active &&
// //                                   "bg-slate-100 ring-1 ring-slate-200 dark:bg-slate-900/60 dark:ring-slate-800"
// //                               )}
// //                             >
// //                               <Icon className="h-5 w-5" />
// //                               {item.label}
// //                             </Link>
// //                           );
// //                         })}
// //                       </nav>
// //                     </SheetContent>
// //                   </Sheet>
// //                 </div>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </header>

// //       {/* Spacer for floating bar */}
// //       <div className={cn(!scrolled ? "h-0" : "h-24")} />
// //     </>
// //   );
// // }


// // VERSION 05

// "use client";

// import * as React from "react";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import {
//   LayoutDashboard,
//   Ticket,
//   Boxes,
//   Warehouse,
//   Users,
//   Menu,
// } from "lucide-react";

// import PredictiXLogo from "@/components/brand/PredictiXLogo";
// import ThemeToggle from "@/components/theme/ThemeToggle";
// import { cn } from "@/lib/utils";
// import { Button } from "@/components/ui/button";
// import {
//   Sheet,
//   SheetContent,
//   SheetHeader,
//   SheetTitle,
//   SheetTrigger,
// } from "@/components/ui/sheet";

// const NAV = [
//   { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
//   { href: "/admin/tickets", label: "Tickets", icon: Ticket },
//   { href: "/admin/assets", label: "Assets", icon: Boxes },
//   { href: "/admin/warehouse", label: "Warehouse", icon: Warehouse },
//   { href: "/admin/users", label: "Users", icon: Users },
// ] as const;

// function isActive(pathname: string, href: string) {
//   return pathname === href || pathname.startsWith(href + "/");
// }

// type UserRole = "ADMIN" | "USER";

// type Props = {
//   name?: string;
//   role?: UserRole;
//   initials?: string;
// };

// function getInitials(name: string) {
//   const parts = name.trim().split(/\s+/).filter(Boolean);
//   if (parts.length === 0) return "U";
//   if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
//   return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
// }

// export default function AdminNavbar({
//   name = "Dinusha Ekanayake",
//   role = "ADMIN",
//   initials,
// }: Props) {
//   const pathname = usePathname() ?? "";
//   const [scrolled, setScrolled] = React.useState(false);
//   const [open, setOpen] = React.useState(false);

//   const badgeText = role === "ADMIN" ? "Admin" : "User";
//   const avatarText = initials ?? getInitials(name);

//   React.useEffect(() => {
//     const onScroll = () => setScrolled(window.scrollY > 80);
//     onScroll();
//     window.addEventListener("scroll", onScroll, { passive: true });
//     return () => window.removeEventListener("scroll", onScroll);
//   }, []);

//   return (
//     <>
//       <header
//         className={cn(
//           "z-50 w-full transition-all duration-300",
//           !scrolled && "sticky top-0",
//           scrolled && "fixed left-0 top-5"
//         )}
//       >
//         <div
//           className={cn(
//             "transition-all duration-300",
//             !scrolled && "w-full",
//             scrolled && "mx-auto max-w-6xl px-4"
//           )}
//         >
//           <div
//             className={cn(
//               "relative overflow-hidden",
//               "bg-white/80 backdrop-blur-xl dark:bg-slate-950/60",
//               "transition-all duration-300 ease-out",
//               !scrolled
//                 ? [
//                     "h-16",
//                     "border-b border-slate-200/70 dark:border-slate-800/70",
//                     "shadow-[0_1px_0_rgba(15,23,42,0.04)] dark:shadow-[0_1px_0_rgba(255,255,255,0.04)]",
//                     "rounded-none",
//                   ].join(" ")
//                 : [
//                     "h-16",
//                     "rounded-3xl",
//                     "border border-slate-200/60 dark:border-slate-800/60",
//                     "shadow-[0_18px_45px_-18px_rgba(15,23,42,0.35)] dark:shadow-[0_18px_45px_-18px_rgba(0,0,0,0.60)]",
//                     "ring-1 ring-white/35 dark:ring-white/10",
//                   ].join(" ")
//             )}
//           >
//             {/* top glow when floating */}
//             {scrolled && (
//               <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-b from-white/35 via-transparent to-transparent opacity-70 dark:from-white/10" />
//             )}

//             {/* soft border glow in dark mode (floating) */}
//             {scrolled && (
//               <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 dark:opacity-100">
//                 <div className="absolute -inset-0.5 rounded-[26px] bg-[radial-gradient(60%_60%_at_50%_0%,rgba(99,102,241,0.25),transparent_70%)]" />
//                 <div className="absolute -inset-0.5 rounded-[26px] bg-[radial-gradient(50%_50%_at_0%_50%,rgba(56,189,248,0.18),transparent_65%)]" />
//               </div>
//             )}

//             {/* 3-column grid for true centering */}
//             <div
//               className={cn(
//                 "relative h-full",
//                 "grid items-center",
//                 "grid-cols-[1fr_auto_1fr]",
//                 !scrolled ? "px-4" : "px-6"
//               )}
//             >
//               {/* LEFT: Brand */}
//               <Link
//                 href="/admin/dashboard"
//                 className="flex items-center gap-3 justify-self-start"
//               >
//                 <PredictiXLogo size={scrolled ? 30 : 40} showText={false} />
//                 <div className="leading-tight">
//                   <div
//                     className={cn(
//                       "transition-all duration-300 font-semibold tracking-tight",
//                       scrolled ? "text-[16px]" : "text-[20px]"
//                     )}
//                   >
//                     PredictiX
//                   </div>
//                   {!scrolled && (
//                     <div className="hidden sm:block text-sm font-medium text-muted-foreground">
//                       AI-Powered Asset Management
//                     </div>
//                   )}
//                 </div>
//               </Link>

//               {/* CENTER: Desktop nav */}
//               <nav
//                 className={cn(
//                   "justify-self-center hidden md:flex items-center transition-all duration-300",
//                   !scrolled && "gap-9",
//                   scrolled &&
//                     "gap-1 rounded-2xl bg-slate-100/80 p-1.5 dark:bg-slate-900/60"
//                 )}
//               >
//                 {NAV.map((item) => {
//                   const active = isActive(pathname, item.href);
//                   const Icon = item.icon;

//                   return (
//                     <Link
//                       key={item.href}
//                       href={item.href}
//                       className={cn(
//                         "group flex items-center gap-2 rounded-xl transition-all duration-200 select-none",
//                         !scrolled
//                           ? [
//                               "px-2 py-2",
//                               "text-sm font-semibold",
//                               "text-slate-700/90 hover:text-slate-900",
//                               "dark:text-slate-200/90 dark:hover:text-white",
//                             ].join(" ")
//                           : [
//                               "px-3.5 py-2",
//                               "text-sm font-medium",
//                               "text-slate-600 hover:text-slate-900",
//                               "dark:text-slate-300 dark:hover:text-slate-50",
//                               "hover:bg-white/70 dark:hover:bg-slate-950/60",
//                             ].join(" "),
//                         active &&
//                           (scrolled
//                             ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/70 dark:bg-slate-950 dark:text-slate-50 dark:ring-slate-800/70"
//                             : "text-slate-900 dark:text-white")
//                       )}
//                     >
//                       <Icon
//                         className={cn(
//                           "transition-transform duration-200 group-hover:-translate-y-px",
//                           scrolled ? "h-[18px] w-[18px]" : "h-4 w-4"
//                         )}
//                       />
//                       {item.label}
//                     </Link>
//                   );
//                 })}
//               </nav>

//               {/* RIGHT: Theme + user chip + mobile menu */}
//               <div className="flex items-center gap-2 justify-self-end">
//                 <ThemeToggle />

//                 {/* User info (sm+) */}
//                 <div className="hidden sm:flex items-center gap-3">
//                   <div className="text-right leading-tight">
//                     <div className="text-sm font-semibold tracking-tight">
//                       {name}
//                     </div>
//                     <div className="text-xs text-muted-foreground">
//                       {badgeText}
//                     </div>
//                   </div>

//                   <div
//                     className={cn(
//                       "grid place-items-center rounded-full font-semibold text-white",
//                       "bg-gradient-to-br from-violet-600 to-indigo-600",
//                       "shadow-[0_10px_25px_-15px_rgba(99,102,241,0.9)]",
//                       "ring-1 ring-white/40 dark:ring-white/10",
//                       "h-10 w-10 text-sm transition-transform duration-200 hover:scale-105"
//                     )}
//                   >
//                     {avatarText}
//                   </div>
//                 </div>

//                 {/* Compact avatar on xs */}
//                 <div
//                   className={cn(
//                     "sm:hidden grid place-items-center rounded-full font-semibold text-white",
//                     "bg-gradient-to-br from-violet-600 to-indigo-600",
//                     "shadow-[0_10px_25px_-15px_rgba(99,102,241,0.9)]",
//                     "ring-1 ring-white/40 dark:ring-white/10",
//                     "h-10 w-10 text-sm"
//                   )}
//                   title={`${name} • ${badgeText}`}
//                 >
//                   {avatarText}
//                 </div>

//                 {/* Mobile menu (md and below) */}
//                 <div className="md:hidden">
//                   <Sheet open={open} onOpenChange={setOpen}>
//                     <SheetTrigger asChild>
//                       <Button variant="outline" size="icon" className="rounded-2xl">
//                         <Menu className="h-5 w-5" />
//                       </Button>
//                     </SheetTrigger>

//                     <SheetContent side="right" className="w-[320px] sm:w-[360px]">
//                       <SheetHeader>
//                         <SheetTitle className="flex items-center gap-3">
//                           <PredictiXLogo size={32} showText={false} />
//                           <span className="font-semibold tracking-tight">
//                             PredictiX
//                           </span>
//                         </SheetTitle>
//                       </SheetHeader>

//                       <div className="mt-5 rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
//                         <div className="flex items-center justify-between gap-3">
//                           <div className="leading-tight">
//                             <div className="text-sm font-semibold">{name}</div>
//                             <div className="text-xs text-muted-foreground">
//                               {badgeText}
//                             </div>
//                           </div>

//                           <div
//                             className={cn(
//                               "grid place-items-center rounded-full font-semibold text-white",
//                               "bg-gradient-to-br from-violet-600 to-indigo-600",
//                               "ring-1 ring-white/40 dark:ring-white/10",
//                               "h-10 w-10 text-sm"
//                             )}
//                           >
//                             {avatarText}
//                           </div>
//                         </div>
//                       </div>

//                       <nav className="mt-6 flex flex-col gap-2">
//                         {NAV.map((item) => {
//                           const active = isActive(pathname, item.href);
//                           const Icon = item.icon;

//                           return (
//                             <Link
//                               key={item.href}
//                               href={item.href}
//                               onClick={() => setOpen(false)}
//                               className={cn(
//                                 "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition",
//                                 "hover:bg-slate-100 dark:hover:bg-slate-900/60",
//                                 active &&
//                                   "bg-slate-100 ring-1 ring-slate-200 dark:bg-slate-900/60 dark:ring-slate-800"
//                               )}
//                             >
//                               <Icon className="h-5 w-5" />
//                               {item.label}
//                             </Link>
//                           );
//                         })}
//                       </nav>
//                     </SheetContent>
//                   </Sheet>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Spacer for floating bar */}
//       <div className={cn(!scrolled ? "h-0" : "h-24")} />
//     </>
//   );
// }


// VERSION 06

"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Ticket,
  Boxes,
  Warehouse,
  Users,
  Menu,
} from "lucide-react";

import PredictiXLogo from "@/components/brand/PredictiXLogo";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/tickets", label: "Tickets", icon: Ticket },
  { href: "/admin/assets", label: "Assets", icon: Boxes },
  { href: "/admin/warehouse", label: "Warehouse", icon: Warehouse },
  { href: "/admin/users", label: "Users", icon: Users },
] as const;

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

type UserRole = "ADMIN" | "USER";

type Props = {
  name?: string;
  role?: UserRole;
  initials?: string;
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function AdminNavbar({
  name = "Dinusha Ekanayake",
  role = "ADMIN",
  initials,
}: Props) {
  const pathname = usePathname() ?? "";
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const badgeText = role === "ADMIN" ? "Admin" : "User";
  const avatarText = initials ?? getInitials(name);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "z-50 w-full transition-all duration-300",
          !scrolled ? "sticky top-0" : "fixed left-0 top-5"
        )}
      >
        <div
          className={cn(
            "transition-all duration-300",
            !scrolled ? "w-full" : "mx-auto max-w-6xl px-4"
          )}
        >
          <div
            className={cn(
              "relative overflow-hidden",
              "bg-white/80 backdrop-blur-xl dark:bg-slate-950/60",
              "transition-all duration-300 ease-out",
              !scrolled
                ? [
                    "h-16",
                    "border-b border-slate-200/70 dark:border-slate-800/70",
                    "shadow-[0_1px_0_rgba(15,23,42,0.04)] dark:shadow-[0_1px_0_rgba(255,255,255,0.04)]",
                    "rounded-none",
                  ].join(" ")
                : [
                    "h-16",
                    "rounded-3xl",
                    "border border-slate-200/60 dark:border-slate-800/60",
                    "shadow-[0_18px_45px_-18px_rgba(15,23,42,0.35)] dark:shadow-[0_18px_45px_-18px_rgba(0,0,0,0.60)]",
                    "ring-1 ring-white/35 dark:ring-white/10",
                  ].join(" ")
            )}
          >
            {/* Top glow when floating */}
            {scrolled && (
              <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-b from-white/35 via-transparent to-transparent opacity-70 dark:from-white/10" />
            )}

            {/* Soft border glow in dark mode (floating) */}
            {scrolled && (
              <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 dark:opacity-100">
                <div className="absolute -inset-0.5 rounded-[26px] bg-[radial-gradient(60%_60%_at_50%_0%,rgba(99,102,241,0.25),transparent_70%)]" />
                <div className="absolute -inset-0.5 rounded-[26px] bg-[radial-gradient(50%_50%_at_0%_50%,rgba(56,189,248,0.18),transparent_65%)]" />
              </div>
            )}

            {/* Layout: left / center / right */}
            <div
              className={cn(
                "relative h-full",
                "grid grid-cols-[1fr_auto_1fr] items-center",
                !scrolled ? "px-4" : "px-6"
              )}
            >
              {/* LEFT */}
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-3 justify-self-start"
              >
                <PredictiXLogo size={scrolled ? 30 : 40} showText={false} />
                <div className="leading-[1.05]">
                  <div
                    className={cn(
                      "font-semibold tracking-tight",
                      scrolled ? "text-[16px]" : "text-[20px]"
                    )}
                  >
                    PredictiX
                  </div>
                  {!scrolled && (
                    <div className="hidden sm:block text-sm font-medium text-muted-foreground">
                      AI-Powered Asset Management
                    </div>
                  )}
                </div>
              </Link>

              {/* CENTER */}
              <nav
                className={cn(
                  "justify-self-center hidden md:flex items-center",
                  !scrolled ? "gap-9" : "gap-1 rounded-2xl bg-slate-100/80 p-1.5 dark:bg-slate-900/60"
                )}
              >
                {NAV.map((item) => {
                  const active = isActive(pathname, item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 rounded-xl select-none",
                        "transition-all duration-200",
                        !scrolled
                          ? "px-2 py-2 text-sm font-semibold text-slate-700/90 hover:text-slate-900 dark:text-slate-200/90 dark:hover:text-white"
                          : "px-3.5 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-50 hover:bg-white/70 dark:hover:bg-slate-950/60",
                        active &&
                          (scrolled
                            ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/70 dark:bg-slate-950 dark:text-slate-50 dark:ring-slate-800/70"
                            : "text-slate-900 dark:text-white")
                      )}
                    >
                      <Icon className="h-4 w-4 -translate-y-px" />
                      <span className="leading-none">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* RIGHT */}
              <div className="flex items-center gap-3 justify-self-end">
                {/* Theme icon: keep perfectly centered with name/avatar */}
                <ThemeToggle className="-translate-y-px" size={20} />

                {/* User (sm+) */}
                <div className="hidden sm:flex items-center gap-3">
                  <div className="text-right leading-[1.05]">
                    <div className="text-sm font-semibold tracking-tight">
                      {name}
                    </div>
                    <div className="text-xs text-muted-foreground">{badgeText}</div>
                  </div>

                  <div
                    className={cn(
                      "grid place-items-center rounded-full font-semibold text-white",
                      "bg-gradient-to-br from-violet-600 to-indigo-600",
                      "shadow-[0_10px_25px_-15px_rgba(99,102,241,0.9)]",
                      "ring-1 ring-white/40 dark:ring-white/10",
                      "h-10 w-10 text-sm"
                    )}
                  >
                    {avatarText}
                  </div>
                </div>

                {/* Compact avatar (xs) */}
                <div
                  className={cn(
                    "sm:hidden grid place-items-center rounded-full font-semibold text-white",
                    "bg-gradient-to-br from-violet-600 to-indigo-600",
                    "shadow-[0_10px_25px_-15px_rgba(99,102,241,0.9)]",
                    "ring-1 ring-white/40 dark:ring-white/10",
                    "h-10 w-10 text-sm"
                  )}
                  title={`${name} • ${badgeText}`}
                >
                  {avatarText}
                </div>

                {/* Mobile menu */}
                <div className="md:hidden">
                  <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="icon" className="rounded-2xl">
                        <Menu className="h-5 w-5" />
                      </Button>
                    </SheetTrigger>

                    <SheetContent side="right" className="w-[320px] sm:w-[360px]">
                      <SheetHeader>
                        <SheetTitle className="flex items-center gap-3">
                          <PredictiXLogo size={32} showText={false} />
                          <span className="font-semibold tracking-tight">
                            PredictiX
                          </span>
                        </SheetTitle>
                      </SheetHeader>

                      <div className="mt-5 rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
                        <div className="flex items-center justify-between gap-3">
                          <div className="leading-tight">
                            <div className="text-sm font-semibold">{name}</div>
                            <div className="text-xs text-muted-foreground">{badgeText}</div>
                          </div>

                          <div
                            className={cn(
                              "grid place-items-center rounded-full font-semibold text-white",
                              "bg-gradient-to-br from-violet-600 to-indigo-600",
                              "ring-1 ring-white/40 dark:ring-white/10",
                              "h-10 w-10 text-sm"
                            )}
                          >
                            {avatarText}
                          </div>
                        </div>
                      </div>

                      <nav className="mt-6 flex flex-col gap-2">
                        {NAV.map((item) => {
                          const active = isActive(pathname, item.href);
                          const Icon = item.icon;

                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setOpen(false)}
                              className={cn(
                                "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition",
                                "hover:bg-slate-100 dark:hover:bg-slate-900/60",
                                active &&
                                  "bg-slate-100 ring-1 ring-slate-200 dark:bg-slate-900/60 dark:ring-slate-800"
                              )}
                            >
                              <Icon className="h-5 w-5" />
                              {item.label}
                            </Link>
                          );
                        })}
                      </nav>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer for floating bar */}
      <div className={cn(!scrolled ? "h-0" : "h-24")} />
    </>
  );
}
