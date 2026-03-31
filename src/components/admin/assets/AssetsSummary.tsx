"use client";

import StatCard from "@/components/admin/common/StatCard";
<<<<<<< HEAD
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
=======
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
>>>>>>> 8fd9ee0d230ce884f4957d6664ed8fc3d212cbbb
  ).length;

  const atRiskCount = assets.filter(
    (asset) =>
<<<<<<< HEAD
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
=======
      asset.status === "CRITICAL" ||
      asset.healthScore < 50 ||
      asset.failureProbability8w >= 0.5
  ).length;

  const overallHealth = Math.round(
    avg(assets.map((asset) => asset.healthScore))
  );

  return (
    <div className="grid grid-cols-12 gap-4 lg:gap-5">
>>>>>>> 8fd9ee0d230ce884f4957d6664ed8fc3d212cbbb
      <div className="col-span-12 sm:col-span-6 xl:col-span-3">
        <StatCard
          label="Total Assets"
          value={String(totalAssets)}
<<<<<<< HEAD
          hint="Across visible warehouse scope"
          icon={<Activity className="h-4 w-4" />}
=======
          hint="All registered assets"
          icon={<Activity className="h-4 w-4" />}
          accentColor="bg-sky-500/10 text-sky-600 dark:text-sky-400"
>>>>>>> 8fd9ee0d230ce884f4957d6664ed8fc3d212cbbb
        />
      </div>

      <div className="col-span-12 sm:col-span-6 xl:col-span-3">
        <StatCard
<<<<<<< HEAD
          label="Overall Asset Health"
          value={`${overallHealth}%`}
          hint="Average predicted health score"
          icon={<ShieldCheck className="h-4 w-4" />}
=======
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
>>>>>>> 8fd9ee0d230ce884f4957d6664ed8fc3d212cbbb
        />
      </div>

      <div className="col-span-12 sm:col-span-6 xl:col-span-3">
        <StatCard
<<<<<<< HEAD
          label="In Maintenance"
          value={String(maintenanceCount)}
          hint="Assets currently under maintenance"
          icon={<Wrench className="h-4 w-4" />}
=======
          label="Active"
          value={String(activeCount)}
          hint={`${maintenanceCount} in maintenance`}
          icon={<CheckCircle2 className="h-4 w-4" />}
          accentColor="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
>>>>>>> 8fd9ee0d230ce884f4957d6664ed8fc3d212cbbb
        />
      </div>

      <div className="col-span-12 sm:col-span-6 xl:col-span-3">
        <StatCard
          label="Needs Attention"
          value={String(atRiskCount)}
<<<<<<< HEAD
          hint="Critical, poor, or high-risk assets"
          icon={<AlertTriangle className="h-4 w-4" />}
=======
          hint="Critical or high-risk"
          icon={<AlertTriangle className="h-4 w-4" />}
          accentColor={
            atRiskCount > 0
              ? "bg-red-500/10 text-red-600 dark:text-red-400"
              : "bg-muted/50 text-muted-foreground"
          }
>>>>>>> 8fd9ee0d230ce884f4957d6664ed8fc3d212cbbb
        />
      </div>
    </div>
  );
}