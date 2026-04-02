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

export default function WarehouseInsightsSection() {
  return (
    <div className="space-y-6">
      {/* New KPI cards */}
      <WarehouseKPIGrid />

      {/* Previous charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <HealthMaintenanceTrendsCard />
        <AssetStatusDistributionCard />

        <HealthScoreDistributionCard />
        <TicketPriorityBreakdownCard />

        <TicketsByCategoryCard />
        <AssetsByTypeCard />

        <div className="lg:col-span-2">
          <WarehouseMaintenanceSchedule />
        </div>

        <div className="lg:col-span-2">
          <MonthlyTicketVolumeCard />
        </div>
      </div>

      {/* New table */}
      <CriticalAssetsTable />
    </div>
  );
}