"use client";

import StatCard from "@/components/admin/common/StatCard";
import { AlertTriangle, CheckCircle2, Wrench, Boxes } from "lucide-react";
import type { Asset } from "./types";

export default function AssetsSummary({ assets }: { assets: Asset[] }) {
  const total = assets.length;
  const operational = assets.filter((a) => a.status === "OPERATIONAL").length;
  const maintenance = assets.filter((a) => a.status === "MAINTENANCE").length;
  const critical = assets.filter((a) => a.status === "CRITICAL").length;

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 sm:col-span-6 lg:col-span-3">
        <StatCard label="Total Assets" value={String(total)} hint="All warehouses" icon={<Boxes className="h-4 w-4" />} />
      </div>
      <div className="col-span-12 sm:col-span-6 lg:col-span-3">
        <StatCard label="Operational" value={String(operational)} hint="Active / running" icon={<CheckCircle2 className="h-4 w-4" />} />
      </div>
      <div className="col-span-12 sm:col-span-6 lg:col-span-3">
        <StatCard label="Under Maintenance" value={String(maintenance)} hint="Currently in progress" icon={<Wrench className="h-4 w-4" />} />
      </div>
      <div className="col-span-12 sm:col-span-6 lg:col-span-3">
        <StatCard label="Critical Risk" value={String(critical)} hint="Needs attention now" icon={<AlertTriangle className="h-4 w-4" />} />
      </div>
    </div>
  );
}
