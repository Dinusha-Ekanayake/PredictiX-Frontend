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
import { Plus, RotateCcw, Search } from "lucide-react";

export type AssetFilters = {
  query: string;
  status: string;
  healthBand: string;
  warehouse: string;
};

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
                value={filters.query}
                onChange={(e) =>
                  setFilters({ ...filters, query: e.target.value })
                }
              />
            </div>

            {/* Filter dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    status: value,
                  })
                }
              >
                <SelectTrigger className="h-9 w-[140px] rounded-xl border-border/40 bg-background/50 text-[13px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="OPERATIONAL">Operational</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                  <SelectItem value="OFFLINE">Offline</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.healthBand}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    healthBand: value,
                  })
                }
              >
                <SelectTrigger className="h-9 w-[140px] rounded-xl border-border/40 bg-background/50 text-[13px]">
                  <SelectValue placeholder="Health" />
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
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
