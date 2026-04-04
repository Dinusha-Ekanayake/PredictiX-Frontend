"use client";

import * as React from "react";

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

export default function WarehouseInsightsSection({ data }: { data?: any }) {
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