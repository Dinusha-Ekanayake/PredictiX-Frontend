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

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart as PieIcon, BarChart3, LineChart as LineIcon } from "lucide-react";

const ticketPriority = [
  { name: "Critical", value: 1 },
  { name: "High", value: 1 },
  { name: "Medium", value: 1 },
  { name: "Low", value: 1 },
];

const PRIORITY_COLORS = {
  Critical: "#ef4444",
  High: "#f59e0b",
  Medium: "#3b82f6",
  Low: "#94a3b8",
} as const;

const ticketsByCategory = [
  { category: "Electrical", count: 1 },
  { category: "Mechanical", count: 2 },
  { category: "Software", count: 1 },
];

const monthlyTicketVolume = [
  { month: "Jul", total: 8 },
  { month: "Aug", total: 12 },
  { month: "Sep", total: 10 },
  { month: "Oct", total: 15 },
  { month: "Nov", total: 18 },
  { month: "Dec", total: 4 },
];

function gridStroke() {
  return "hsl(var(--border))";
}

export function TicketPriorityBreakdownCard() {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieIcon className="h-4 w-4 text-muted-foreground" />
          Ticket Priority Breakdown
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Current ticket distribution by priority (sample).
        </p>
      </CardHeader>

      <CardContent>
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={ticketPriority}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={4}
              >
                {ticketPriority.map((d) => (
                  <Cell
                    key={d.name}
                    fill={
                      PRIORITY_COLORS[d.name as keyof typeof PRIORITY_COLORS] ??
                      "hsl(var(--muted-foreground))"
                    }
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function TicketsByCategoryCard() {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          Tickets by Category
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Number of tickets by category (sample).
        </p>
      </CardHeader>

      <CardContent>
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ticketsByCategory} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke()} />
              <XAxis dataKey="category" tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name="Number of Tickets" fill="#a855f7" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function MonthlyTicketVolumeCard() {
  return (
    <Card className="rounded-2xl lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LineIcon className="h-4 w-4 text-muted-foreground" />
          Monthly Ticket Volume
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Ticket volume trend (sample).
        </p>
      </CardHeader>

      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyTicketVolume} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke()} />
              <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
              <Tooltip />
              <Legend />
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