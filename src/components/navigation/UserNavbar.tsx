"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Ticket,
  Boxes,
  Users,
  Menu,
  CircleHelp,
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
import ProfileDropdown, {
  type ProfileDropdownUser,
} from "@/components/navigation/ProfileDropdown";
import { useUser } from "@/hooks/useAuth";
import { fetchMyProfile } from "@/lib/api/userProfileApi";

const NAV = [
  { href: "/user/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/user/tickets",   label: "Tickets",   icon: Ticket },
  { href: "/user/assets",    label: "Assets",    icon: Boxes },
  { href: "/user/users",     label: "Users",     icon: Users },
] as const;

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function UserNavbar() {
  const pathname = usePathname() ?? "";
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  // ── User data ──────────────────────────────────────────────────────────────
  const { user: storedUser } = useUser();

  const [profileUser, setProfileUser] = React.useState<ProfileDropdownUser>({
    name: "User",
    email: "",
    role: "USER",
    department: null,
    warehouse: null,
  });

  // Populate from localStorage immediately
  React.useEffect(() => {
    if (storedUser) {
      setProfileUser((prev) => ({
        ...prev,
        name: storedUser.full_name || "User",
        email: storedUser.email || "",
        role: (storedUser.role?.toUpperCase() as "ADMIN" | "USER") || "USER",
      }));
    }
  }, [storedUser]);

  // Hydrate richer data from backend (department, warehouse)
  React.useEffect(() => {
    fetchMyProfile()
      .then((data) => {
        setProfileUser({
          name: data.name || storedUser?.full_name || "User",
          email: data.email || storedUser?.email || "",
          role: (data.role?.toUpperCase() as "ADMIN" | "USER") || "USER",
          department: data.department ?? null,
          warehouse: data.warehouse ?? null,
          avatar_url: data.avatar_url ?? null,
        });
      })
      .catch(() => {
        // Silently fall back to localStorage values already set
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const avatarText = getInitials(profileUser.name);

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
            !scrolled
              ? "bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg border-b border-slate-200/60 dark:border-white/10"
              : "mx-auto max-w-5xl rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-[0_8px_30px_-4px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.4)] border border-slate-200/60 dark:border-white/10"
          )}
        >
          <div
            className={cn(
              "grid grid-cols-[auto_1fr_auto] items-center gap-4",
              !scrolled ? "px-6 h-16" : "px-5 h-14"
            )}
          >
            {/* LEFT - Logo */}
            <Link
              href="/user/dashboard"
              className="flex items-center gap-2.5 select-none"
            >
              <PredictiXLogo
                size={scrolled ? 28 : 32}
                showText={false}
                className="flex-shrink-0"
              />
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

            {/* CENTER - Nav */}
            <nav
              className={cn(
                "justify-self-center hidden md:flex items-center",
                !scrolled ? "gap-9" : "gap-1 rounded-2xl bg-slate-100/80 p-1.5 dark:bg-white/5"
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
                        : "px-3.5 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-50 hover:bg-white/70 dark:hover:bg-white/5",
                      active &&
                        (scrolled
                          ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/70 dark:bg-white/10 dark:text-white dark:ring-white/15"
                          : "text-slate-900 dark:text-white")
                    )}
                  >
                    <Icon className="h-4 w-4 -translate-y-px" />
                    <span className="leading-none">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* RIGHT - Theme + Profile dropdown */}
            <div className="flex items-center gap-3 justify-self-end">
              <ThemeToggle className="-translate-y-px" size={20} />

              <ProfileDropdown
                user={profileUser}
                profileHref="/user/profile"
                settingsHref="/user/settings"
              />

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
                        <span className="font-semibold tracking-tight">PredictiX</span>
                      </SheetTitle>
                    </SheetHeader>

                    {/* Mobile user card */}
                    <div className="mt-5 rounded-2xl border border-slate-200 p-4 dark:border-white/10">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "grid place-items-center rounded-full font-semibold text-white overflow-hidden",
                            "bg-gradient-to-br from-violet-600 to-indigo-600",
                            "ring-1 ring-white/40 dark:ring-white/10",
                            "h-11 w-11 text-sm flex-shrink-0"
                          )}
                        >
                          {profileUser.avatar_url ? (
                            <img src={profileUser.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                          ) : (
                            avatarText
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold truncate">{profileUser.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {profileUser.role === "ADMIN" ? "Administrator" : "User"}
                          </div>
                          {profileUser.email && (
                            <div className="text-[11px] text-muted-foreground truncate mt-0.5">
                              {profileUser.email}
                            </div>
                          )}
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
                              "hover:bg-slate-100 dark:hover:bg-white/5",
                              active &&
                                "bg-slate-100 ring-1 ring-slate-200 dark:bg-white/10 dark:ring-white/15"
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
      </header>

      {/* Spacer for floating bar */}
      <div className={cn(!scrolled ? "h-0" : "h-24")} />
    </>
  );
}
