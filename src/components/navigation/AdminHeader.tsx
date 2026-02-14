"use client";

import Image from "next/image";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { UserRound, LogOut } from "lucide-react";

/**
 * Admin top header bar — lives inside the purple gradient container.
 * All text is explicitly white for contrast on the gradient.
 *
 * TODO: Replace hardcoded user with auth context when backend is ready.
 */
export default function AdminHeader() {
  return (
    <header className="w-full">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <Image
            src="/logo/predictix-icon.svg"
            alt="PredictiX"
            width={34}
            height={34}
            priority
          />
          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-tight text-white">
              PredictiX Admin
            </p>
            <p className="text-[11px] text-white/60">
              Full system access &bull; Sarah Johnson
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/20"
          >
            <UserRound className="h-4 w-4" />
            Profile
          </button>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/20"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
