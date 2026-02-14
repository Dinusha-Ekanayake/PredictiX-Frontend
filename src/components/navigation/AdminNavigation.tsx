"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutGrid,
  Ticket,
  Box,
  Warehouse,
  Users,
  type LucideIcon,
} from "lucide-react";

/**
 * Admin navigation tabs — lives inside the purple gradient container.
 * Inactive = semi-transparent white pill on gradient.
 * Active  = solid white pill with dark text.
 */

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutGrid },
  { label: "Tickets", href: "/admin/tickets", icon: Ticket },
  { label: "Assets Insights", href: "/admin/assets-insights", icon: Box },
  { label: "Warehouse Insights", href: "/admin/warehouse-insights", icon: Warehouse },
  { label: "Users", href: "/admin/users", icon: Users },
];

export default function AdminNavigation() {
  const pathname = usePathname();

  return (
    <nav className="w-full border-t border-white/10">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="scrollbar-none flex items-center gap-2 overflow-x-auto py-2.5">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-white text-violet-950 shadow-sm"
                    : "bg-white/10 text-white hover:bg-white/[0.18]"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
