"use client";

import * as React from "react";
import AssetsSummary from "@/components/admin/assets/AssetsSummary";

import AssetsToolbar from "@/components/admin/assets/AssetsToolbar";
import AssetsTable from "@/components/admin/assets/AssetsTable";
import AssetDetailsPanel from "@/components/admin/assets/AssetDetailsPanel";
import { ASSETS } from "@/components/admin/assets/mock";
import type { AssetFilters, AssetRecord } from "@/components/admin/assets/types";

function matchesQuery(asset: AssetRecord, query: string) {

  const q = query.trim().toLowerCase();
  if (!q) return true;

  const searchableValues = [

    asset.assetCode,
    asset.assetName,
    asset.assetType,
    asset.category,
    asset.vehicleType,
    asset.make,
    asset.model,
    asset.makeModel,
    asset.registrationNumber,
    asset.vin,
    asset.warehouse.code,
    asset.warehouse.name,
    asset.assignedTo?.name,

  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return searchableValues.includes(q);
}


function applyFilters(assets: AssetRecord[], filters: AssetFilters) {
r
  return assets.filter((asset) => {
    const queryMatch = matchesQuery(asset, filters.query);
    const statusMatch =
      filters.status === "all" ? true : asset.status === filters.status;
    const healthBandMatch =
      filters.healthBand === "all"
        ? true

        : asset.healthBand === filters.healthBand;
    const warehouseMatch =
      filters.warehouse === "all"
        ? true
        : asset.warehouse.code === filters.warehouse;


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

      seen.set(asset.warehouse.code, asset.warehouse.name);

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

 master
  const selectedAsset = React.useMemo(
    () => filteredAssets.find((asset) => asset.id === selectedId) ?? null,
    [filteredAssets, selectedId]
  );

  return (

    <div className="space-y-8">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Assets</h1>
          <p className="text-sm text-muted-foreground">
            Monitor vehicle health, warehouse coverage, maintenance state, and predictive insights.

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


      <div className="grid grid-cols-12 gap-6">

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

            <div className="rounded-2xl border border-border/60 bg-card/90 p-6 text-sm text-muted-foreground backdrop-blur-sm">
              No asset selected.

            </div>
          )}
        </div>
      </div>
    </div>
  );
}