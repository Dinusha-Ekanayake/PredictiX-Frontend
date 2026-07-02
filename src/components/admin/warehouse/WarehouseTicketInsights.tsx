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
  LineChart,
  Line,
} from "recharts";
import { useTheme } from "next-themes";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart as PieIcon, BarChart3, LineChart as LineIcon } from "lucide-react";

const PRIORITY_COLORS = {
  Critical: "#ef4444",
  High: "#f59e0b",
  Medium: "#3b82f6",
  Low: "#94a3b8",
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

export function TicketPriorityBreakdownCard({ data: externalData }: { data?: any[] }) {
  const data = externalData || [];
  const { axisColor, tooltipStyle } = useChartStyles();

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieIcon className="h-4 w-4 text-muted-foreground" />
          Ticket Priority Breakdown
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Current ticket distribution by priority from Supabase.
        </p>
      </CardHeader>

      <CardContent>
        <div className="h-[260px] w-full">
          <ResponsiveContainer minWidth={0} minHeight={0} width="100%" height="100%">
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
                      PRIORITY_COLORS[d.name as keyof typeof PRIORITY_COLORS] ??
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

export function TicketsByCategoryCard({ data: externalData }: { data?: any[] }) {
  const data = externalData || [];
  const { axisColor, gridColor, tooltipStyle } = useChartStyles();

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          Tickets by Category
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Number of tickets by category from Supabase.
        </p>
      </CardHeader>

      <CardContent>
        <div className="h-[260px] w-full">
          <ResponsiveContainer minWidth={0} minHeight={0} width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="category" tick={{ fill: axisColor }} />
              <YAxis tick={{ fill: axisColor }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ color: axisColor }} />
              <Bar dataKey="count" name="Number of Tickets" fill="#a855f7" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function MonthlyTicketVolumeCard({ data: externalData }: { data?: any[] }) {
  const data = externalData || [];
  const { axisColor, gridColor, tooltipStyle } = useChartStyles();

  return (
    <Card className="rounded-2xl lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LineIcon className="h-4 w-4 text-muted-foreground" />
          Monthly Ticket Volume
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Ticket volume trend from Supabase.
        </p>
      </CardHeader>

      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer minWidth={0} minHeight={0} width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="month" tick={{ fill: axisColor }} />
              <YAxis tick={{ fill: axisColor }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ color: axisColor }} />
              <Line
                type="monotone"
                dataKey="total"
                name="Total Tickets"
                stroke="#a855f7"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
