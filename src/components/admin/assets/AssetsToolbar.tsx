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
import type { AssetFilters } from "./types";

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
  return (
    <Card className="rounded-2xl border-border/60 bg-card/90 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-12 xl:col-span-5">
              <Input
                className="h-10 rounded-xl"
                placeholder="Search by asset name, asset code, VIN, make, model..."
                value={filters.query}
                onChange={(e) =>
                  setFilters({ ...filters, query: e.target.value })
                }
              />
            </div>

            <div className="col-span-12 sm:col-span-4 xl:col-span-2">
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    status: value as AssetFilters["status"],
                  })
                }
              >
                <SelectTrigger className="h-9 w-[140px] rounded-xl border-border/40 bg-background/50 text-[13px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="under_maintenance">
                    Under Maintenance
                  </SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="decommissioned">Decommissioned</SelectItem>
                </SelectContent>
              </Select>

            <div className="col-span-12 sm:col-span-4 xl:col-span-2">
              <Select
                value={filters.healthBand}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    healthBand: value as AssetFilters["healthBand"],
                  })
                }
              >
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue placeholder="Health Band" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Health Bands</SelectItem>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>

            <div className="col-span-12 sm:col-span-4 xl:col-span-3">
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
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}