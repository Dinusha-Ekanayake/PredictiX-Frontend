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

export default function WarehouseMaintenanceSchedule({ data }: { data?: any[] } = {}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  
  // Only use real data from PostgreSQL - no mock defaults
  const displayData = data || [];

  const axisColor = isDark ? "#cbd5e1" : "#475569";
  const gridColor = isDark
    ? "rgba(148, 163, 184, 0.18)"
    : "rgba(148, 163, 184, 0.3)";
  const tooltipStyle = {
    backgroundColor: isDark ? "#0f172a" : "#ffffff",
    border: isDark ? "1px solid #334155" : "1px solid #e2e8f0",
    color: isDark ? "#f8fafc" : "#0f172a",
  };

  // Only show chart if real data exists
  if (!displayData || displayData.length === 0) {
    return (
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
            Predictive Maintenance Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No maintenance schedule data available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-muted-foreground" />
          Predictive Maintenance Schedule
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Predicted need vs scheduled window (days) from database
        </p>
      </CardHeader>

      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={displayData}
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