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

import { CustomTooltip, PieLegendItem } from "@/components/admin/warehouse/WarehouseAssetInsights";

const PRIORITY_COLORS: Record<string, string> = {
  critical: "#ef4444",
  high: "#f59e0b",
  medium: "#3b82f6",
  low: "#94a3b8",
};

// Reusable hook-based styles
function useChartStyles() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  return {
    axisColor: isDark ? "#cbd5e1" : "#475569",
    gridColor: isDark ? "rgba(148, 163, 184, 0.18)" : "rgba(148, 163, 184, 0.3)",
  };
}

export function TicketPriorityBreakdownCard({ data: externalData }: { data?: any[] }) {
  const data = externalData || [];
  const total = data.reduce((sum, item) => sum + (item.value || 0), 0) || 1;
  const priorityData = data.map(d => ({
    ...d,
    color: PRIORITY_COLORS[d.name.toLowerCase()] || PRIORITY_COLORS[d.name] || "#64748b"
  })).sort((a, b) => b.value - a.value);

  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <PieIcon className="h-4 w-4 text-muted-foreground" />
          Ticket Priority Breakdown
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex items-center gap-6 mt-2 h-[260px]">
          <div style={{ height: 180, width: 180, flexShrink: 0 }}>
            <ResponsiveContainer minWidth={0} minHeight={0} width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  stroke="none"
                >
                  {priorityData.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip total={total} />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-4">
            {priorityData.map(d => (
              <PieLegendItem
                key={d.name}
                color={d.color}
                label={d.name}
                count={d.value}
                pct={Math.round((d.value / total) * 100)}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TicketsByCategoryCard({ data: externalData }: { data?: any[] }) {
  const data = externalData || [];
  const { axisColor, gridColor } = useChartStyles();
  const COLORS = ['#a855f7', '#6366f1', '#ec4899', '#f43f5e', '#8b5cf6', '#d946ef', '#14b8a6', '#0ea5e9'];

  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          Tickets by Category
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="h-[260px] w-full mt-2">
          <ResponsiveContainer minWidth={0} minHeight={0} width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} barCategoryGap={16}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
              <XAxis dataKey="category" tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: axisColor, fontSize: 11 }} allowDecimals={false} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--muted)', opacity: 0.2 }} />
              <Legend wrapperStyle={{ paddingTop: "20px", fontSize: "12px" }} iconType="circle" />
              <Bar dataKey="count" name="Number of Tickets" radius={[6, 6, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function MonthlyTicketVolumeCard({ data: externalData }: { data?: any[] }) {
  const data = externalData || [];
  const { axisColor, gridColor } = useChartStyles();

  return (
    <Card className="rounded-2xl lg:col-span-2">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <LineIcon className="h-4 w-4 text-muted-foreground" />
          Monthly Ticket Volume
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="h-[280px] w-full mt-2">
          <ResponsiveContainer minWidth={0} minHeight={0} width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
              <XAxis dataKey="month" tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: axisColor, fontSize: 11 }} allowDecimals={false} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: gridColor, strokeWidth: 1, strokeDasharray: "3 3" }} />
              <Legend wrapperStyle={{ paddingTop: "20px", fontSize: "12px" }} iconType="circle" />
              <Line
                type="monotone"
                dataKey="total"
                name="Total Tickets"
                stroke="#a855f7"
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, fill: "var(--background)" }}
                activeDot={{ r: 6, strokeWidth: 0, fill: "#a855f7" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
