"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleHelp } from "lucide-react";

const HIDDEN_ROUTE_PREFIXES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/auth",
];

export default function BottomHelpDeskLink() {
  const pathname = usePathname() ?? "";

  const isHiddenRoute = HIDDEN_ROUTE_PREFIXES.some((prefix) => {
    return pathname === prefix || pathname.startsWith(`${prefix}/`);
  });

  if (isHiddenRoute || pathname.startsWith("/help-desk")) {
    return null;
  }

  return (
    <Link
      href="/help-desk"
      className="fixed bottom-4 left-4 z-[40] inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/95 px-4 py-2 text-sm font-medium text-foreground shadow-lg backdrop-blur-sm transition-colors hover:bg-accent hover:text-accent-foreground"
      aria-label="Open Help Desk"
    >
      <CircleHelp className="size-4" />
      Help Desk
    </Link>
  );
}
