"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts";
import { useTheme } from "next-themes";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, PieChart as PieIcon, BarChart3 } from "lucide-react";

const STATUS_COLORS = {
  Active: "#10b981",
  Critical: "#ef4444",
  Under_Maintenance: "#f59e0b",
} as const;

// Reusable hook-based styles
function useChartStyles() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  return {
    axisColor: isDark ? "#cbd5e1" : "#475569",
    gridColor: isDark ? "rgba(148, 163, 184, 0.18)" : "rgba(148, 163, 184, 0.3)",
    tooltipStyle: {
      backgroundColor: isDark ? "#0f172a" : "#ffffff",
      border: isDark ? "1px solid #334155" : "1px solid #e2e8f0",
      color: isDark ? "#f8fafc" : "#0f172a",
    },
  };
}

export function HealthMaintenanceTrendsCard({ data: externalData }: { data?: any[] }) {
  const data = externalData || [];
  const { axisColor, gridColor, tooltipStyle } = useChartStyles();

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-muted-foreground" />
          Health &amp; Maintenance Trends
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Avg health score and maintenance count from Supabase.
        </p>
      </CardHeader>

      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="month" tick={{ fill: axisColor }} />
              <YAxis yAxisId="left" tick={{ fill: axisColor }} domain={[0, 100]} />
              <YAxis yAxisId="right" orientation="right" hide tick={{ fill: axisColor }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ color: axisColor }} />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="avgHealth"
                name="Avg Health Score"
                stroke="#22d3ee"
                fill="#22d3ee"
                fillOpacity={0.35}
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="maintenance"
                name="Assets in Maintenance"
                stroke="#f59e0b"
                fill="#f59e0b"
                fillOpacity={0.25}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function AssetStatusDistributionCard({ data: externalData }: { data?: any[] }) {
  const data = externalData || [];
  const { axisColor, tooltipStyle } = useChartStyles();

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieIcon className="h-4 w-4 text-muted-foreground" />
          Asset Status Distribution
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Operational vs maintenance vs critical from Supabase.
        </p>
      </CardHeader>

      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={4}
              >
                {data.map((d) => (
                  <Cell
                    key={d.name}
                    fill={
                      STATUS_COLORS[d.name as keyof typeof STATUS_COLORS] ??
                      "hsl(var(--muted-foreground))"
                    }
                  />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ color: axisColor }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function HealthScoreDistributionCard({ data: externalData }: { data?: any[] }) {
  const data = externalData || [];
  const { axisColor, gridColor, tooltipStyle } = useChartStyles();

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          Health Score Distribution
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Number of assets by health bucket from Supabase.
        </p>
      </CardHeader>

      <CardContent>
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="bucket" tick={{ fill: axisColor }} />
              <YAxis tick={{ fill: axisColor }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ color: axisColor }} />
              <Bar dataKey="count" name="Number of Assets" fill="#22d3ee" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function AssetsByTypeCard({ data: externalData }: { data?: any[] }) {
  const data = externalData || [];
  const { axisColor, gridColor, tooltipStyle } = useChartStyles();

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          Assets by Type
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Asset counts by vehicle type from Supabase.
        </p>
      </CardHeader>

      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 140, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis type="number" tick={{ fill: axisColor, fontSize: 12 }} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="type"
                tick={{ fill: axisColor, fontSize: 12 }}
                width={130}
              />
              <Tooltip 
                contentStyle={tooltipStyle}
                formatter={(value) => [value, "Number of Assets"]}
              />
              <Legend wrapperStyle={{ color: axisColor }} />
              <Bar 
                dataKey="count" 
                name="Number of Assets" 
                fill="#14b8a6" 
                radius={[8, 8, 8, 8]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}