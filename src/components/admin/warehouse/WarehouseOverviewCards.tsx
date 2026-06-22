"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, ShieldCheck, AlertTriangle, Ticket, Truck, AlertCircle, Zap, DollarSign } from "lucide-react";

export default function WarehouseOverviewCards({ data, isLoading }: { data?: any; isLoading?: boolean }) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="rounded-2xl h-[120px] animate-pulse bg-muted" />
        ))}
      </div>
    );
  }

  // Build KPIs from real API data
  const displayKpis = data && data.kpis && data.kpiGrid 
    ? [
        // First 4 cards from kpis array (from database queries)
        ...data.kpis.map((kpi: any) => ({
          label: kpi.label,
          value: kpi.value,
          sub: kpi.sub,
          icon: kpi.label === "Average Health" ? Activity 
               : kpi.label === "Healthy Assets" ? ShieldCheck 
               : kpi.label === "At Risk" ? AlertTriangle 
               : Ticket,
        })),
        // Next 4 cards from kpiGrid array (from database queries)
        ...data.kpiGrid.map((kpi: any) => ({
          label: kpi.title,
          value: kpi.value,
          sub: kpi.subtitle,
          icon: kpi.title === "Total Vehicles" ? Truck 
               : kpi.title === "Critical Assets" ? AlertCircle 
               : kpi.title === "Avg Component Health" ? Zap 
               : DollarSign,
        })),
      ].filter((kpi) => kpi.label !== "At Risk" && kpi.label !== "Avg Component Health")
    : [
        // Fallback to show loading message if data is missing
        { label: "No Data", value: "N/A", sub: "Unable to fetch from database", icon: Activity },
      ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {displayKpis.map((k) => {
        const IconComponent = k.icon;
        return (
          <Card key={k.label} className="rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {k.label}
              </CardTitle>
              {IconComponent && <IconComponent className="h-5 w-5 text-muted-foreground" />}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{k.value}</div>
              <p className="mt-1 text-xs text-muted-foreground">{k.sub}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
