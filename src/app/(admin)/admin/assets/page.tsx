"use client";

import * as React from "react";
import AssetsSummary from "@/components/admin/assets/AssetsSummary";
import AssetsToolbar, { type AssetFilters } from "@/components/admin/assets/AssetsToolbar";
import AssetsTable from "@/components/admin/assets/AssetsTable";
import AssetDetailsPanel from "@/components/admin/assets/AssetDetailsPanel";

import { ASSETS } from "@/components/admin/assets/mock";
import type { Asset } from "@/components/admin/assets/types";

function applyFilters(assets: Asset[], f: AssetFilters) {
  const q = f.q.trim().toLowerCase();

  return assets.filter((a) => {
    const matchesQ =
      !q ||
      a.id.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.warehouse.name.toLowerCase().includes(q) ||
      a.location.toLowerCase().includes(q) ||
      (a.assignedPerson?.name.toLowerCase().includes(q) ?? false);

    const matchesStatus = f.status === "ALL" ? true : a.status === f.status;

    const matchesAssigned =
      f.assigned === "ALL"
        ? true
        : f.assigned === "ASSIGNED"
        ? a.assignedPerson !== null
        : a.assignedPerson === null;

    const matchesWarehouse =
      f.warehouse === "ALL" ? true : a.warehouse.id === f.warehouse;

    return matchesQ && matchesStatus && matchesAssigned && matchesWarehouse;
  });
}

export default function AdminAssetsPage() {
  const [filters, setFilters] = React.useState<AssetFilters>({
    q: "",
    status: "ALL",
    assigned: "ALL",
    warehouse: "ALL",
  });

  const filtered = React.useMemo(() => applyFilters(ASSETS, filters), [filters]);

  const [selectedId, setSelectedId] = React.useState<string | null>(
    filtered[0]?.id ?? null
  );

  React.useEffect(() => {
    if (selectedId && filtered.some((a) => a.id === selectedId)) return;
    setSelectedId(filtered[0]?.id ?? null);
  }, [filtered, selectedId]);

  const selected = React.useMemo(
    () => filtered.find((a) => a.id === selectedId) ?? null,
    [filtered, selectedId]
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Assets</h1>
          <p className="text-sm text-muted-foreground">
            Manage asset lifecycle, maintenance schedules, predictive insights, and history.
          </p>
        </div>
      </div>

      {/* KPI row */}
      <AssetsSummary assets={ASSETS} />

      {/* Filters */}
      <AssetsToolbar
        filters={filters}
        setFilters={setFilters}
        resultsCount={filtered.length}
      />

      {/* Main split */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 xl:col-span-5">
          <AssetsTable
            assets={filtered}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>

        <div className="col-span-12 xl:col-span-7">
          {selected ? (
            <AssetDetailsPanel asset={selected} />
          ) : (
            <div className="rounded-2xl border bg-background p-6 text-sm text-muted-foreground">
              No asset selected.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
