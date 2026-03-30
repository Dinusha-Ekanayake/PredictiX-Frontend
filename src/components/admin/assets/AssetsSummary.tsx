"use client";

import StatCard from "@/components/admin/common/StatCard";
import type { Asset } from "./types";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

function avg(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export default function AssetsSummary({ assets }: { assets: Asset[] }) {
  const totalAssets = assets.length;

  const activeCount = assets.filter(
    (asset) => asset.status === "OPERATIONAL"
  ).length;

  const maintenanceCount = assets.filter(
    (asset) => asset.status === "MAINTENANCE"
  ).length;

  const atRiskCount = assets.filter(
    (asset) =>
      asset.status === "CRITICAL" ||
      asset.healthScore < 50 ||
      asset.failureProbability8w >= 0.5
  ).length;

  const overallHealth = Math.round(
    avg(assets.map((asset) => asset.healthScore))
  );

  return (
    <div className="grid grid-cols-12 gap-4 lg:gap-5">
      <div className="col-span-12 sm:col-span-6 xl:col-span-3">
        <StatCard
          label="Total Assets"
          value={String(totalAssets)}
          hint="All registered assets"
          icon={<Activity className="h-4 w-4" />}
          accentColor="bg-sky-500/10 text-sky-600 dark:text-sky-400"
        />
      </div>

      <div className="col-span-12 sm:col-span-6 xl:col-span-3">
        <StatCard
          label="Fleet Health"
          value={`${overallHealth}%`}
          hint="Average predicted score"
          icon={<ShieldCheck className="h-4 w-4" />}
          accentColor={
            overallHealth >= 75
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : overallHealth >= 50
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                : "bg-red-500/10 text-red-600 dark:text-red-400"
          }
        />
      </div>

      <div className="col-span-12 sm:col-span-6 xl:col-span-3">
        <StatCard
          label="Active"
          value={String(activeCount)}
          hint={`${maintenanceCount} in maintenance`}
          icon={<CheckCircle2 className="h-4 w-4" />}
          accentColor="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
      </div>

      <div className="col-span-12 sm:col-span-6 xl:col-span-3">
        <StatCard
          label="Needs Attention"
          value={String(atRiskCount)}
          hint="Critical or high-risk"
          icon={<AlertTriangle className="h-4 w-4" />}
          accentColor={
            atRiskCount > 0
              ? "bg-red-500/10 text-red-600 dark:text-red-400"
              : "bg-muted/50 text-muted-foreground"
          }
        />
      </div>
    </div>
  );
}
