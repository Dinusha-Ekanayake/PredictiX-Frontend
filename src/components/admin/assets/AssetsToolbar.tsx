"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { FileText, Loader2, Plus } from "lucide-react";

import type { AssetFilters, Asset } from "./types";
import AddAssetDialog from "./AddAssetDialog";

type WarehouseOption = {
  value: string;
  label: string;
};

type Props = {
  filters: AssetFilters;
  setFilters: React.Dispatch<React.SetStateAction<AssetFilters>>;
  resultsCount: number;
  warehouseOptions: WarehouseOption[];

  onAssetAdded: (asset: Asset) => void;
  selectedAssetId: string | null;
};

export default function AssetsToolbar({
  filters,
  setFilters,
  resultsCount,
  warehouseOptions,
  onAssetAdded,
  selectedAssetId,
}: Props) {
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);

  /* ── Generate PDF Report ───────────────────────────── */
  const handleGenerateReport = async () => {
    if (!selectedAssetId) {
      alert("Please select an asset first.");
      return;
    }

    setIsGenerating(true);

    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

      const res = await fetch(
        `${API_URL}/asset-reports/${selectedAssetId}`,
        { method: "POST" }
      );

      if (!res.ok) {
        let msg = "Failed to generate report";
        try {
          const err = await res.json();
          msg = err.detail ?? msg;
        } catch {
          msg = `Server error: ${res.status}`;
        }
        throw new Error(msg);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `Asset_Report_${selectedAssetId}.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Report generation failed:\n${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Card className="rounded-2xl">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            {/* ── Filters ── */}
            <div className="grid flex-1 grid-cols-12 gap-3">
              {/* Search */}
              <div className="col-span-12 lg:col-span-4">
                <Input
                  className="h-10 rounded-xl"
                  placeholder="Search assets by name, ID, warehouse, location..."
                  value={filters.query}
                  onChange={(e) =>
                    setFilters((p) => ({ ...p, query: e.target.value }))
                  }
                />
              </div>

              {/* Status */}
              <div className="col-span-12 sm:col-span-4 lg:col-span-2">
                <Select
                  value={filters.status}
                  onValueChange={(value) =>
                    setFilters((p) => ({
                      ...p,
                      status: value as AssetFilters["status"],
                    }))
                  }
                >
                  <SelectTrigger className="h-10 rounded-xl">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="OPERATIONAL">Operational</SelectItem>
                    <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                    <SelectItem value="OFFLINE">Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Health */}
              <div className="col-span-12 sm:col-span-4 lg:col-span-3">
                <Select
                  value={filters.health_band}
                  onValueChange={(value) =>
                    setFilters((p) => ({
                      ...p,
                      healthBand: value as AssetFilters["health_band"],
                    }))
                  }
                >
                  <SelectTrigger className="h-10 rounded-xl">
                    <SelectValue placeholder="Health" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Warehouse */}
              <div className="col-span-12 sm:col-span-4 lg:col-span-3">
                <Select
                  value={filters.warehouse}
                  onValueChange={(value) =>
                    setFilters((p) => ({ ...p, warehouse: value }))
                  }
                >
                  <SelectTrigger className="h-10 rounded-xl">
                    <SelectValue placeholder="Warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {warehouseOptions.map((w) => (
                      <SelectItem key={w.value} value={w.value}>
                        {w.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* ── Actions ── */}
            <div className="flex items-center gap-2 xl:justify-end">
              <span className="text-xs text-muted-foreground">
                {resultsCount} results
              </span>

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

              <Button
                variant="secondary"
                className="h-10 rounded-xl"
                disabled={isGenerating || !selectedAssetId}
                onClick={handleGenerateReport}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Report
                  </>
                )}
              </Button>

              <Button
                className="h-10 rounded-xl"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Asset Dialog */}
      <AddAssetDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAssetAdded={onAssetAdded}
      />
    </>
  );
}