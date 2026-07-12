"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, ShieldCheck, AlertTriangle, Ticket, Truck, AlertCircle, Zap, DollarSign } from "lucide-react";

function SummaryCard({
  label,
  value,
  sub,
  icon,
  accentClass,
  iconClass,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  accentClass: string;
  iconClass: string;
}) {
  return (
    <div className="card-dynamic rounded-2xl border border-slate-200 dark:border-slate-700 bg-card p-4 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-medium text-muted-foreground">{label}</div>
          <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
          {sub && (
            <div className="mt-1 text-[11px] text-muted-foreground/70">{sub}</div>
          )}
        </div>
        <div className={`shrink-0 rounded-xl p-2.5 ${accentClass} dark:bg-white/6`}>
          <div className={iconClass}>{icon}</div>
        </div>
      </div>
    </div>
  );
}

export default function WarehouseOverviewCards({ data, isLoading }: { data?: any; isLoading?: boolean }) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="card-dynamic rounded-2xl border border-slate-200 dark:border-slate-700 bg-card p-4 h-[92px] animate-pulse" />
        ))}
      </div>
    );
  }

  // Build KPIs from real API data
  const displayKpis = data && data.kpis && data.kpiGrid 
    ? [
        ...data.kpis.map((kpi: any) => ({
          label: kpi.label,
          value: kpi.value,
          sub: kpi.sub,
          icon: kpi.label === "Average Health" ? <Activity className="h-4 w-4" /> 
               : kpi.label === "Healthy Assets" ? <ShieldCheck className="h-4 w-4" /> 
               : kpi.label === "At Risk" ? <AlertTriangle className="h-4 w-4" /> 
               : <Ticket className="h-4 w-4" />,
          accentClass: kpi.label === "Average Health" ? "bg-blue-50"
                     : kpi.label === "Healthy Assets" ? "bg-emerald-50"
                     : kpi.label === "At Risk" ? "bg-red-50"
                     : "bg-indigo-50",
          iconClass: kpi.label === "Average Health" ? "text-blue-600 dark:text-blue-400"
                   : kpi.label === "Healthy Assets" ? "text-emerald-600 dark:text-emerald-400"
                   : kpi.label === "At Risk" ? "text-red-600 dark:text-red-400"
                   : "text-indigo-600 dark:text-indigo-400",
        })),
        ...data.kpiGrid.map((kpi: any) => ({
          label: kpi.title,
          value: kpi.value,
          sub: kpi.subtitle,
          icon: kpi.title === "Total Vehicles" ? <Truck className="h-4 w-4" /> 
               : kpi.title === "Critical Assets" ? <AlertCircle className="h-4 w-4" /> 
               : kpi.title === "Avg Component Health" ? <Zap className="h-4 w-4" /> 
               : <DollarSign className="h-4 w-4" />,
          accentClass: kpi.title === "Total Vehicles" ? "bg-slate-100"
                     : kpi.title === "Critical Assets" ? "bg-red-50"
                     : kpi.title === "Avg Component Health" ? "bg-blue-50"
                     : "bg-amber-50",
          iconClass: kpi.title === "Total Vehicles" ? "text-slate-600 dark:text-slate-300"
                   : kpi.title === "Critical Assets" ? "text-red-600 dark:text-red-400"
                   : kpi.title === "Avg Component Health" ? "text-blue-600 dark:text-blue-400"
                   : "text-amber-600 dark:text-amber-400",
        })),
      ].filter((kpi) => kpi.label !== "At Risk" && kpi.label !== "Avg Component Health")
    : [
        { 
          label: "No Data", value: "N/A", sub: "Unable to fetch from database", 
          icon: <Activity className="h-4 w-4" />, accentClass: "bg-slate-100", iconClass: "text-slate-500" 
        },
      ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {displayKpis.map((k) => (
        <SummaryCard
          key={k.label}
          label={k.label}
          value={k.value}
          sub={k.sub}
          icon={k.icon}
          accentClass={k.accentClass}
          iconClass={k.iconClass}
        />
      ))}
    </div>
  );
}
