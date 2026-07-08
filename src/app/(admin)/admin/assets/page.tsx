"use client";

import * as React from "react";
import { Boxes, ChevronRight, Radio, Box, AlertCircle, RefreshCw, Plus } from "lucide-react";
import { toast } from "@/lib/customToast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import PredictiXLoader from "@/components/loading/PredictiXLoader";

import AssetsSummary from "@/components/admin/assets/AssetsSummary";
import AssetsAnalytics from "@/components/admin/assets/AssetsAnalytics";
import AssetsToolbar, { DEFAULT_FILTERS } from "@/components/admin/assets/AssetsToolbar";
import AssetsTable from "@/components/admin/assets/AssetsTable";
import AssetDetailsPanel, { AssetDetailsSkeleton } from "@/components/admin/assets/AssetDetailsPanel";
import AssetFormDialog from "@/components/admin/assets/AssetFormDialog";
import AssetReportModal from "@/components/admin/assets/AssetReportModal";

import {
  listAssets,
  countAssets,
  getAssetStats,
  getAssetAnalytics,
  getAssetDetail,
  deleteAsset,
  getWarehouseOptions,
  invalidateAssetListCache,
  ASSETS_PAGE_SIZE,
} from "@/components/admin/assets/assetService";
import type {
  Asset,
  AssetListItem,
  AssetStats,
  AssetAnalytics,
  AssetDetail,
  AssetFilters,
} from "@/components/admin/assets/types";

/* ══════════════════════════════════════════════════════════════════════════════
   Page
   ══════════════════════════════════════════════════════════════════════════════ */
