"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  LogOut,
  ChevronDown,
  Mail,
  Shield,
  Briefcase,
  Warehouse,
  ExternalLink,
  Settings,
  CircleHelp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { logout } from "@/lib/authService";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ProfileDropdownUser = {
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  department?: string | null;
  warehouse?: string | null;
  initials?: string;
  avatar_url?: string | null;
};

type Props = {
  user: ProfileDropdownUser;
  /** Link to navigate to the full profile page */
  profileHref: string;
  /** Link to navigate to the settings page */
  settingsHref: string;
};

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function RoleBadge({ role }: { role: "ADMIN" | "USER" }) {
  return (
    <Badge
      className={cn(
        "text-[10px] px-1.5 py-0 leading-4 font-semibold tracking-wide border-transparent",
        role === "ADMIN"
          ? "bg-violet-600/10 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400"
          : "bg-teal-600/10 text-teal-600 dark:bg-teal-500/15 dark:text-teal-400"
      )}
    >
      {role === "ADMIN" ? "Administrator" : "User"}
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function ProfileDropdown({ user, profileHref, settingsHref }: Props) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const avatarText = user.initials ?? getInitials(user.name);

  // Close on outside click
  React.useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  // Close on Escape
  React.useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger Button (sm+) */}
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "hidden sm:flex items-center gap-2.5 rounded-xl px-2 py-1.5 -mr-1",
          "hover:bg-slate-100/70 dark:hover:bg-white/5 transition-all duration-200",
          "cursor-pointer select-none group",
          open && "bg-slate-100/70 dark:bg-white/5"
        )}
      >
        {/* Name + role text */}
        <div className="text-right flex flex-col justify-center gap-0.5">
          <div className="text-sm font-semibold tracking-tight leading-none">{user.name}</div>
          <div className="text-[11px] text-muted-foreground font-medium leading-none pb-0.5">
            {user.role === "ADMIN" ? "Administrator" : "User"}
          </div>
        </div>

        {/* Avatar circle */}
        <div
          className={cn(
            "grid place-items-center rounded-full font-semibold text-white text-sm overflow-hidden",
            "bg-gradient-to-br from-violet-600 to-indigo-600",
            "shadow-[0_10px_25px_-15px_rgba(99,102,241,0.9)]",
            "ring-2 ring-white/40 dark:ring-white/10",
            "h-9 w-9 transition-transform group-hover:scale-105 flex-shrink-0"
          )}
        >
          {user.avatar_url ? (
            <img src={user.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
          ) : (
            avatarText
          )}
        </div>

        {/* Chevron indicator */}
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 flex-shrink-0",
            open && "rotate-180"
          )}
        />
      </button>

      {/* Compact avatar (xs only) */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "sm:hidden grid place-items-center rounded-full font-semibold text-white overflow-hidden",
          "bg-gradient-to-br from-violet-600 to-indigo-600",
          "shadow-[0_10px_25px_-15px_rgba(99,102,241,0.9)]",
          "ring-2 ring-white/40 dark:ring-white/10",
          "h-9 w-9 text-sm transition-transform hover:scale-105 cursor-pointer"
        )}
        title={`${user.name} - ${user.role === "ADMIN" ? "Administrator" : "User"}`}
        aria-haspopup="true"
        aria-expanded={open}
      >
        {user.avatar_url ? (
          <img src={user.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
        ) : (
          avatarText
        )}
      </button>

      {/* Dropdown Panel */}
      <div
        className={cn(
          "absolute right-0 top-[calc(100%+10px)] z-[200] w-[90vw] sm:w-[300px]",
          "rounded-2xl border border-slate-200/80 dark:border-white/10",
          "bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl",
          "shadow-[0_20px_60px_-15px_rgba(0,0,0,0.18)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]",
          "transition-all duration-200 origin-top-right",
          open
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none"
        )}
        role="menu"
        aria-label="Profile menu"
      >
        {/* User Card Header */}
        <div className="p-4 pb-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "grid place-items-center rounded-full font-bold text-white text-base overflow-hidden",
                "bg-gradient-to-br from-violet-600 to-indigo-600",
                "ring-2 ring-white dark:ring-slate-900",
                "shadow-[0_8px_20px_-8px_rgba(99,102,241,0.8)]",
                "h-12 w-12 flex-shrink-0"
              )}
            >
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                avatarText
              )}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate leading-tight">{user.name}</p>
              <div className="mt-0.5">
                <RoleBadge role={user.role} />
              </div>
            </div>
          </div>

          {/* Info rows */}
          <div className="mt-3 space-y-1.5">
            {user.email && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Mail className="h-3.5 w-3.5 flex-shrink-0 text-violet-500" />
                <span className="truncate">{user.email}</span>
              </div>
            )}
            {user.department && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Briefcase className="h-3.5 w-3.5 flex-shrink-0 text-violet-500" />
                <span className="truncate">{user.department}</span>
              </div>
            )}
            {user.warehouse && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Warehouse className="h-3.5 w-3.5 flex-shrink-0 text-violet-500" />
                <span className="truncate">{user.warehouse}</span>
              </div>
            )}
            {user.role === "ADMIN" && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-3.5 w-3.5 flex-shrink-0 text-violet-500" />
                <span>Full administrative access</span>
              </div>
            )}
          </div>
        </div>

        <div className="h-px bg-slate-100 dark:bg-white/10 mx-3" />

        {/* Menu Items */}
        <div className="p-2">
          <Link
            href={profileHref}
            role="menuitem"
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
              "text-slate-700 dark:text-slate-200",
              "hover:bg-slate-100 dark:hover:bg-white/8 transition-colors"
            )}
          >
            <div className="grid place-items-center h-8 w-8 rounded-lg bg-violet-50 dark:bg-violet-500/10 flex-shrink-0">
              <User className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="leading-tight">View Profile</div>
              <div className="text-[11px] text-muted-foreground font-normal">
                Manage your account details
              </div>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
          </Link>

          <Link
            href={settingsHref}
            role="menuitem"
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
              "text-slate-700 dark:text-slate-200",
              "hover:bg-slate-100 dark:hover:bg-white/8 transition-colors"
            )}
          >
            <div className="grid place-items-center h-8 w-8 rounded-lg bg-slate-100 dark:bg-white/5 flex-shrink-0">
              <Settings className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="leading-tight">Settings</div>
              <div className="text-[11px] text-muted-foreground font-normal">
                Preferences & notifications
              </div>
            </div>
          </Link>

          <Link
            href="/help-desk"
            role="menuitem"
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
              "text-slate-700 dark:text-slate-200",
              "hover:bg-slate-100 dark:hover:bg-white/8 transition-colors"
            )}
          >
            <div className="grid place-items-center h-8 w-8 rounded-lg bg-violet-50 dark:bg-violet-500/10 flex-shrink-0">
              <CircleHelp className="h-4 w-4 text-violet-500 dark:text-violet-400" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="leading-tight">Help Desk</div>
              <div className="text-[11px] text-muted-foreground font-normal">
                FAQs & support articles
              </div>
            </div>
          </Link>
        </div>

        <div className="h-px bg-slate-100 dark:bg-white/10 mx-3" />

        {/* Sign Out */}
        <div className="p-2">
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
              "text-red-600 dark:text-red-400",
              "hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            )}
          >
            <div className="grid place-items-center h-8 w-8 rounded-lg bg-red-50 dark:bg-red-500/10 flex-shrink-0">
              <LogOut className="h-4 w-4 text-red-500" />
            </div>
            <div className="text-left">
              <div className="leading-tight">Sign Out</div>
              <div className="text-[11px] text-red-400/70 font-normal">
                End your session securely
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 text-center">
          <p className="text-[10px] text-muted-foreground/60">
            PredictiX - AI-Powered Asset Management
          </p>
        </div>
      </div>
    </div>
  );
}
