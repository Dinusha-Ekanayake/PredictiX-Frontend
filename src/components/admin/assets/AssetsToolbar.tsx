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

import type { AssetStatus } from "./types";

export type AssetFilters = {
  query: string;
  status: AssetStatus | "all";
  healthBand: "all" | "excellent" | "good" | "moderate" | "poor" | "critical";
  warehouse: string;
};

type WarehouseOption = {
  value: string;
  label: string;
};

type AssetsToolbarProps = {
  filters: AssetFilters;
  setFilters: React.Dispatch<React.SetStateAction<AssetFilters>>;
  resultsCount: number;
  warehouseOptions: WarehouseOption[];
};

export default function AssetsToolbar({
  filters,
  setFilters,
  resultsCount,
  warehouseOptions,
}: AssetsToolbarProps) {
  return (
    <Card className="rounded-2xl">
      <CardContent className="p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="grid flex-1 grid-cols-12 gap-3">
            <div className="col-span-12 lg:col-span-4">
              <Input
                className="h-10 rounded-xl"
                placeholder="Search by ID, name, warehouse, location, assigned person..."
                value={filters.query}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, query: e.target.value }))
                }
              />
            </div>

            <div className="col-span-12 sm:col-span-4 lg:col-span-2">
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    status: value as AssetFilters["status"],
                  }))
                }
              >
                <SelectTrigger className="h-10 rounded-xl">
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
            </div>

            <div className="col-span-12 sm:col-span-4 lg:col-span-3">
              <Select
                value={filters.healthBand}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    healthBand: value as AssetFilters["healthBand"],
                  }))
                }
              >
                <SelectTrigger className="h-10 rounded-xl">
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
            </div>

            <div className="col-span-12 sm:col-span-4 lg:col-span-3">
              <Select
                value={filters.warehouse}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, warehouse: value }))
                }
              >
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue placeholder="Warehouse" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Warehouses</SelectItem>
                  {warehouseOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 xl:justify-end">
            <Badge variant="secondary" className="rounded-xl px-3 py-1">
              {resultsCount} results
            </Badge>

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
      </CardContent>
    </Card>
  );
}