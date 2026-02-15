"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, AlertTriangle, Wrench, Cpu } from "lucide-react";

const kpis = [
  { label: "Total Assets", value: "128", sub: "+4 this month", icon: Activity },
  { label: "Critical Alerts", value: "7", sub: "Needs immediate action", icon: AlertTriangle },
  { label: "Open Tickets", value: "23", sub: "6 high priority", icon: Wrench },
  { label: "Model Health", value: "92%", sub: "Avg. confidence", icon: Cpu },
] as const;

export default function KpiCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((k) => (
        <Card key={k.label} className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{k.label}</CardTitle>
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
