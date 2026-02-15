"use client";

import * as React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const downtimeTrend = [
  { name: "Mon", minutes: 18 },
  { name: "Tue", minutes: 10 },
  { name: "Wed", minutes: 25 },
  { name: "Thu", minutes: 14 },
  { name: "Fri", minutes: 9 },
  { name: "Sat", minutes: 6 },
  { name: "Sun", minutes: 12 },
];

const healthDistribution = [
  { name: "Healthy", value: 86 },
  { name: "Warning", value: 30 },
  { name: "Critical", value: 12 },
];

const PIE_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--muted-foreground))",
  "hsl(var(--destructive))",
];

export default function OperationalCharts() {
  return (
    <Card className="rounded-2xl lg:col-span-2">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Operational Trend</CardTitle>
          <p className="text-sm text-muted-foreground">
            Weekly downtime + health distribution (sample)
          </p>
        </div>

        <Tabs defaultValue="downtime" className="w-full sm:w-auto">
          <TabsList className="grid w-full grid-cols-2 sm:w-65">
            <TabsTrigger value="downtime">Downtime</TabsTrigger>
            <TabsTrigger value="health">Health Split</TabsTrigger>
          </TabsList>

          <TabsContent value="downtime" className="mt-3">
            <CardContent className="p-0">
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={downtimeTrend} margin={{ top: 10, right: 16, left: -8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="minutes"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </TabsContent>

          <TabsContent value="health" className="mt-3">
            <CardContent className="p-0">
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={healthDistribution}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={4}
                    >
                      {healthDistribution.map((_, idx) => (
                        <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </TabsContent>
        </Tabs>
      </CardHeader>
    </Card>
  );
}