export default function AdminAssetsPage() {
  // ── Asset list state (paginated — 50 rows/page instead of the whole fleet) ─────
  const [filters, setFilters] = React.useState<AssetFilters>(DEFAULT_FILTERS);
  const [page, setPage] = React.useState(1);
  const [assets, setAssets] = React.useState<AssetListItem[]>([]);
  const [totalCount, setTotalCount] = React.useState(0);
  const [listLoading, setListLoading] = React.useState(true);
  const [listError, setListError] = React.useState<string | null>(null);
  // Distinguishes the very first load (full-page loader, same as every other
  // page in the app) from later filter/refresh loads (per-section skeletons).
  const [initialLoad, setInitialLoad] = React.useState(true);

  // ── Fleet-wide summary (independent of which page is shown) ────────────────────
  const [stats, setStats] = React.useState<AssetStats | null>(null);
  const [analytics, setAnalytics] = React.useState<AssetAnalytics | null>(null);

  // ── Warehouse filter options (real warehouse list, not derived from the page) ──
  const [warehouseOptions, setWarehouseOptions] = React.useState<
    { value: string; label: string }[]
  >([]);

  // ── Selected asset detail state ───────────────────────────────────────────────
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [detail, setDetail] = React.useState<AssetDetail | null>(null);
  const [detailLoading, setDetailLoading] = React.useState(false);
  const [detailError, setDetailError] = React.useState<string | null>(null);

  // ── Shared report modal state ─────────────────────────────────────────────────
  const [reportOpen, setReportOpen] = React.useState(false);
  const [reportAssetId, setReportAssetId] = React.useState<string | null>(null);
  const [reportAssetName, setReportAssetName] = React.useState<string | undefined>(undefined);

  function openReport(assetId: string, assetName?: string) {
    setReportAssetId(assetId);
    setReportAssetName(assetName);
    setReportOpen(true);
  }

  // ── Create/edit dialog state ──────────────────────────────────────────────────
  const [formOpen, setFormOpen] = React.useState(false);
  const [editingAsset, setEditingAsset] = React.useState<Asset | null>(null);

  // ── Warehouse options + fleet-wide stats: fetched once, refreshed after writes ──
  const loadStatsAndWarehouses = React.useCallback(async () => {
    try {
      const [statsData, analyticsData, whOptions] = await Promise.all([
        getAssetStats(),
        getAssetAnalytics(),
        getWarehouseOptions(),
      ]);
      setStats(statsData);
      setAnalytics(analyticsData);
      setWarehouseOptions(whOptions.map((w) => ({ value: w.id, label: w.name })));
    } catch (e: unknown) {
      console.warn("Failed to load asset stats / warehouse options:", e instanceof Error ? e.message : e);
    }
  }, []);

  React.useEffect(() => {
    loadStatsAndWarehouses();
  }, [loadStatsAndWarehouses]);

  // Reset to page 1 whenever filters change (a filter change invalidates the
  // current page — searching for something on page 3 would otherwise show
  // nothing while still claiming to be "page 3").
  React.useEffect(() => {
    setPage(1);
  }, [filters]);

  // ── Load one page of the asset list whenever filters or page change ────────────
  React.useEffect(() => {
    let cancelled = false;
    const delay = filters.query ? 350 : 0;

    const timer = setTimeout(async () => {
      setListLoading(true);
      setListError(null);
      try {
        const [data, count] = await Promise.all([
          listAssets(filters, page, ASSETS_PAGE_SIZE),
          countAssets(filters),
        ]);
        if (cancelled) return;
        setAssets(data);
        setTotalCount(count);

        // Auto-select first asset on this page if current selection isn't on it
        if (!selectedId || !data.find((a) => a.id === selectedId)) {
          setSelectedId(data[0]?.id ?? null);
        }
      } catch (e: unknown) {
        if (!cancelled) setListError(e instanceof Error ? e.message : "Failed to load assets");
      } finally {
        if (!cancelled) {
          setListLoading(false);
          setInitialLoad(false);
        }
      }
    }, delay);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page]);

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

  // ── Refresh detail ────────────────────────────────────────────────────────────
  function refreshDetail() {
    if (!selectedId) return;
    setSelectedId((id) => id);
  }

  // ── Delete handler ────────────────────────────────────────────────────────────
  // Re-fetches the current page + stats rather than patching the paginated
  // array client-side, so the total count and page contents stay accurate.
  async function handleDelete(id: string) {
    if (!confirm("Delete this asset? This cannot be undone.")) return;
    try {
      await deleteAsset(id);
      if (selectedId === id) setSelectedId(null);
      invalidateAssetListCache();
      setFilters((f) => ({ ...f })); // triggers the list effect to refetch
      loadStatsAndWarehouses();
      toast.success("Asset deleted");
    } catch (e: unknown) {
      toast.error("Delete failed", { description: e instanceof Error ? e.message : undefined });
    }
  }

  // ── Create/edit handlers ──────────────────────────────────────────────────────
  function openCreate() {
    setEditingAsset(null);
    setFormOpen(true);
  }
  function openEdit(asset: Asset) {
    setEditingAsset(asset);
    setFormOpen(true);
  }
  function handleSaved(saved: Asset) {
    setSelectedId(saved.id);
    invalidateAssetListCache();
    setFilters((f) => ({ ...f })); // triggers the list effect to refetch this page
    loadStatsAndWarehouses();
  }

  // ── Fleet-wide stats for hero header (from /assets/stats — independent of page) ─
  const criticalCount = stats?.critical ?? 0;
  const avgHealth = stats?.avgHealth ?? 0;
  const statsLoading = stats === null;
  const totalPages = Math.max(1, Math.ceil(totalCount / ASSETS_PAGE_SIZE));

  if (initialLoad) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <PredictiXLoader label="Loading assets…" />
      </div>
    );
  }

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
            {statsLoading ? (
              <Skeleton className="h-7 w-24 rounded-full" />
            ) : (
              <>
                <Badge variant="outline" className="gap-1.5 rounded-full px-3 py-1 text-xs font-medium border-slate-200 dark:border-slate-700 bg-background/60 dark:bg-white/4">
                  <Boxes className="h-3 w-3" />
                  {stats?.total ?? 0} assets
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
      <AssetsSummary stats={stats} loading={statsLoading} />

      {/* ── Descriptive Analytics ── */}
      <AssetsAnalytics analytics={analytics} loading={statsLoading} />

      {/* ── Toolbar ── */}
      <AssetsToolbar
        filters={filters}
        setFilters={setFilters}
        resultsCount={totalCount}
        warehouseOptions={warehouseOptions}
        loading={listLoading}
        onAddAsset={openCreate}
        selectedAssetId={selectedId}
        selectedAssetName={detail?.asset?.asset_name}
      />

      {/* ── Table + Details ── */}
      <div className="grid grid-cols-12 gap-5">
        {/* List */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-2">
          <div className="relative h-[520px] lg:h-auto lg:flex-1">
            <div className="h-full w-full lg:absolute lg:inset-0">
              <AssetsTable
                assets={assets}
                selectedId={selectedId}
                onSelect={setSelectedId}
                loading={listLoading}
              />
            </div>
          </div>

          {/* ── Pagination controls ── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-card px-3 py-2 text-xs text-muted-foreground">
              <span>
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 rounded-lg px-2 text-xs"
                  disabled={page <= 1 || listLoading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Prev
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 rounded-lg px-2 text-xs"
                  disabled={page >= totalPages || listLoading}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Detail panel */}
        <div className="col-span-12 lg:col-span-7">
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
              onReport={() => openReport(detail.asset.id, detail.asset.asset_name)}
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

      {/* ── Shared Report Modal ── */}
      <AssetReportModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        assetId={reportAssetId}
        assetName={reportAssetName}
      />

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
