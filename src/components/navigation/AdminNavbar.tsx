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
import AdminProfileDialog, {
  type AdminProfile,
} from "@/components/navigation/AdminProfileDialog";

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
  email?: string;
  assignedWarehouse?: string;
  department?: string;
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
  email = "admin@mail.com",
  assignedWarehouse = "Main Warehouse",
  department = "Operations",
}: Props) {
  const pathname = usePathname() ?? "";
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);

  const badgeText = role === "ADMIN" ? "Admin" : "User";
  const avatarText = initials ?? getInitials(name);

  const adminProfile: AdminProfile = {
    name,
    email,
    role,
    department,
    assignedWarehouse,
  };

  function handleProfileClick() {
    setProfileOpen(true);
  }

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
              <div className="pointer-events-none absolute inset-0 rounded-3xl bg-linear-to-b from-white/35 via-transparent to-transparent opacity-70 dark:from-white/10" />
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

                {/* User (sm+) - clickable profile */}
                <button
                  type="button"
                  onClick={handleProfileClick}
                  className="hidden sm:flex items-center gap-3 rounded-xl px-1 py-1 -mr-1 hover:bg-slate-100/70 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                >
                  <div className="text-right leading-[1.05]">
                    <div className="text-sm font-semibold tracking-tight">
                      {name}
                    </div>
                    <div className="text-xs text-muted-foreground">{badgeText}</div>
                  </div>

                  <div
                    className={cn(
                      "grid place-items-center rounded-full font-semibold text-white",
                      "bg-linear-to-br from-violet-600 to-indigo-600",
                      "shadow-[0_10px_25px_-15px_rgba(99,102,241,0.9)]",
                      "ring-1 ring-white/40 dark:ring-white/10",
                      "h-10 w-10 text-sm transition-transform hover:scale-105"
                    )}
                  >
                    {avatarText}
                  </div>
                </button>

                {/* Compact avatar (xs) - clickable profile */}
                <button
                  type="button"
                  onClick={handleProfileClick}
                  className={cn(
                    "sm:hidden grid place-items-center rounded-full font-semibold text-white",
                    "bg-linear-to-br from-violet-600 to-indigo-600",
                    "shadow-[0_10px_25px_-15px_rgba(99,102,241,0.9)]",
                    "ring-1 ring-white/40 dark:ring-white/10",
                    "h-10 w-10 text-sm transition-transform hover:scale-105 cursor-pointer"
                  )}
                  title={`${name} • ${badgeText} (click for details)`}
                >
                  {avatarText}
                </button>

                {/* Mobile menu */}
                <div className="md:hidden">
                  <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="icon" className="rounded-2xl">
                        <Menu className="h-5 w-5" />
                      </Button>
                    </SheetTrigger>

                    <SheetContent side="right" className="w-[320px] sm:w-90">
                      <SheetHeader>
                        <SheetTitle className="flex items-center gap-3">
                          <PredictiXLogo size={32} showText={false} />
                          <span className="font-semibold tracking-tight">
                            PredictiX
                          </span>
                        </SheetTitle>
                      </SheetHeader>

                      <button
                        type="button"
                        onClick={() => {
                          setOpen(false);
                          setProfileOpen(true);
                        }}
                        className="mt-5 w-full rounded-2xl border border-slate-200 p-3 dark:border-slate-800 text-left hover:bg-slate-100/70 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="leading-tight">
                            <div className="text-sm font-semibold">{name}</div>
                            <div className="text-xs text-muted-foreground">{badgeText}</div>
                          </div>

                          <div
                            className={cn(
                              "grid place-items-center rounded-full font-semibold text-white",
                              "bg-linear-to-br from-violet-600 to-indigo-600",
                              "ring-1 ring-white/40 dark:ring-white/10",
                              "h-10 w-10 text-sm"
                            )}
                          >
                            {avatarText}
                          </div>
                        </div>
                      </button>

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

      {/* Admin profile details pop-up */}
      <AdminProfileDialog
        admin={adminProfile}
        open={profileOpen}
        onOpenChange={setProfileOpen}
      />

      {/* Spacer for floating bar */}
      <div className={cn(!scrolled ? "h-0" : "h-24")} />
    </>
  );
}
