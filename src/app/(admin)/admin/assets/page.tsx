"use client";

import * as React from "react";
import {
  Box,
  Boxes,
  ChevronRight,
  Radio,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import AssetsSummary from "@/components/admin/assets/AssetsSummary";
import AssetsToolbar, {
  AssetFilters,
} from "@/components/admin/assets/AssetsToolbar";
import AssetsTable from "@/components/admin/assets/AssetsTable";
import AssetDetailsPanel from "@/components/admin/assets/AssetDetailsPanel";
import { ASSETS } from "@/components/admin/assets/mock";

/* ── Helpers ─────────────────────────────────────────────────────────────────── */

function getHealthBand(score: number): AssetFilters["healthBand"] {
  if (score >= 80) return "excellent";
  if (score >= 60) return "good";
  if (score >= 40) return "moderate";
  if (score >= 20) return "poor";
  return "critical";
}

function matchesQuery(asset: (typeof ASSETS)[number], query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [
    asset.id,
    asset.name,
    asset.description,
    asset.warehouse.name,
    asset.location,
    asset.assignedPerson?.name,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(q);
}

function applyFilters(
  assets: typeof ASSETS,
  filters: AssetFilters,
): typeof ASSETS {
  return assets.filter((asset) => {
    const qm = matchesQuery(asset, filters.query);
    const sm =
      filters.status === "all" ? true : asset.status === filters.status;
    const hm =
      filters.healthBand === "all"
        ? true
        : getHealthBand(asset.healthScore) === filters.healthBand;
    const wm =
      filters.warehouse === "all"
        ? true
        : asset.warehouse.id === filters.warehouse;
    return qm && sm && hm && wm;
  });
}

/* ── Default filters ─────────────────────────────────────────────────────────── */
const DEFAULT_FILTERS: AssetFilters = {
  query: "",
  status: "all",
  healthBand: "all",
  warehouse: "all",
};

/* ══════════════════════════════════════════════════════════════════════════════
   Page
   ══════════════════════════════════════════════════════════════════════════════ */
export default function AdminAssetsPage() {
  const [filters, setFilters] = React.useState<AssetFilters>(DEFAULT_FILTERS);

  const warehouseOptions = React.useMemo(() => {
    const seen = new Map<string, string>();
    ASSETS.forEach((a) => seen.set(a.warehouse.id, a.warehouse.name));
    return Array.from(seen.entries()).map(([value, label]) => ({
      value,
      label,
    }));
  }, []);

  const filteredAssets = React.useMemo(
    () => applyFilters(ASSETS, filters),
    [filters],
  );

  const [selectedId, setSelectedId] = React.useState<string | null>(
    ASSETS[0]?.id ?? null,
  );

  // Keep selection valid when filters change
  React.useEffect(() => {
    if (!filteredAssets.length) {
      setSelectedId(null);
      return;
    }
    if (selectedId && filteredAssets.some((a) => a.id === selectedId)) return;
    setSelectedId(filteredAssets[0].id);
  }, [filteredAssets, selectedId]);

  const selectedAsset = React.useMemo(
    () => filteredAssets.find((a) => a.id === selectedId) ?? null,
    [filteredAssets, selectedId],
  );

  // Quick-stat pills for the hero header
  const totalAssets = ASSETS.length;
  const criticalCount = ASSETS.filter((a) => a.status === "CRITICAL").length;
  const avgHealth = Math.round(
    ASSETS.reduce((s, a) => s + a.healthScore, 0) / (totalAssets || 1),
  );

  return (
    <div className="space-y-6">
      {/* ── Hero header — matches dashboard style ── */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-linear-to-br from-slate-50 via-white to-slate-50 dark:from-[rgba(74,29,111,0.18)] dark:via-[rgba(29,58,95,0.12)] dark:to-[rgba(29,94,63,0.14)] p-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60 mb-3">
          <span>Admin</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground/80 font-medium">Assets</span>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 dark:bg-white/[0.06] p-2.5">
                <Boxes className="h-5 w-5 text-primary dark:text-white/70" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Asset Management
                </h1>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Monitor fleet health, maintenance state, and AI-driven
                  predictive insights across all warehouses.
                </p>
              </div>
            </div>
          </div>

          {/* Quick-stat pills + live badge */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="gap-1.5 rounded-full px-3 py-1 text-xs font-medium border-slate-200 dark:border-slate-700 bg-background/60 dark:bg-white/[0.04]"
            >
              <Boxes className="h-3 w-3" />
              {totalAssets} assets
            </Badge>
            <Badge
              variant="outline"
              className="gap-1.5 rounded-full px-3 py-1 text-xs font-medium border-slate-200 dark:border-slate-700 bg-background/60 dark:bg-white/[0.04]"
            >
              Avg. Health: {avgHealth}%
            </Badge>
            {criticalCount > 0 && (
              <Badge
                variant="destructive"
                className="gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
              >
                {criticalCount} Critical
              </Badge>
            )}
            <Badge
              variant="outline"
              className="gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 bg-emerald-50/60 dark:bg-emerald-500/10"
            >
              <Radio className="h-3 w-3 animate-pulse" />
              Live
            </Badge>
          </div>
        </div>
      </div>

      {/* ── Summary KPIs ── */}
      <AssetsSummary assets={filteredAssets} />

      {/* ── Toolbar ── */}
      <AssetsToolbar
        filters={filters}
        setFilters={setFilters}
        resultsCount={filteredAssets.length}
        warehouseOptions={warehouseOptions}
      />

      {/* ── Table + Details ── */}
      <div className="grid grid-cols-12 gap-5">
        {/* Asset list */}
        <div className="col-span-12 xl:col-span-5">
          <AssetsTable
            assets={filteredAssets}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>

        {/* Details panel */}
        <div className="col-span-12 xl:col-span-7">
          {selectedAsset ? (
            <AssetDetailsPanel asset={selectedAsset} />
          ) : (
            <div className="card-dynamic flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-card px-6 py-24 text-center transition-all">
              <Box className="mb-4 h-10 w-10 text-muted-foreground/20" />
              <p className="text-sm font-medium text-muted-foreground">
                No asset selected
              </p>
              <p className="mt-1 text-[12px] text-muted-foreground/60">
                Select an asset from the list to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}