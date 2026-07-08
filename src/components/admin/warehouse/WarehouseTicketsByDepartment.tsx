"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  BarChart,
  LabelList,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket } from "lucide-react";
import { useTheme } from "next-themes";

export interface TicketsByDepartmentRow {
  department: string;
  tickets: number;
  openTickets: number;
}

interface Props {
  data?: TicketsByDepartmentRow[];
  isLoading?: boolean;
}

function CTip({ active, payload, label, isDark }: any) {
  if (!active || !payload?.length) return null;
  const row: TicketsByDepartmentRow = payload[0].payload;
  return (
    <div
      className="rounded-lg px-3 py-2 text-xs shadow-lg"
      style={{
        backgroundColor: isDark ? "#0f172a" : "#ffffff",
        border: isDark ? "1px solid #334155" : "1px solid #e2e8f0",
        color: isDark ? "#f8fafc" : "#0f172a",
      }}
    >
      <div className="font-semibold">{label}</div>
      <div className="mt-1" style={{ color: isDark ? "#94a3b8" : "#64748b" }}>
        {row.tickets} total ticket{row.tickets === 1 ? "" : "s"} · {row.openTickets} open
      </div>
    </div>
  );
}

export default function WarehouseTicketsByDepartment({ data = [], isLoading }: Props) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const axisColor = isDark ? "#cbd5e1" : "#475569";
  const gridColor = isDark ? "rgba(148, 163, 184, 0.18)" : "rgba(148, 163, 184, 0.3)";
  const labelColor = isDark ? "#f1f5f9" : "#0f172a";

  if (isLoading) {
    return (
      <Card className="rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Ticket className="h-4 w-4 text-rose-500" /> Ticket Load by Department
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[220px] animate-pulse rounded-lg bg-muted" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) return null;

  const maxTickets = Math.max(1, ...data.map((d) => d.tickets));

  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Ticket className="h-4 w-4 text-rose-500" /> Ticket Load by Department
        </CardTitle>
        <p className="text-xs text-muted-foreground">Which department is generating the most maintenance tickets</p>
      </CardHeader>
      <CardContent>
        <div style={{ width: "100%", height: Math.max(160, data.length * 46) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 0, right: 36, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
              <XAxis
                type="number"
                allowDecimals={false}
                domain={[0, maxTickets]}
                tick={{ fill: axisColor, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="department"
                tick={{ fill: axisColor, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={110}
              />
              <Tooltip content={<CTip isDark={isDark} />} cursor={{ fill: isDark ? "rgba(148,163,184,0.08)" : "rgba(100,116,139,0.08)" }} />
              <Bar dataKey="tickets" name="Tickets" fill="#f43f5e" radius={[0, 4, 4, 0]} minPointSize={2}>
                <LabelList
                  dataKey="tickets"
                  position="right"
                  style={{ fill: labelColor, fontSize: 11, fontWeight: 600 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
