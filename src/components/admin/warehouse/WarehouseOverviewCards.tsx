"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, ShieldCheck, AlertTriangle, Ticket } from "lucide-react";

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
] as const;

export default function WarehouseOverviewCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((k) => (
        <Card key={k.label} className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {k.label}
            </CardTitle>
            <k.icon className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{k.value}</div>
            <p className="mt-1 text-xs text-muted-foreground">{k.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}