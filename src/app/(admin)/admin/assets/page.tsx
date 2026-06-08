"use client";

import * as React from "react";
import { Boxes, ChevronRight, Radio, Box, AlertCircle, RefreshCw, Plus } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import AssetsSummary from "@/components/admin/assets/AssetsSummary";
import AssetsAnalytics from "@/components/admin/assets/AssetsAnalytics";
import AssetsToolbar, { DEFAULT_FILTERS } from "@/components/admin/assets/AssetsToolbar";
import AssetsTable from "@/components/admin/assets/AssetsTable";
import AssetDetailsPanel, { AssetDetailsSkeleton } from "@/components/admin/assets/AssetDetailsPanel";
import AssetFormDialog from "@/components/admin/assets/AssetFormDialog";

import {
  listAssets,
  getAssetDetail,
  deleteAsset,
} from "@/components/admin/assets/assetService";
import type { Asset, AssetDetail, AssetFilters } from "@/components/admin/assets/types";

/* ── Warehouse options derived from asset list ────────────────────────────────── */
function extractWarehouseOptions(assets: Asset[]) {
  const seen = new Map<string, string>();
  assets.forEach((a) => seen.set(a.warehouse_id, a.warehouse_id)); // no name in Asset model
  return Array.from(seen.entries()).map(([value]) => ({
    value,
    label: `Warehouse ${value.slice(0, 8)}…`,
  }));
}

/* ══════════════════════════════════════════════════════════════════════════════
   Page
   ══════════════════════════════════════════════════════════════════════════════ */
