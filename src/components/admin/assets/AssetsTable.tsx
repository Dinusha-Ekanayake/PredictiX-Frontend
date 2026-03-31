"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

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


              return (
                <button
                  key={asset.id}
                  onClick={() => onSelect(asset.id)}
                  className={cn(

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
                      </div>
                    </div>

                    <div className="col-span-2">
                      <div className="text-sm font-medium">
                        {asset.warehouse.code}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {asset.warehouse.name}

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

                      </div>
                    </div>
                  </div>
                </button>
              );
            })}

            {assets.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                No assets match the current filters.
              </div>
            ) : null}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}