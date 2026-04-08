"use client";

import * as React from "react";
import AssetsSummary from "@/components/admin/assets/AssetsSummary";
import AssetsToolbar, {
  // Remove the duplicate import
} from "@/components/admin/assets/AssetsToolbar";
import AssetsTable from "@/components/admin/assets/AssetsTable";
import AssetDetailsPanel from "@/components/admin/assets/AssetDetailsPanel";
import { ASSETS } from "@/components/admin/assets/mock";
// Ensure that AssetFilters is defined and exported
export type AssetFilters = {
  query: string;
  status: string;
  healthBand: string;
  warehouse: string;
};

// Other type definitions...
import { Box } from "lucide-react";

function getHealthBand(score: number) {
  if (score >= 80) return "excellent";
  if (score >= 60) return "good";
  if (score >= 40) return "moderate";
  if (score >= 20) return "poor";
  return "critical";
}

function matchesQuery(asset: any, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const searchableValues = [
    asset.id,
    asset.assetName,
    asset.assetCode,
    asset.description,
    asset.warehouse.name,
    asset.assignedTo?.name,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return searchableValues.includes(q);
}

function applyFilters(assets: any[], filters: AssetFilters) {
  return assets.filter((asset) => {
    const queryMatch = matchesQuery(asset, filters.query);
    const statusMatch =
      filters.status === "all" ? true : asset.status === filters.status;
    const healthBandMatch =
      filters.healthBand === "all"
        ? true
        : getHealthBand(asset.prediction?.healthScore ?? 0) === filters.healthBand;
    const warehouseMatch =
      filters.warehouse === "all"
        ? true
        : asset.warehouse.id === filters.warehouse;

    return queryMatch && statusMatch && healthBandMatch && warehouseMatch;
  });
}

export default function AdminAssetsPage() {
  const [filters, setFilters] = React.useState<AssetFilters>({
    query: "",
    status: "all",
    healthBand: "all",
    warehouse: "all",
  });

  const warehouseOptions = React.useMemo(() => {
    const seen = new Map<string, string>();

    ASSETS.forEach((asset) => {
      seen.set(asset.warehouse.id, asset.warehouse.name);
    });

    return Array.from(seen.entries()).map(([value, label]) => ({
      value,
      label,
    }));
  }, []);

  const filteredAssets = React.useMemo(
    () => applyFilters(ASSETS, filters),
    [filters]
  );

  const [selectedId, setSelectedId] = React.useState<string | null>(
    ASSETS[0]?.id ?? null
  );

  React.useEffect(() => {
    if (!filteredAssets.length) {
      setSelectedId(null);
      return;
    }

    if (selectedId && filteredAssets.some((asset) => asset.id === selectedId)) {
      return;
    }

    setSelectedId(filteredAssets[0].id);
  }, [filteredAssets, selectedId]);

  const selectedAsset = React.useMemo(
    () => filteredAssets.find((asset) => asset.id === selectedId) ?? null,
    [filteredAssets, selectedId]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1.5 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Assets</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Monitor fleet health, maintenance state, and predictive insights
            across all warehouses.
          </p>
        </div>
      </div>

      <AssetsSummary assets={filteredAssets} />

      <AssetsToolbar
        filters={filters}
        setFilters={setFilters}
        resultsCount={filteredAssets.length}
        warehouseOptions={warehouseOptions}
      />

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 xl:col-span-5">
          <AssetsTable
            assets={filteredAssets}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>

        <div className="col-span-12 xl:col-span-7">
          {selectedAsset ? (
            <AssetDetailsPanel asset={selectedAsset} />
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-border/40 bg-card/80 px-6 py-20 text-center backdrop-blur-xl">
              <Box className="mb-4 h-12 w-12 text-muted-foreground/20" />
              <p className="text-sm font-medium text-muted-foreground">
                No asset selected
              </p>
              <p className="mt-1 text-[12px] text-muted-foreground/60">
                Select an asset from the list to view its details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}