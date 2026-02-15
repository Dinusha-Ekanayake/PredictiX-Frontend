import Image from "next/image";
import Link from "next/link";
import {
  LayoutDashboard,
  Ticket,
  Boxes,
  Warehouse,
  Users,
} from "lucide-react";

import WarehouseInsightsSection from "@/components/Dashboard/WarehouseInsightsSection";

// IMPORTANT: change this import path to match your repo
// Use Ctrl+Shift+F and search:  export function ThemeToggle
import ThemeToggle from "@/components/theme/ThemeToggle";

function NavItem(props: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
}) {
  if (props.active) {
    return (
      <span className="inline-flex items-center gap-2 rounded-xl bg-slate-200 px-4 py-2 text-sm font-medium text-slate-900 dark:bg-slate-800 dark:text-slate-50">
        {props.icon}
        {props.label}
      </span>
    );
  }

  return (
    <Link
      href={props.href}
      className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-50"
    >
      {props.icon}
      {props.label}
    </Link>
  );
}

export default function WarehouseInsightsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Sticky Top Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
  <div className="mx-auto max-w-6xl px-4 py-3 md:px-6">
    {/* Row 1 */}
    <div className="flex items-center justify-between">
      {/* Left: logo + brand */}
      <div className="flex items-center gap-3">
        <div className="relative h-9 w-9">
          <Image
            src="/logo/predictix-icon.svg"   // must exist in public/logo/
            alt="PredictiX logo"
            fill
            sizes="36px"
            className="rounded-xl object-contain"
          />
        </div>

        <div className="leading-tight">
          <div className="text-sm font-semibold">PredictiX</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            AI‑Powered Asset Management
          </div>
        </div>
      </div>

      {/* Right: theme toggle + avatar (add yours here) */}
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white dark:bg-slate-100 dark:text-slate-900">
          AD
        </div>
      </div>
    </div>

    {/* Row 2: nav exactly below */}
    <nav className="mt-3 flex flex-wrap items-center gap-2">
      <NavItem href="/dashboard" label="Dashboard" icon={<LayoutDashboard className="h-4 w-4" />} />
      <NavItem href="/tickets" label="Tickets" icon={<Ticket className="h-4 w-4" />} />
      <NavItem href="/assets-insights" label="Assets Insights" icon={<Boxes className="h-4 w-4" />} />
      <NavItem
        href="/warehouse-insights"
        label="Warehouse Insights"
        icon={<Warehouse className="h-4 w-4" />}
        active
      />
      <NavItem href="/users" label="Users" icon={<Users className="h-4 w-4" />} />
    </nav>
  </div>
</header>

      {/* Content area */}
      <main className="mx-auto max-w-6xl px-4 py-6 md:px-6">
        <WarehouseInsightsSection />
      </main>

      {/* Footer like your rough sketch */}
      <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <p className="text-sm font-semibold">PredictiX</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                AI‑powered predictive maintenance and smart ticket categorization
                for asset management.
              </p>
            </div>

            <div className="md:text-center">
              <p className="text-sm font-semibold">Academic Context</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Research project exploring data‑driven maintenance insights and
                decision support.
              </p>
            </div>

            <div className="flex items-start gap-3 md:justify-end">
              <div className="relative h-9 w-9">
                <Image
                  src="/logo/predictix-icon.svg" 
                  alt="PredictiX logo"
                  fill
                  sizes="36px"
                  className="rounded-xl object-contain"
                />
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold">PredictiX</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  © 2026 PredictiX
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-200 pt-4 text-center text-[11px] text-slate-500 dark:border-slate-800">
            © 2026 PredictiX. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}