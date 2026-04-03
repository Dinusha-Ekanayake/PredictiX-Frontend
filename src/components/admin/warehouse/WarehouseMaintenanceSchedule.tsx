"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarClock, Lightbulb } from "lucide-react";
import { useTheme } from "next-themes";

const schedule = [
  { asset: "HVAC System H-A1", predicted: 1.2, scheduled: 2.0 },
  { asset: "Pallet Jack PJ-05", predicted: 0.7, scheduled: 1.5 },
  { asset: "Loading Dock LD-03", predicted: 1.0, scheduled: 2.2 },
  { asset: "Conveyor Belt CB-12", predicted: 1.6, scheduled: 2.0 },
];

export default function WarehouseMaintenanceSchedule() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const axisColor = isDark ? "#cbd5e1" : "#475569";
  const gridColor = isDark
    ? "rgba(148, 163, 184, 0.18)"
    : "rgba(148, 163, 184, 0.3)";
  const tooltipStyle = {
    backgroundColor: isDark ? "#0f172a" : "#ffffff",
    border: isDark ? "1px solid #334155" : "1px solid #e2e8f0",
    color: isDark ? "#f8fafc" : "#0f172a",
  };

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-muted-foreground" />
          Predictive Maintenance Schedule
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Predicted need vs scheduled window (days) — sample.
        </p>
      </CardHeader>

      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={schedule}
              layout="vertical"
              margin={{ top: 10, right: 10, left: 40, bottom: 0 }}
              barCategoryGap={10}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis type="number" tick={{ fill: axisColor }} />
              <YAxis
                type="category"
                dataKey="asset"
                tick={{ fill: axisColor }}
                width={170}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ color: axisColor }} />
              <Bar
                dataKey="predicted"
                name="Predicted Need (days)"
                fill="#ef4444"
                radius={[10, 10, 10, 10]}
              />
              <Bar
                dataKey="scheduled"
                name="Scheduled (days)"
                fill="#10b981"
                radius={[10, 10, 10, 10]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 rounded-xl border bg-muted/25 px-4 py-3">
          <div className="flex items-start gap-2">
            <Lightbulb className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Insight:</span>{" "}
              Red bars shorter than green indicate assets may need maintenance
              sooner than scheduled.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}