export default function AdminAssetsPage() {
  // ── Asset list state ──────────────────────────────────────────────────────────
  const [filters, setFilters] = React.useState<AssetFilters>(DEFAULT_FILTERS);
  const [assets, setAssets] = React.useState<Asset[]>([]);
  const [listLoading, setListLoading] = React.useState(true);
  const [listError, setListError] = React.useState<string | null>(null);

  // ── Selected asset detail state ───────────────────────────────────────────────
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [detail, setDetail] = React.useState<AssetDetail | null>(null);
  const [detailLoading, setDetailLoading] = React.useState(false);
  const [detailError, setDetailError] = React.useState<string | null>(null);

  // ── Create/edit dialog state ──────────────────────────────────────────────────
  const [formOpen, setFormOpen] = React.useState(false);
  const [editingAsset, setEditingAsset] = React.useState<Asset | null>(null);

  // ── Load asset list whenever filters change (debounced on query) ───────────────
  const queryRef = React.useRef(filters.query);
  queryRef.current = filters.query;

  React.useEffect(() => {
    let cancelled = false;
    const delay = filters.query ? 350 : 0; // debounce only text search

    const timer = setTimeout(async () => {
      setListLoading(true);
      setListError(null);
      try {
        const data = await listAssets(filters);
        if (cancelled) return;
        setAssets(data);

        // Auto-select first asset if current selection is gone
        if (!selectedId || !data.find((a) => a.id === selectedId)) {
          setSelectedId(data[0]?.id ?? null);
        }
      } catch (e: unknown) {
        if (!cancelled) setListError(e instanceof Error ? e.message : "Failed to load assets");
      } finally {
        if (!cancelled) setListLoading(false);
      }
    }, delay);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // ── Load detail when selection changes ────────────────────────────────────────
  React.useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    let cancelled = false;

    async function load() {
      setDetailLoading(true);
      setDetailError(null);
      try {
        const d = await getAssetDetail(selectedId!);
        if (!cancelled) setDetail(d);
      } catch (e: unknown) {
        if (!cancelled)
          setDetailError(e instanceof Error ? e.message : "Failed to load asset details");
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [selectedId]);

  // ── Refresh detail (called after running a new prediction) ────────────────────
  function refreshDetail() {
    if (!selectedId) return;
    setSelectedId((id) => id); // triggers the effect above
  }

  // ── Delete handler ────────────────────────────────────────────────────────────
  async function handleDelete(id: string) {
    if (!confirm("Delete this asset? This cannot be undone.")) return;
    try {
      await deleteAsset(id);
      setAssets((prev) => prev.filter((a) => a.id !== id));
      if (selectedId === id) setSelectedId(assets.find((a) => a.id !== id)?.id ?? null);
      toast.success("Asset deleted");
    } catch (e: unknown) {
      toast.error("Delete failed", { description: e instanceof Error ? e.message : undefined });
    }
  }

  // ── Create/edit handlers ────────────────────────────────────────────────────
  function openCreate() {
    setEditingAsset(null);
    setFormOpen(true);
  }
  function openEdit(asset: Asset) {
    setEditingAsset(asset);
    setFormOpen(true);
  }
  function handleSaved(saved: Asset) {
    setAssets((prev) => {
      const exists = prev.some((a) => a.id === saved.id);
      return exists ? prev.map((a) => (a.id === saved.id ? saved : a)) : [saved, ...prev];
    });
    setSelectedId(saved.id);
    // refresh the detail panel for the saved asset
    setSelectedId((id) => id);
  }

  // ── Derived stats for hero header ─────────────────────────────────────────────
  const criticalCount = assets.filter((a) => a.health_band === "critical").length;
  const avgBandScore: Record<string, number> = {
    excellent: 90, good: 72, moderate: 52, poor: 30, critical: 12,
  };
  const avgHealth = assets.length
    ? Math.round(
        assets.reduce((s, a) => s + (a.health_band ? (avgBandScore[a.health_band] ?? 50) : 50), 0) /
          assets.length,
      )
    : 0;

  const warehouseOptions = React.useMemo(
    () => extractWarehouseOptions(assets),
    [assets],
  );

  return (
    <div className="space-y-6">
      {/* ── Hero header ── */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-linear-to-br from-slate-50 via-white to-slate-50 dark:from-violet-500/8 dark:via-white/2 dark:to-transparent dark:bg-white/2 p-6">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60 mb-3">
          <span>Admin</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground/80 font-medium">Assets</span>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 dark:bg-white/6 p-2.5">
              <Boxes className="h-5 w-5 text-primary dark:text-white/70" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Asset Management</h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Monitor fleet health, maintenance state, and AI-driven predictive insights.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {listLoading ? (
              <Skeleton className="h-7 w-24 rounded-full" />
            ) : (
              <>
                <Badge variant="outline" className="gap-1.5 rounded-full px-3 py-1 text-xs font-medium border-slate-200 dark:border-slate-700 bg-background/60 dark:bg-white/4">
                  <Boxes className="h-3 w-3" />
                  {assets.length} assets
                </Badge>
                <Badge variant="outline" className="gap-1.5 rounded-full px-3 py-1 text-xs font-medium border-slate-200 dark:border-slate-700 bg-background/60 dark:bg-white/4">
                  Avg. Health: {avgHealth}%
                </Badge>
                {criticalCount > 0 && (
                  <Badge variant="destructive" className="gap-1.5 rounded-full px-3 py-1 text-xs font-medium">
                    {criticalCount} Critical
                  </Badge>
                )}
              </>
            )}
            <Badge variant="outline" className="gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 bg-emerald-50/60 dark:bg-emerald-500/10">
              <Radio className="h-3 w-3 animate-pulse" />
              Live
            </Badge>
            <Button size="sm" className="h-7 gap-1.5 rounded-full" onClick={openCreate}>
              <Plus className="h-3.5 w-3.5" />
              Add Asset
            </Button>
          </div>
        </div>
      </div>

      {/* ── List error ── */}
      {listError && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-500/10 px-5 py-4 text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{listError}</span>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto h-7 rounded-lg gap-1.5 text-xs text-red-700 dark:text-red-400 hover:text-red-800"
            onClick={() => setFilters((f) => ({ ...f }))}
          >
            <RefreshCw className="h-3 w-3" />
            Retry
          </Button>
        </div>
      )}

      {/* ── Summary KPIs ── */}
      <AssetsSummary assets={assets} />

      {/* ── Descriptive Analytics ── */}
      {!listLoading && assets.length > 0 && <AssetsAnalytics assets={assets} />}

      {/* ── Toolbar ── */}
      <AssetsToolbar
        filters={filters}
        setFilters={setFilters}
        resultsCount={assets.length}
        warehouseOptions={warehouseOptions}
        loading={listLoading}
        onAddAsset={openCreate}
      />

      {/* ── Table + Details ── */}
      <div className="grid grid-cols-12 gap-5">
        {/* List */}
        <div className="col-span-12 xl:col-span-5">
          <AssetsTable
            assets={assets}
            selectedId={selectedId}
            onSelect={setSelectedId}
            loading={listLoading}
          />
        </div>

        {/* Detail panel */}
        <div className="col-span-12 xl:col-span-7">
          {detailLoading ? (
            <AssetDetailsSkeleton />
          ) : detailError ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-500/10 px-6 py-16 text-center">
              <AlertCircle className="mb-3 h-8 w-8 text-red-400" />
              <p className="text-sm font-medium text-red-700 dark:text-red-400">{detailError}</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-3 gap-1.5 text-xs"
                onClick={() => setSelectedId((id) => id)}
              >
                <RefreshCw className="h-3 w-3" />
                Retry
              </Button>
            </div>
          ) : detail ? (
            <AssetDetailsPanel
              detail={detail}
              onRefresh={refreshDetail}
              onDelete={handleDelete}
              onEdit={openEdit}
            />
          ) : (
            <div className="card-dynamic flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-card px-6 py-24 text-center transition-all">
              <Box className="mb-4 h-10 w-10 text-muted-foreground/20" />
              <p className="text-sm font-medium text-muted-foreground">No asset selected</p>
              <p className="mt-1 text-[12px] text-muted-foreground/60">
                Select an asset from the list to view details
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Create / Edit dialog ── */}
      <AssetFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        asset={editingAsset}
        onSaved={handleSaved}
      />
    </div>
  );
}