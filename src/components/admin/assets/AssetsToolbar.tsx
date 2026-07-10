"use client";

import * as React from "react";
import { Search, RotateCcw, Plus, SlidersHorizontal, ArrowUp, ArrowDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AssetFilters, AssetSortBy } from "./types";

type WarehouseOption = { value: string; label: string };

type Props = {
  filters: AssetFilters;
  setFilters: React.Dispatch<React.SetStateAction<AssetFilters>>;
  resultsCount: number;
  warehouseOptions: WarehouseOption[];
  loading?: boolean;
  onAddAsset?: () => void;
  selectedAssetId?: string | null;
  selectedAssetName?: string;
};

export const DEFAULT_FILTERS: AssetFilters = {
  query: "",
  status: "all",
  health_band: "all",
  warehouse_id: "all",
  sort_by: "created_at",
  sort_order: "desc",
};

const SORT_OPTIONS: { value: AssetSortBy; label: string }[] = [
  { value: "created_at", label: "Date Added" },
  { value: "updated_at", label: "Last Updated" },
  { value: "asset_name", label: "Name" },
  { value: "asset_code", label: "Asset Code" },
  { value: "status", label: "Status" },
  { value: "vehicle_type", label: "Vehicle Type" },
  { value: "make", label: "Make" },
  { value: "manufacture_year", label: "Manufacture Year" },
  { value: "current_mileage", label: "Mileage" },
  { value: "criticality_score", label: "Criticality Score" },
  { value: "payload_capacity_kg", label: "Payload Capacity" },
];

export default function AssetsToolbar({
  filters,
  setFilters,
  resultsCount,
  warehouseOptions,
  loading,
  onAddAsset,
  selectedAssetId,
  selectedAssetName,
}: Props) {
  const isDirty =
    filters.query !== "" ||
    filters.status !== "all" ||
    filters.health_band !== "all" ||
    filters.warehouse_id !== "all" ||
    filters.sort_by !== DEFAULT_FILTERS.sort_by ||
    filters.sort_order !== DEFAULT_FILTERS.sort_order;

  return (
    <>
      <div className="card-dynamic rounded-2xl border border-slate-200 dark:border-slate-700 bg-card p-4 transition-all">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          {/* Filters */}
          <div className="flex flex-1 flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative flex-1 min-w-50 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                className="h-9 rounded-xl pl-8 text-sm bg-background/60 dark:bg-white/4 border-slate-200 dark:border-slate-700"
                placeholder="Search by name, code, VIN…"
                value={filters.query}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, query: e.target.value }))
                }
              />
            </div>

            {/* Status */}
            <Select
              value={filters.status}
              onValueChange={(v) =>
                setFilters((prev) => ({ ...prev, status: v }))
              }
            >
              <SelectTrigger className="h-9 w-36 rounded-xl text-sm bg-background/60 dark:bg-white/4 border-slate-200 dark:border-slate-700">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="under_maintenance">Under Maintenance</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="decommissioned">Decommissioned</SelectItem>
              </SelectContent>
            </Select>

            {/* Health Band */}
            <Select
              value={filters.health_band}
              onValueChange={(v) =>
                setFilters((prev) => ({ ...prev, health_band: v }))
              }
            >
              <SelectTrigger className="h-9 w-40 rounded-xl text-sm bg-background/60 dark:bg-white/4 border-slate-200 dark:border-slate-700">
                <SelectValue placeholder="Health Band" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Health</SelectItem>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="poor">Poor</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>

            {/* Warehouse */}
            <Select
              value={filters.warehouse_id}
              onValueChange={(v) =>
                setFilters((prev) => ({ ...prev, warehouse_id: v }))
              }
            >
              <SelectTrigger className="h-9 w-40 rounded-xl text-sm bg-background/60 dark:bg-white/4 border-slate-200 dark:border-slate-700">
                <SelectValue placeholder="Warehouse" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Warehouses</SelectItem>
                {warehouseOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select
              value={filters.sort_by}
              onValueChange={(v) =>
                setFilters((prev) => ({ ...prev, sort_by: v as AssetSortBy }))
              }
            >
              <SelectTrigger className="h-9 w-44 rounded-xl text-sm bg-background/60 dark:bg-white/4 border-slate-200 dark:border-slate-700">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-xl shrink-0 border-slate-200 dark:border-slate-700"
              title={filters.sort_order === "asc" ? "Ascending" : "Descending"}
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  sort_order: prev.sort_order === "asc" ? "desc" : "asc",
                }))
              }
            >
              {filters.sort_order === "asc" ? (
                <ArrowUp className="h-3.5 w-3.5" />
              ) : (
                <ArrowDown className="h-3.5 w-3.5" />
              )}
            </Button>

            {/* Count pill */}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-muted/40 dark:bg-white/4 px-3 py-1 text-xs font-medium text-muted-foreground">
              <SlidersHorizontal className="h-3 w-3" />
              {loading ? "…" : `${resultsCount} asset${resultsCount !== 1 ? "s" : ""}`}
            </span>

            {isDirty && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 rounded-xl gap-1.5 text-xs"
                onClick={() => setFilters(DEFAULT_FILTERS)}
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </Button>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
<Button className="h-9 rounded-xl px-4 text-sm gap-1.5" onClick={onAddAsset}>
              <Plus className="h-3.5 w-3.5" />
              Add Asset
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
