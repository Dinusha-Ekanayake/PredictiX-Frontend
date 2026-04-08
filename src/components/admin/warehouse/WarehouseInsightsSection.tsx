"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import WarehouseKPIGrid from "@/components/admin/warehouse/WarehouseKPIGrid";
import CriticalAssetsTable from "@/components/admin/warehouse/CriticalAssetsTable";

import {
  HealthMaintenanceTrendsCard,
  AssetStatusDistributionCard,
  HealthScoreDistributionCard,
  AssetsByTypeCard,
} from "@/components/admin/warehouse/WarehouseAssetInsights";

import {
  TicketPriorityBreakdownCard,
  TicketsByCategoryCard,
  MonthlyTicketVolumeCard,
} from "@/components/admin/warehouse/WarehouseTicketInsights";

import WarehouseMaintenanceSchedule from "@/components/admin/warehouse/WarehouseMaintenanceSchedule";
import { getWarehouseSummary, WarehouseSummaryData } from "@/lib/warehouseService";

export default function WarehouseInsightsSection({ data: initialData }: { data?: any }) {
  const [data, setData] = useState<WarehouseSummaryData | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const summaryData = await getWarehouseSummary();
        setData(summaryData);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load warehouse data';
        setError(errorMessage);
        console.error('Warehouse data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if no initial data was provided
    if (!initialData) {
      fetchData();
    }
  }, [initialData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
        <span className="ml-2 text-slate-600">Loading warehouse data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
        <h3 className="font-semibold text-red-900 dark:text-red-200">Error Loading Data</h3>
        <p className="mt-1 text-sm text-red-800 dark:text-red-300">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* New KPI cards (Row 2) */}
      <WarehouseKPIGrid data={data?.kpiGrid} />

      {/* Previous charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <HealthMaintenanceTrendsCard data={data?.healthMaintenanceTrends} />
        <AssetStatusDistributionCard data={data?.assetStatus} />

        <HealthScoreDistributionCard data={data?.healthScoreDist} />
        <TicketPriorityBreakdownCard data={data?.ticketPriority} />

        <TicketsByCategoryCard data={data?.ticketsByCategory} />
        <AssetsByTypeCard data={data?.assetsByType} />

        <div className="lg:col-span-2">
          <WarehouseMaintenanceSchedule />
        </div>

        <div className="lg:col-span-2">
          <MonthlyTicketVolumeCard data={data?.monthlyTicketVolume} />
        </div>
      </div>

      {/* New table */}
      <CriticalAssetsTable data={data?.criticalAssets} />
    </div>
  );
}