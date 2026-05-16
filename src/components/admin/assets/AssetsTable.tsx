"use client";

import * as React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { Asset } from "./types";

/* ── Status pill ─────────────────────────────────────────────────────────────── */
const STATUS_META: Record<
  Asset["status"],
  { label: string; dot: string; bg: string }
> = {
  OPERATIONAL: {
    label: "Operational",
    dot: "bg-emerald-500",
    bg: "bg-emerald-50 text-emerald-700 ring-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20",
  },
  MAINTENANCE: {
    label: "Maintenance",
    dot: "bg-amber-500",
    bg: "bg-amber-50 text-amber-700 ring-amber-200/60 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20",
  },
  CRITICAL: {
    label: "Critical",
    dot: "bg-red-500",
    bg: "bg-red-50 text-red-700 ring-red-200/60 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20",
  },
  OFFLINE: {
    label: "Offline",
    dot: "bg-slate-400",
    bg: "bg-slate-100 text-slate-500 ring-slate-200/60 dark:bg-white/[0.06] dark:text-slate-400 dark:ring-white/10",
  },
};

function StatusPill({ s }: { s: Asset["status"] }) {
  const m = STATUS_META[s];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset leading-none",
        m.bg,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", m.dot)} />
      {m.label}
    </span>
  );
}

/* ── Health mini-bar ─────────────────────────────────────────────────────────── */
function HealthBar({ score }: { score: number }) {
  const color =
    score >= 80
      ? "bg-emerald-500"
      : score >= 60
        ? "bg-lime-500"
        : score >= 40
          ? "bg-amber-500"
          : score >= 20
            ? "bg-orange-500"
            : "bg-red-500";

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 rounded-full bg-slate-200/60 dark:bg-white/[0.08] overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", color)}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs font-semibold tabular-nums w-8 text-right">
        {score}
      </span>
    </div>
  );
}

/* ── Component ───────────────────────────────────────────────────────────────── */
type Props = {
  assets: Asset[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export default function AssetsTable({ assets, selectedId, onSelect }: Props) {
  return (
    <div className="card-dynamic rounded-2xl border border-slate-200 dark:border-slate-700 bg-card overflow-hidden flex flex-col transition-all">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/80 dark:border-white/[0.06]">
        <h2 className="text-sm font-semibold">Asset List</h2>
        <span className="text-[11px] text-muted-foreground font-medium tabular-nums">
          {assets.length} asset{assets.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Column labels */}
      <div className="grid grid-cols-12 px-4 py-2 border-b border-slate-200/80 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.02] text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
        <div className="col-span-5">Asset</div>
        <div className="col-span-3">Location</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2">Health</div>
      </div>

      {/* Rows */}
      <ScrollArea style={{ height: 520 }}>
        <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
          {assets.length === 0 && (
            <div className="px-5 py-16 text-center text-sm text-muted-foreground">
              No assets match your filters.
            </div>
          )}

          {assets.map((a) => {
            const active = selectedId === a.id;

            return (
              <button
                key={a.id}
                onClick={() => onSelect(a.id)}
                className={cn(
                  "w-full grid grid-cols-12 items-center gap-2 px-4 py-3.5 text-left transition-all duration-150",
                  // Light hover
                  "hover:bg-slate-50",
                  // Dark hover — subtle gradient lift
                  "dark:hover:bg-white/[0.03]",
                  // Active / selected
                  active && [
                    "bg-primary/[0.04] dark:bg-white/[0.06]",
                    "border-l-2 border-l-primary",
                  ],
                  !active && "border-l-2 border-l-transparent",
                )}
              >
                {/* Asset name + ID */}
                <div className="col-span-5 min-w-0">
                  <div className="text-sm font-semibold leading-tight truncate">
                    {a.name}
                  </div>
                  <div className="text-[11px] text-muted-foreground/70 font-mono mt-0.5">
                    {a.id}
                  </div>
                </div>

                {/* Warehouse + location */}
                <div className="col-span-3 min-w-0">
                  <div className="text-xs font-medium truncate">
                    {a.warehouse.name}
                  </div>
                  <div className="text-[11px] text-muted-foreground/70 truncate mt-0.5">
                    {a.location.split("•")[0]?.trim()}
                  </div>
                </div>

                {/* Status */}
                <div className="col-span-2">
                  <StatusPill s={a.status} />
                </div>

                {/* Health bar */}
                <div className="col-span-2">
                  <HealthBar score={a.healthScore} />
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}