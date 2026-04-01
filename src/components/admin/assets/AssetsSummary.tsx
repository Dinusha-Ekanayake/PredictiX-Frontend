"use client";

import StatCard from "@/components/admin/common/StatCard";
import type { AssetRecord } from "./types";
import {
  Activity,
  AlertTriangle,
  ShieldCheck,
  Wrench,
} from "lucide-react";

function avg(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export default function AssetsSummary({ assets }: { assets: AssetRecord[] }) {
  const totalAssets = assets.length;

  const maintenanceCount = assets.filter(
    (asset) => asset.status === "under_maintenance"
  ).length;

  const atRiskCount = assets.filter(
    (asset) =>
      asset.status === "critical" ||
      asset.healthBand === "critical" ||
      asset.healthBand === "poor" ||
      (asset.prediction?.failureProbability ?? 0) >= 0.5
  ).length;

  const overallHealth = Math.round(
    avg(
      assets
        .map((asset) => asset.prediction?.healthScore)
        .filter((score): score is number => typeof score === "number")
    )
  );

  return (
    <div className="grid grid-cols-12 gap-4 lg:gap-6">
      <div className="col-span-12 sm:col-span-6 xl:col-span-3">
        <StatCard
          label="Total Assets"
          value={String(totalAssets)}
          hint="Across visible warehouse scope"
          icon={<Activity className="h-4 w-4" />}
        />
      </div>

      <div className="col-span-12 sm:col-span-6 xl:col-span-3">
        <StatCard
          label="Overall Asset Health"
          value={`${overallHealth}%`}
          hint="Average predicted health score"
          icon={<ShieldCheck className="h-4 w-4" />}
        />
      </div>

      <div className="col-span-12 sm:col-span-6 xl:col-span-3">
        <StatCard
          label="In Maintenance"
          value={String(maintenanceCount)}
          hint="Assets currently under maintenance"
          icon={<Wrench className="h-4 w-4" />}
        />
      </div>

      <div className="col-span-12 sm:col-span-6 xl:col-span-3">
        <StatCard
          label="Needs Attention"
          value={String(atRiskCount)}
          hint="Critical, poor, or high-risk assets"
          icon={<AlertTriangle className="h-4 w-4" />}
        />
      </div>
    </div>
  );
}