"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, FileText } from "lucide-react";

import WarehouseOverviewCards from "@/components/admin/warehouse/WarehouseOverviewCards";
import WarehouseInsightsSection from "@/components/admin/warehouse/WarehouseInsightsSection";

export default function WarehousePage() {
  const [data, setData] = React.useState<any>(null);
  const [refreshing, setRefreshing] = React.useState(true);

  async function fetchData() {
    setRefreshing(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/warehouse-dashboard/summary");
      const result = await response.json();
      setData(result);
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  }

  React.useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Warehouse</h1>
          <p className="text-sm text-muted-foreground">
            Overview of asset health, tickets, and predictive maintenance signals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={fetchData} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button variant="secondary">
            <FileText className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>

      <WarehouseOverviewCards data={data?.kpis} isLoading={refreshing && !data} />

      {data && <WarehouseInsightsSection data={data} />}

      <div className="h-20" />
    </div>
  );
}