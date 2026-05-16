"use client";

import * as React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Asset } from "./types";

// ── Status pill ────────────────────────────────────────────────────────────────
const STATUS_META: Record<string, { label: string; dot: string; bg: string }> = {
  active: {
    label: "Active",
    dot: "bg-emerald-500",
    bg: "bg-emerald-50 text-emerald-700 ring-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20",
  },
  maintenance: {
    label: "Maintenance",
    dot: "bg-amber-500",
    bg: "bg-amber-50 text-amber-700 ring-amber-200/60 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20",
  },
  in_maintenance: {
    label: "Maintenance",
    dot: "bg-amber-500",
    bg: "bg-amber-50 text-amber-700 ring-amber-200/60 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20",
  },
  inactive: {
    label: "Inactive",
    dot: "bg-slate-400",
    bg: "bg-slate-100 text-slate-500 ring-slate-200/60 dark:bg-white/[0.06] dark:text-slate-400 dark:ring-white/10",
  },
  retired: {
    label: "Retired",
    dot: "bg-slate-400",
    bg: "bg-slate-100 text-slate-500 ring-slate-200/60 dark:bg-white/[0.06] dark:text-slate-400 dark:ring-white/10",
  },
};

function StatusPill({ status }: { status: string }) {
  const m = STATUS_META[status.toLowerCase()] ?? {
    label: status,
    dot: "bg-slate-400",
    bg: "bg-slate-100 text-slate-500 ring-slate-200/60 dark:bg-white/[0.06] dark:text-slate-400",
  };
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

// ── Health band mini-bar ───────────────────────────────────────────────────────
const BAND_META: Record<string, { score: number; color: string }> = {
  excellent: { score: 90, color: "bg-emerald-500" },
  good:      { score: 72, color: "bg-lime-500"    },
  moderate:  { score: 52, color: "bg-amber-500"   },
  poor:      { score: 30, color: "bg-orange-500"  },
  critical:  { score: 12, color: "bg-red-500"     },
};

function HealthBar({ band }: { band: string | null }) {
  const meta = band ? (BAND_META[band.toLowerCase()] ?? BAND_META.moderate) : BAND_META.moderate;

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 rounded-full bg-slate-200/60 dark:bg-white/[0.08] overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", meta.color)}
          style={{ width: `${meta.score}%` }}
        />
      </div>
      <span className="text-xs font-semibold tabular-nums w-8 text-right">{meta.score}</span>
    </div>
  );
}

// ── Loading skeleton ───────────────────────────────────────────────────────────
function TableSkeleton() {
  return (
    <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="grid grid-cols-12 items-center gap-2 px-4 py-3.5">
          <div className="col-span-5 space-y-1.5">
            <Skeleton className="h-3.5 w-32 rounded" />
            <Skeleton className="h-3 w-16 rounded" />
          </div>
          <div className="col-span-3 space-y-1.5">
            <Skeleton className="h-3.5 w-24 rounded" />
            <Skeleton className="h-3 w-16 rounded" />
          </div>
          <div className="col-span-2">
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <div className="col-span-2">
            <Skeleton className="h-1.5 w-full rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────────
type Props = {
  assets: Asset[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading?: boolean;
};

export default function AssetsTable({ assets, selectedId, onSelect, loading }: Props) {
  return (
    <div className="card-dynamic rounded-2xl border border-slate-200 dark:border-slate-700 bg-card overflow-hidden flex flex-col transition-all">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/80 dark:border-white/[0.06]">
        <h2 className="text-sm font-semibold">Asset List</h2>
        <span className="text-[11px] text-muted-foreground font-medium tabular-nums">
          {loading ? "Loading…" : `${assets.length} asset${assets.length !== 1 ? "s" : ""}`}
        </span>
      </div>

      {/* Column labels */}
      <div className="grid grid-cols-12 px-4 py-2 border-b border-slate-200/80 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.02] text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
        <div className="col-span-5">Asset</div>
        <div className="col-span-3">Type / Make</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2">Health</div>
      </div>

      {/* Rows */}
      <ScrollArea style={{ height: 520 }}>
        {loading ? (
          <TableSkeleton />
        ) : assets.length === 0 ? (
          <div className="px-5 py-16 text-center text-sm text-muted-foreground">
            No assets match your filters.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
            {assets.map((a) => {
              const active = selectedId === a.id;
              const displayName = a.asset_name;
              const displaySub = a.asset_code;
              const typeLine = [a.vehicle_type, a.asset_type]
                .filter(Boolean)
                .join(" · ") || "—";
              const makeLine = [a.make, a.model, a.manufacture_year]
                .filter(Boolean)
                .join(" ");

              return (
                <button
                  key={a.id}
                  onClick={() => onSelect(a.id)}
                  className={cn(
                    "w-full grid grid-cols-12 items-center gap-2 px-4 py-3.5 text-left transition-all duration-150",
                    "hover:bg-slate-50 dark:hover:bg-white/[0.03]",
                    active
                      ? "bg-primary/[0.04] dark:bg-white/[0.06] border-l-2 border-l-primary"
                      : "border-l-2 border-l-transparent",
                  )}
                >
                  {/* Name + code */}
                  <div className="col-span-5 min-w-0">
                    <div className="text-sm font-semibold leading-tight truncate">
                      {displayName}
                    </div>
                    <div className="text-[11px] text-muted-foreground/70 font-mono mt-0.5">
                      {displaySub}
                    </div>
                  </div>

                  {/* Type + make */}
                  <div className="col-span-3 min-w-0">
                    <div className="text-xs font-medium truncate">{typeLine}</div>
                    <div className="text-[11px] text-muted-foreground/70 truncate mt-0.5">
                      {makeLine || "—"}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="col-span-2">
                    <StatusPill status={a.status} />
                  </div>

                  {/* Health band bar */}
                  <div className="col-span-2">
                    <HealthBar band={a.health_band} />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}