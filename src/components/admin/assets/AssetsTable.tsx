"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
<<<<<<< HEAD
import type { AssetHealthBand, AssetRecord, AssetStatus } from "./types";
import { cn } from "@/lib/utils";

function statusClasses(status: AssetStatus) {
  switch (status) {
    case "critical":
      return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
    case "under_maintenance":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
    case "inactive":
      return "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20";
    case "decommissioned":
      return "bg-zinc-500/10 text-zinc-700 dark:text-zinc-400 border-zinc-500/20";
    case "active":
    default:
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
  }
}

function healthBandClasses(healthBand?: AssetHealthBand | null) {
  switch (healthBand) {
    case "critical":
      return "bg-red-500/10 text-red-600 dark:text-red-400";
    case "poor":
      return "bg-orange-500/10 text-orange-700 dark:text-orange-400";
    case "moderate":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-400";
    case "good":
      return "bg-sky-500/10 text-sky-700 dark:text-sky-400";
    case "excellent":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function formatPercent(value?: number | null) {
=======
import type { Asset, AssetStatus } from "./types";
import { cn } from "@/lib/utils";
import { Box, Cog, Truck, Zap } from "lucide-react";

/* ── Status styling ── */
function statusConfig(status: AssetStatus) {
  switch (status) {
    case "CRITICAL":
      return {
        classes: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
        dot: "bg-red-500",
      };
    case "MAINTENANCE":
      return {
        classes: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
        dot: "bg-amber-500",
      };
    case "OFFLINE":
      return {
        classes: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
        dot: "bg-slate-400",
      };
    case "OPERATIONAL":
    default:
      return {
        classes: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
        dot: "bg-emerald-500",
      };
  }
}

/* ── Health styling ── */
function getHealthBand(score: number) {
  if (score >= 80) return "excellent";
  if (score >= 60) return "good";
  if (score >= 40) return "moderate";
  if (score >= 20) return "poor";
  return "critical";
}

function healthColor(score: number) {
  const band = getHealthBand(score);
  switch (band) {
    case "critical":
      return "bg-red-500";
    case "poor":
      return "bg-orange-500";
    case "moderate":
      return "bg-amber-500";
    case "good":
      return "bg-sky-500";
    case "excellent":
      return "bg-emerald-500";
    default:
      return "bg-muted-foreground/30";
  }
}

function healthTrackColor(score: number) {
  const band = getHealthBand(score);
  switch (band) {
    case "critical":
      return "bg-red-500/15";
    case "poor":
      return "bg-orange-500/15";
    case "moderate":
      return "bg-amber-500/15";
    case "good":
      return "bg-sky-500/15";
    case "excellent":
      return "bg-emerald-500/15";
    default:
      return "bg-muted/30";
  }
}

function CategoryIcon({ name }: { name: string }) {
  const cls = "h-4 w-4";
  const lower = name.toLowerCase();
  if (lower.includes("forklift") || lower.includes("van") || lower.includes("truck")) {
    return <Truck className={cls} />;
  }
  if (lower.includes("conveyor") || lower.includes("crane")) {
    return <Cog className={cls} />;
  }
  if (lower.includes("robot") || lower.includes("sorter")) {
    return <Zap className={cls} />;
  }
  return <Box className={cls} />;
}

function formatPercent(value?: number) {
>>>>>>> 8fd9ee0d230ce884f4957d6664ed8fc3d212cbbb
  if (typeof value !== "number") return "—";
  return `${Math.round(value * 100)}%`;
}

export default function AssetsTable({
  assets,
  selectedId,
  onSelect,
}: {
  assets: AssetRecord[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
<<<<<<< HEAD
    <Card className="rounded-2xl border-border/60 bg-card/90 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Asset Inventory</CardTitle>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="grid grid-cols-12 rounded-xl border bg-muted/25 px-3 py-2 text-xs font-medium text-muted-foreground">
          <div className="col-span-4">Asset</div>
          <div className="col-span-2">Warehouse</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Health</div>
          <div className="col-span-2 text-right">Risk</div>
        </div>

        <ScrollArea className="mt-3 h-[34rem] rounded-xl border">
          <div className="divide-y">
            {assets.map((asset) => {
              const active = selectedId === asset.id;

=======
    <Card className="rounded-2xl border-border/40 bg-card/80 backdrop-blur-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold tracking-tight">
            Asset Inventory
          </CardTitle>
          <span className="text-[12px] text-muted-foreground">
            {assets.length} {assets.length === 1 ? "item" : "items"}
          </span>
        </div>
      </CardHeader>

      <CardContent className="px-3 pt-0 pb-3">
        <ScrollArea className="h-[36rem]">
          <div className="space-y-1.5 pr-3">
            {assets.map((asset) => {
              const active = selectedId === asset.id;
              const sc = statusConfig(asset.status);
              const healthScore = asset.healthScore ?? 0;

>>>>>>> 8fd9ee0d230ce884f4957d6664ed8fc3d212cbbb
              return (
                <button
                  key={asset.id}
                  onClick={() => onSelect(asset.id)}
                  className={cn(
<<<<<<< HEAD
                    "w-full px-3 py-3 text-left transition-colors",
                    "hover:bg-accent/40",
                    active && "bg-accent/50"
                  )}
                >
                  <div className="grid grid-cols-12 items-center gap-2">
                    <div className="col-span-4 min-w-0">
                      <div className="truncate text-sm font-semibold">
                        {asset.assetName}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {asset.assetCode} • {asset.vehicleType ?? asset.assetType}
=======
                    "group relative w-full rounded-xl p-3 text-left transition-all duration-200",
                    "hover:bg-accent/30",
                    active
                      ? "bg-accent/40 shadow-sm ring-1 ring-border/60"
                      : "bg-transparent"
                  )}
                >
                  {/* Active indicator bar */}
                  {active && (
                    <div className="absolute left-0 top-1/2 h-8 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
                  )}

                  <div className="flex items-start gap-3">
                    {/* Category icon */}
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted/40 text-muted-foreground transition-colors group-hover:bg-muted/60">
                      <CategoryIcon name={asset.name} />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      {/* Row 1: Name + Status */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="truncate text-sm font-semibold">
                          {asset.name}
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            "shrink-0 text-[10px] capitalize",
                            sc.classes
                          )}
                        >
                          {asset.status?.toLowerCase().replaceAll("_", " ")}
                        </Badge>
>>>>>>> 8fd9ee0d230ce884f4957d6664ed8fc3d212cbbb
                      </div>

<<<<<<< HEAD
                    <div className="col-span-2">
                      <div className="text-sm font-medium">
                        {asset.warehouse.code}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {asset.warehouse.name}
                      </div>
                    </div>

                    <div className="col-span-2">
                      <Badge
                        variant="outline"
                        className={cn("capitalize", statusClasses(asset.status))}
                      >
                        {asset.status.replaceAll("_", " ")}
                      </Badge>
                    </div>

                    <div className="col-span-2">
                      <div className="text-sm font-semibold">
                        {asset.prediction?.healthScore ?? "—"}
                        {typeof asset.prediction?.healthScore === "number"
                          ? "%"
                          : ""}
                      </div>
                      <div
                        className={cn(
                          "mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium capitalize",
                          healthBandClasses(asset.healthBand)
                        )}
                      >
                        {asset.healthBand ?? "unknown"}
                      </div>
                    </div>

                    <div className="col-span-2 text-right">
                      <div className="text-sm font-semibold">
                        {formatPercent(asset.prediction?.failureProbability)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        confidence {formatPercent(asset.prediction?.confidence)}
=======
                      {/* Row 2: Code + Location */}
                      <div className="mt-0.5 flex items-center gap-1.5 text-[12px] text-muted-foreground">
                        <span>{asset.id}</span>
                        <span className="text-muted-foreground/40">·</span>
                        <span className="truncate">{asset.location}</span>
                      </div>

                      {/* Row 3: Health bar + Risk */}
                      <div className="mt-2 flex items-center gap-3">
                        {/* Mini health bar */}
                        <div className="flex flex-1 items-center gap-2">
                          <div
                            className={cn(
                              "h-1.5 flex-1 overflow-hidden rounded-full",
                              healthTrackColor(healthScore)
                            )}
                          >
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-500",
                                healthColor(healthScore)
                              )}
                              style={{ width: `${healthScore}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-medium tabular-nums">
                            {healthScore > 0 ? `${healthScore}%` : "—"}
                          </span>
                        </div>

                        {/* Risk */}
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <span>Risk</span>
                          <span className="font-medium text-foreground">
                            {formatPercent(asset.failureProbability8w)}
                          </span>
                        </div>
>>>>>>> 8fd9ee0d230ce884f4957d6664ed8fc3d212cbbb
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}

<<<<<<< HEAD
            {assets.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                No assets match the current filters.
              </div>
            ) : null}
=======
            {assets.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Box className="mb-3 h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm font-medium text-muted-foreground">
                  No assets found
                </p>
                <p className="mt-1 text-[12px] text-muted-foreground/60">
                  Try adjusting your filters
                </p>
              </div>
            )}
>>>>>>> 8fd9ee0d230ce884f4957d6664ed8fc3d212cbbb
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}