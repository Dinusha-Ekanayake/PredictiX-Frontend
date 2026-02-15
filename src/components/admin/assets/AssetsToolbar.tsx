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
  q: string;
  status: AssetStatus | "ALL";
  assigned: "ALL" | "ASSIGNED" | "UNASSIGNED";
  warehouse: "ALL" | "WH-A" | "WH-B" | "WH-C";
};

export default function AssetsToolbar({
  filters,
  setFilters,
  resultsCount,
}: {
  filters: AssetFilters;
  setFilters: (next: AssetFilters) => void;
  resultsCount: number;
}) {
  return (
    <Card className="rounded-2xl">
      <CardContent className="p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          {/* Left cluster */}
          <div className="grid flex-1 grid-cols-12 gap-3">
            <div className="col-span-12 lg:col-span-5">
              <Input
                className="h-10 rounded-xl"
                placeholder="Search by ID, name, warehouse, location, assigned person..."
                value={filters.q}
                onChange={(e) => setFilters({ ...filters, q: e.target.value })}
              />
            </div>

            <div className="col-span-12 sm:col-span-6 lg:col-span-2">
              <Select
                value={filters.status}
                onValueChange={(v) => setFilters({ ...filters, status: v as any })}
              >
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="OPERATIONAL">Operational</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                  <SelectItem value="OFFLINE">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-12 sm:col-span-6 lg:col-span-2">
              <Select
                value={filters.assigned}
                onValueChange={(v) => setFilters({ ...filters, assigned: v as any })}
              >
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue placeholder="Assignment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="ASSIGNED">Assigned</SelectItem>
                  <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-12 lg:col-span-3">
              <Select
                value={filters.warehouse}
                onValueChange={(v) => setFilters({ ...filters, warehouse: v as any })}
              >
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue placeholder="Warehouse" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Warehouses</SelectItem>
                  <SelectItem value="WH-A">Warehouse A</SelectItem>
                  <SelectItem value="WH-B">Warehouse B</SelectItem>
                  <SelectItem value="WH-C">Warehouse C</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Right cluster */}
          <div className="flex items-center justify-between gap-2 xl:justify-end">
            <Badge variant="secondary" className="rounded-xl px-3 py-1">
              {resultsCount} results
            </Badge>

            <Button
              variant="outline"
              className="h-10 rounded-xl"
              onClick={() =>
                setFilters({ q: "", status: "ALL", assigned: "ALL", warehouse: "ALL" })
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
