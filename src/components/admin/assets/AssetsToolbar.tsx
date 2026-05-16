"use client";

import * as React from "react";
import { Search, RotateCcw, Plus, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AssetStatus } from "./types";

export type AssetFilters = {
  query: string;
  status: AssetStatus | "all";
  healthBand: "all" | "excellent" | "good" | "moderate" | "poor" | "critical";
  warehouse: string;
};

type WarehouseOption = { value: string; label: string };

type Props = {
  filters: AssetFilters;
  setFilters: React.Dispatch<React.SetStateAction<AssetFilters>>;
  resultsCount: number;
  warehouseOptions: WarehouseOption[];
};

const DEFAULT_FILTERS: AssetFilters = {
  query: "",
  status: "all",
  healthBand: "all",
  warehouse: "all",
};

export default function AssetsToolbar({
  filters,
  setFilters,
  resultsCount,
  warehouseOptions,
}: Props) {
  const isDirty =
    filters.query !== "" ||
    filters.status !== "all" ||
    filters.healthBand !== "all" ||
    filters.warehouse !== "all";

  return (
    <div className="card-dynamic rounded-2xl border border-slate-200 dark:border-slate-700 bg-card p-4 transition-all">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        {/* Left: filters */}
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              className="h-9 rounded-xl pl-8 text-sm bg-background/60 dark:bg-white/[0.04] border-slate-200 dark:border-slate-700"
              placeholder="Search assets…"
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
              setFilters((prev) => ({
                ...prev,
                status: v as AssetFilters["status"],
              }))
            }
          >
            <SelectTrigger className="h-9 w-[148px] rounded-xl text-sm bg-background/60 dark:bg-white/[0.04] border-slate-200 dark:border-slate-700">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="OPERATIONAL">Operational</SelectItem>
              <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
              <SelectItem value="CRITICAL">Critical</SelectItem>
              <SelectItem value="OFFLINE">Offline</SelectItem>
            </SelectContent>
          </Select>

          {/* Health Band */}
          <Select
            value={filters.healthBand}
            onValueChange={(v) =>
              setFilters((prev) => ({
                ...prev,
                healthBand: v as AssetFilters["healthBand"],
              }))
            }
          >
            <SelectTrigger className="h-9 w-[158px] rounded-xl text-sm bg-background/60 dark:bg-white/[0.04] border-slate-200 dark:border-slate-700">
              <SelectValue placeholder="Health" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Health</SelectItem>
              <SelectItem value="excellent">Excellent (80–100)</SelectItem>
              <SelectItem value="good">Good (60–79)</SelectItem>
              <SelectItem value="moderate">Moderate (40–59)</SelectItem>
              <SelectItem value="poor">Poor (20–39)</SelectItem>
              <SelectItem value="critical">Critical (0–19)</SelectItem>
            </SelectContent>
          </Select>

          {/* Warehouse */}
          <Select
            value={filters.warehouse}
            onValueChange={(v) =>
              setFilters((prev) => ({ ...prev, warehouse: v }))
            }
          >
            <SelectTrigger className="h-9 w-[158px] rounded-xl text-sm bg-background/60 dark:bg-white/[0.04] border-slate-200 dark:border-slate-700">
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

          {/* Result count pill */}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-muted/40 dark:bg-white/[0.04] px-3 py-1 text-xs font-medium text-muted-foreground">
            <SlidersHorizontal className="h-3 w-3" />
            {resultsCount} asset{resultsCount !== 1 ? "s" : ""}
          </span>

          {/* Reset — only visible when filters are dirty */}
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

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          <Button className="h-9 rounded-xl px-4 text-sm gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Add Asset
          </Button>
        </div>
      </div>
    </div>
  );
}