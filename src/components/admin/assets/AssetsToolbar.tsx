"use client";

import * as React from "react";
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

import { FileText, Loader2, Plus } from "lucide-react";
import type { Asset, AssetStatus } from "./types";
import AddAssetDialog from "./AddAssetDialog";

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
  onAssetAdded: (asset: Asset) => void;
  selectedAssetId: string | null; // ← the selected asset's real DB UUID
};

export default function AssetsToolbar({
  filters,
  setFilters,
  resultsCount,
  warehouseOptions,
  onAssetAdded,
  selectedAssetId,
}: AssetsToolbarProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);

  // ── Generate Report ───────────────────────────────────────────────
  const handleGenerateReport = async () => {
    if (!selectedAssetId) {
      alert("Please select an asset first.");
      return;
    }

    setIsGenerating(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

      const response = await fetch(
        `${API_URL}/asset-reports/${selectedAssetId}`,
        { method: "POST" }
      );

      if (!response.ok) {
        // Try to parse error as JSON
        let errorMsg = "Failed to generate report";
        try {
          const err = await response.json();
          errorMsg = err.detail ?? errorMsg;
        } catch {
          errorMsg = `Server error: ${response.status}`;
        }
        throw new Error(errorMsg);
      }

      // ── Backend returns raw PDF bytes — convert to downloadable file ──
      const blob = await response.blob();                        // get binary data
      const url = window.URL.createObjectURL(blob);            // create temp URL
      const link = document.createElement("a");                 // make invisible link
      link.href = url;
      link.download = `Asset_Report_${selectedAssetId}.pdf`;    // filename for download
      document.body.appendChild(link);
      link.click();                                             // trigger download
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);                          // clean up temp URL

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
            <div className="grid flex-1 grid-cols-12 gap-3">

              {/* Search */}
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

              {/* Status filter */}
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

              {/* Health filter */}
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

              {/* Warehouse filter */}
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

              {/* Reset */}
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

              {/* Generate Report */}
              <Button
                variant="secondary"
                className="h-10 rounded-xl px-4"
                onClick={handleGenerateReport}
                disabled={isGenerating || !selectedAssetId}
                title={!selectedAssetId ? "Select an asset first" : "Generate PDF report"}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Report
                  </>
                )}
              </Button>

              {/* Add Asset */}
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="h-10 rounded-xl px-4"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Asset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AddAssetDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAssetAdded={onAssetAdded}
      />
    </>
  );
}