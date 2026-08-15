"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Boxes, ChevronRight, Radio, Box, AlertCircle, RefreshCw, Plus } from "lucide-react";
import { toast } from "@/lib/customToast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import PredictiXLoader from "@/components/loading/PredictiXLoader";

import AssetsSummary from "@/components/admin/assets/AssetsSummary";
import AssetsAnalytics from "@/components/admin/assets/AssetsAnalytics";
import AssignAssetDialog from "@/components/admin/assets/AssignAssetDialog";
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
  // Deep link support. ?asset_id=<uuid>, used by the dashboard's Top Risk
  // list, selects that asset directly whatever page it sits on. The list's own
  // auto-select effect below must not override it.
  const searchParams = useSearchParams();
  const currentDeepLink = searchParams.get("asset_id");

  React.useEffect(() => {
    if (currentDeepLink) {
      setSelectedId(currentDeepLink);
    }
  }, [currentDeepLink]);

  const [hasDeepLinked, setHasDeepLinked] = React.useState(!!currentDeepLink);

  // Assignment dialog. The page owns it so the detail panel stays presentational,
  // matching how the report modal is handled.
  const [assignTarget, setAssignTarget] = React.useState<{
    id: string; name: string; code: string; assignedTo: string | null;
  } | null>(null);

  // ── Asset list state, 50 rows per page ────────────────────────────────────────
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
  const [selectedId, setSelectedId] = React.useState<string | null>(currentDeepLink);
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
  const [statsLoading, setStatsLoading] = React.useState(true);
  const [statsError, setStatsError] = React.useState<string | null>(null);

  const loadStatsAndWarehouses = React.useCallback(async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const [statsData, analyticsData, whOptions] = await Promise.all([
        getAssetStats(),
        getAssetAnalytics(),
        getWarehouseOptions(),
      ]);
      setStats(statsData);
      setAnalytics(analyticsData);
      setWarehouseOptions(whOptions.map((w) => ({ value: w.id, label: w.name })));
      if (statsData) {
        window.localStorage.setItem("predictix.cached_asset_stats", JSON.stringify(statsData));
      }
      if (analyticsData) {
        window.localStorage.setItem("predictix.cached_asset_analytics", JSON.stringify(analyticsData));
      }
    } catch (e: unknown) {
      // Record the failure so the cards can show an error state. Leaving
      // stats null would keep them on the loading skeleton forever.
      const message = e instanceof Error ? e.message : "Failed to load fleet stats";
      console.warn("Failed to load asset stats / warehouse options:", message);
      setStatsError(message);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadStatsAndWarehouses();
  }, [loadStatsAndWarehouses]);

  // Reset to page 1 when filters change, otherwise a search made on page 3
  // shows nothing while still claiming to be on page 3.
  React.useEffect(() => {
    setPage(1);
  }, [filters]);

  // A deep-linked selection stays pinned until the user moves off it, either
  // by clicking another row or by changing the filters or page. The first run
  // is skipped so a fresh ?asset_id= link is not cleared before the list loads.
  const isFirstFilterPageRun = React.useRef(true);
  React.useEffect(() => {
    if (isFirstFilterPageRun.current) {
      isFirstFilterPageRun.current = false;
      return;
    }
    setHasDeepLinked(false);
  }, [filters, page]);

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

        // Select the first row when the current selection is not on this page.
        // A deep-linked asset is exempt, since it may legitimately sit on a
        // different page of the list.
        if (!hasDeepLinked && (!selectedId || !data.find((a) => a.id === selectedId))) {
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
  const loadDetail = React.useCallback(async (id: string, signal?: { cancelled: boolean }) => {
    setDetailLoading(true);
    setDetailError(null);
    try {
      const d = await getAssetDetail(id);
      if (!signal?.cancelled) setDetail(d);
    } catch (e: unknown) {
      if (!signal?.cancelled)
        setDetailError(e instanceof Error ? e.message : "Failed to load asset details");
    } finally {
      if (!signal?.cancelled) setDetailLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    const signal = { cancelled: false };
    loadDetail(selectedId, signal);
    return () => { signal.cancelled = true; };
  }, [selectedId, loadDetail]);

  // ── Refresh detail ────────────────────────────────────────────────────────────
  // Refetches the selected asset directly. Re-setting selectedId to the same
  // value would not re-run the load effect, leaving the panel showing stale
  // data after actions like Run AI or Log Maintenance.
  function refreshDetail() {
    if (!selectedId) return;
    loadDetail(selectedId);
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

  // ── Fleet-wide stats for the hero header, independent of the current page ─────
  const criticalCount = stats?.critical ?? 0;
  const avgHealth = stats?.avgHealth ?? 0;
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

      {/* ── Stats/analytics error ── */}
      {statsError && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-500/10 px-5 py-4 text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Failed to load fleet stats: {statsError}</span>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto h-7 rounded-lg gap-1.5 text-xs text-red-700 dark:text-red-400 hover:text-red-800"
            onClick={loadStatsAndWarehouses}
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
                onSelect={(id) => {
                  setHasDeepLinked(false);
                  setSelectedId(id);
                }}
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
                onClick={refreshDetail}
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
              onAssign={(a) =>
                setAssignTarget({
                  id: a.id,
                  name: a.asset_name,
                  code: a.asset_code,
                  assignedTo: a.assigned_to ?? null,
                })
              }
              warehouseOptions={warehouseOptions}
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

      {/* ── Assign dialog ── */}
      {assignTarget && (
        <AssignAssetDialog
          open
          onOpenChange={(open) => {
            if (!open) setAssignTarget(null);
          }}
          assetId={assignTarget.id}
          assetName={assignTarget.name}
          assetCode={assignTarget.code}
          currentAssigneeId={assignTarget.assignedTo}
          onAssigned={() => {
            // Refresh both: the panel shows the new assignee, and the list's
            // assignment filter and counts depend on it.
            invalidateAssetListCache();
            refreshDetail();
            setAssignTarget(null);
          }}
        />
      )}
    </div>
  );
}
