"use client";

import * as React from "react";

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
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Row 1 */}
      <HealthMaintenanceTrendsCard />
      <AssetStatusDistributionCard />

      {/* Row 2 */}
      <HealthScoreDistributionCard />
      <TicketPriorityBreakdownCard />

      {/* Row 3 */}
      <TicketsByCategoryCard />
      <AssetsByTypeCard />

      {/* Full width */}
      <div className="lg:col-span-2">
        <WarehouseMaintenanceSchedule />
      </div>

      {/* Full width */}
      <MonthlyTicketVolumeCard />
    </div>
  );
}