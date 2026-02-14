"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/theme/ThemeToggle";
import {
  LayoutGrid,
  Ticket,
  Box,
  Warehouse,
  Users,
  type LucideIcon,
} from "lucide-react";

/**
 * Unified admin header.
 *
 * At rest  → full purple-gradient bar with logo, nav links, user info.
 * Scrolled → compact centered floating white pill with just the nav items.
 *
 * Uses a smooth morph-like transition powered by CSS transitions
 * on scale, opacity, blur, and translate.
 *
 * TODO: Replace hardcoded user with auth context when backend is ready.
 */

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutGrid },
  { label: "Assets", href: "/admin/assets-insights", icon: Box },
  { label: "Warehouse", href: "/admin/warehouse-insights", icon: Warehouse },
  { label: "Tickets", href: "/admin/tickets", icon: Ticket },
  { label: "Users", href: "/admin/users", icon: Users },
];

const SCROLL_THRESHOLD = 60;

export default function AdminHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > SCROLL_THRESHOLD);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="sticky top-0 z-40 w-full">
      {/* Gradient backdrop — fades out when scrolled */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-r from-[#1a0e3e] via-[#2d1566] to-[#1e1050] transition-opacity duration-500 ease-in-out",
          scrolled ? "opacity-0" : "opacity-100"
        )}
      />

      <div className="relative">
        {/* ── Full header bar ── */}
        <header
          className={cn(
            "origin-top transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
            scrolled
              ? "pointer-events-none h-0 scale-y-0 opacity-0"
              : "h-16 scale-y-100 opacity-100"
          )}
        >
          <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-8 px-4 sm:px-6 lg:px-8">
            {/* Logo */}
            <Link
              href="/admin/dashboard"
              className={cn(
                "flex shrink-0 items-center gap-2.5 transition-all duration-500",
                scrolled ? "translate-x-4 opacity-0 blur-sm" : "translate-x-0 opacity-100 blur-0"
              )}
            >
              <Image
                src="/logo/predictix-icon.svg"
                alt="PredictiX"
                width={32}
                height={32}
                priority
              />
              <span className="text-[15px] font-bold tracking-tight text-white">
                PredictiX
              </span>
            </Link>

            {/* Nav links */}
            <nav className="scrollbar-none flex items-center gap-1 overflow-x-auto">
              {NAV_ITEMS.map((item, i) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{ transitionDelay: scrolled ? `${i * 30}ms` : `${(NAV_ITEMS.length - i) * 30}ms` }}
                    className={cn(
                      "inline-flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-400",
                      isActive
                        ? "bg-white/15 text-white"
                        : "text-white/70 hover:bg-white/10 hover:text-white",
                      scrolled ? "-translate-y-1 opacity-0 blur-sm" : "translate-y-0 opacity-100 blur-0"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right: theme toggle + user */}
            <div
              className={cn(
                "ml-auto flex items-center gap-4 transition-all duration-500",
                scrolled ? "-translate-x-4 opacity-0 blur-sm" : "translate-x-0 opacity-100 blur-0"
              )}
            >
              <ThemeToggle />
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 ring-2 ring-white/30">
                  <span className="text-sm font-semibold text-white">DE</span>
                </div>
                <div className="hidden leading-tight sm:block">
                  <p className="text-sm font-medium text-white">Dinusha Ekanayake</p>
                  <p className="text-[11px] text-white/60">Admin</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ── Compact floating nav pill ── */}
        <div
          className={cn(
            "flex justify-center transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
            scrolled
              ? "translate-y-0 py-3 opacity-100"
              : "pointer-events-none h-0 -translate-y-3 opacity-0 py-0"
          )}
        >
          <nav
            className={cn(
              "flex items-center gap-1 rounded-full border border-border/60 bg-background px-2 py-1.5 shadow-lg shadow-black/8 backdrop-blur-sm transition-all duration-500",
              scrolled ? "scale-100 blur-0" : "scale-90 blur-sm"
            )}
          >
            {NAV_ITEMS.map((item, i) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{ transitionDelay: scrolled ? `${150 + i * 40}ms` : "0ms" }}
                  className={cn(
                    "inline-flex shrink-0 items-center rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300",
                    isActive
                      ? "border border-border bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    scrolled ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
