"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, ShieldCheck, AlertTriangle, Ticket, Truck, AlertCircle, Zap, DollarSign } from "lucide-react";

const kpis = [
  {
    label: "Average Health",
    value: "77%",
    sub: "Across all assets",
    icon: Activity,
  },
  {
    label: "Healthy Assets",
    value: "3",
    sub: "50% of total",
    icon: ShieldCheck,
  },
  {
    label: "At Risk",
    value: "1",
    sub: "Require attention",
    icon: AlertTriangle,
  },
  {
    label: "Active Tickets",
    value: "3",
    sub: "Of 4 total",
    icon: Ticket,
  },
  {
    label: "Total Vehicles",
    value: "128",
    sub: "Across all warehouse operations",
    icon: Truck,
  },
  {
    label: "Critical Assets",
    value: "12",
    sub: "Require immediate attention",
    icon: AlertCircle,
  },
  {
    label: "Avg Component Health",
    value: "84%",
    sub: "Overall fleet component health",
    icon: Zap,
  },
  {
    label: "Monthly Maintenance Cost",
    value: "$24,500",
    sub: "Estimated current month cost",
    icon: DollarSign,
  },
] as const;

export default function WarehouseOverviewCards({ data, isLoading }: { data?: any[], isLoading?: boolean }) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Card key={i} className="rounded-2xl h-[120px] animate-pulse bg-muted" />
        ))}
      </div>
    );
  }

  const defaultKpis = [
    { label: "Average Health", value: "77%", sub: "Across all assets", icon: Activity },
    { label: "Healthy Assets", value: "3", sub: "50% of total", icon: ShieldCheck },
    { label: "At Risk", value: "1", sub: "Require attention", icon: AlertTriangle },
    { label: "Active Tickets", value: "3", sub: "Of 4 total", icon: Ticket },
    { label: "Total Vehicles", value: "128", sub: "Across all warehouse operations", icon: Truck },
    { label: "Critical Assets", value: "12", sub: "Require immediate attention", icon: AlertCircle },
    { label: "Avg Component Health", value: "84%", sub: "Overall fleet component health", icon: Zap },
    { label: "Monthly Maintenance Cost", value: "$24,500", sub: "Estimated current month cost", icon: DollarSign },
  ];

  // Always show 8 cards - use defaults
  const displayKpis = defaultKpis;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {displayKpis.map((k) => {
        const IconComponent = k.icon;
        return (
          <Card key={k.label || k.title} className="rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {k.label || k.title}
              </CardTitle>
              {IconComponent && <IconComponent className="h-5 w-5 text-muted-foreground" />}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{k.value}</div>
              <p className="mt-1 text-xs text-muted-foreground">{k.sub || k.subtitle}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}