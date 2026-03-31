"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
<<<<<<< HEAD
import type { AssetFilters } from "./types";
=======
import { Plus, RotateCcw, Search } from "lucide-react";

export type AssetFilters = {
  query: string;
  status: string;
  healthBand: string;
  warehouse: string;
};
>>>>>>> 8fd9ee0d230ce884f4957d6664ed8fc3d212cbbb

type Props = {
  filters: AssetFilters;
  setFilters: (next: AssetFilters) => void;
  resultsCount: number;
  warehouseOptions: Array<{ value: string; label: string }>;
};

export default function AssetsToolbar({
  filters,
  setFilters,
  resultsCount,
  warehouseOptions,
}: Props) {
<<<<<<< HEAD
  return (
    <Card className="rounded-2xl border-border/60 bg-card/90 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-12 xl:col-span-5">
              <Input
                className="h-10 rounded-xl"
                placeholder="Search by asset name, asset code, VIN, make, model..."
=======
  const hasActiveFilters =
    filters.query !== "" ||
    filters.status !== "all" ||
    filters.healthBand !== "all" ||
    filters.warehouse !== "all";

  return (
    <Card className="rounded-2xl border-border/40 bg-card/80 backdrop-blur-xl">
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          {/* Top row: Search + Filters */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
              <Input
                className="h-10 rounded-xl border-border/40 bg-background/50 pl-10 transition-colors focus:bg-background"
                placeholder="Search assets..."
>>>>>>> 8fd9ee0d230ce884f4957d6664ed8fc3d212cbbb
                value={filters.query}
                onChange={(e) =>
                  setFilters({ ...filters, query: e.target.value })
                }
              />
            </div>

<<<<<<< HEAD
            <div className="col-span-12 sm:col-span-4 xl:col-span-2">
=======
            {/* Filter dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
>>>>>>> 8fd9ee0d230ce884f4957d6664ed8fc3d212cbbb
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
<<<<<<< HEAD
                    status: value as AssetFilters["status"],
=======
                    status: value,
>>>>>>> 8fd9ee0d230ce884f4957d6664ed8fc3d212cbbb
                  })
                }
              >
                <SelectTrigger className="h-9 w-[140px] rounded-xl border-border/40 bg-background/50 text-[13px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
<<<<<<< HEAD
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="under_maintenance">
                    Under Maintenance
                  </SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="decommissioned">Decommissioned</SelectItem>
=======
                  <SelectItem value="OPERATIONAL">Operational</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                  <SelectItem value="OFFLINE">Offline</SelectItem>
>>>>>>> 8fd9ee0d230ce884f4957d6664ed8fc3d212cbbb
                </SelectContent>
              </Select>

<<<<<<< HEAD
            <div className="col-span-12 sm:col-span-4 xl:col-span-2">
=======
>>>>>>> 8fd9ee0d230ce884f4957d6664ed8fc3d212cbbb
              <Select
                value={filters.healthBand}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
<<<<<<< HEAD
                    healthBand: value as AssetFilters["healthBand"],
                  })
                }
              >
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue placeholder="Health Band" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Health Bands</SelectItem>
=======
                    healthBand: value,
                  })
                }
              >
                <SelectTrigger className="h-9 w-[140px] rounded-xl border-border/40 bg-background/50 text-[13px]">
                  <SelectValue placeholder="Health" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Health</SelectItem>
>>>>>>> 8fd9ee0d230ce884f4957d6664ed8fc3d212cbbb
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>

<<<<<<< HEAD
            <div className="col-span-12 sm:col-span-4 xl:col-span-3">
=======
>>>>>>> 8fd9ee0d230ce884f4957d6664ed8fc3d212cbbb
              <Select
                value={filters.warehouse}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    warehouse: value,
                  })
                }
              >
                <SelectTrigger className="h-9 w-[160px] rounded-xl border-border/40 bg-background/50 text-[13px]">
                  <SelectValue placeholder="Warehouse" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Warehouses</SelectItem>
                  {warehouseOptions.map((warehouse) => (
                    <SelectItem key={warehouse.value} value={warehouse.value}>
                      {warehouse.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

<<<<<<< HEAD
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Badge variant="secondary" className="rounded-xl px-3 py-1">
              {resultsCount} assets found
            </Badge>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="h-10 rounded-xl"
                onClick={() =>
                  setFilters({
                    query: "",
                    status: "all",
                    healthBand: "all",
                    warehouse: "all",
                  })
                }
              >
                Reset
              </Button>

              <Button className="h-10 rounded-xl px-4">Add Asset</Button>
=======
          {/* Bottom row: count + actions */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="rounded-lg bg-muted/60 px-2.5 py-1 text-[12px] font-medium"
              >
                {resultsCount} {resultsCount === 1 ? "asset" : "assets"}
              </Badge>
              {hasActiveFilters && (
                <span className="text-[12px] text-muted-foreground/60">
                  filtered
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 rounded-xl px-3 text-[13px] text-muted-foreground"
                  onClick={() =>
                    setFilters({
                      query: "",
                      status: "all",
                      healthBand: "all",
                      warehouse: "all",
                    })
                  }
                >
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                  Reset
                </Button>
              )}

              <Button className="h-9 rounded-xl px-4 text-[13px]">
                <Plus className="mr-1.5 h-4 w-4" />
                Add Asset
              </Button>
>>>>>>> 8fd9ee0d230ce884f4957d6664ed8fc3d212cbbb
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}