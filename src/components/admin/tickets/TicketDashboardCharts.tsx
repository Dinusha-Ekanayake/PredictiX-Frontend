"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { apiGet } from "@/lib/apiClient";
import { BarChart3, PieChart as PieChartIcon } from "lucide-react";

type TicketData = {
  id: string;
  priority: string;
  final_category: string | null;
  predicted_category: string | null;
};

const PRIORITY_COLORS = {
  High: "#f59e0b",   // Orange
  Medium: "#3b82f6", // Blue
  Low: "#94a3b8",    // Slate/Gray
};

const CATEGORY_COLORS = {
  Electrical: "#06b6d4", // Cyan
  Software: "#ec4899",   // Pink
};

export default function TicketDashboardCharts({ refreshTrigger = 0 }: { refreshTrigger?: number }) {
  const [data, setData] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllWarehouseTickets() {
      try {
        // Goes through the backend's GET /tickets/, which is warehouse- and
        // role-scoped server-side (admins see their warehouse, regular
        // users see only their own tickets) — a prior direct Supabase
        // client call here relied on RLS to enforce that scoping, but the
        // real tickets_select_authenticated policy grants read access to
        // EVERY authenticated user for EVERY ticket (qual = true, no
        // warehouse/ownership filter), so it was silently fleet-wide,
        // cross-warehouse for every admin viewing this dashboard.
        const tickets = await apiGet<TicketData[]>("/tickets/?limit=500");
        setData(tickets ?? []);
      } catch (err) {
        console.error("Error fetching tickets for charts:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAllWarehouseTickets();
  }, [refreshTrigger]);

  // Process data for Category Bar Chart
  const categoryCounts = data.reduce((acc, ticket) => {
    const rawCat = ticket.final_category || ticket.predicted_category;
    if (!rawCat) return acc;
    
    // Standardize category name
    let cat = rawCat.toLowerCase();
    if (cat === "general") return acc;
    
    cat = cat.charAt(0).toUpperCase() + cat.slice(1);
    
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryChartData = Object.entries(categoryCounts)
    .map(([name, count]) => ({
      name,
      count,
      fill: CATEGORY_COLORS[name as keyof typeof CATEGORY_COLORS] || "#94a3b8", // Fallback color
    }))
    .sort((a, b) => b.count - a.count);

  // Process data for Priority Donut Chart
  const priorityCounts = data.reduce((acc, ticket) => {
    let prio = (ticket.priority || "Medium").toLowerCase();
    prio = prio.charAt(0).toUpperCase() + prio.slice(1);
    
    acc[prio] = (acc[prio] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const priorityChartData = Object.entries(priorityCounts)
    .map(([name, value]) => ({
      name,
      value,
    }))
    .sort((a, b) => b.value - a.value);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-pulse">
        <div className="h-[350px] rounded-xl bg-card border border-border" />
        <div className="h-[350px] rounded-xl bg-card border border-border" />
      </div>
    );
  }

  // Custom Tooltip for Bar Chart
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-slate-700 bg-slate-900/95 p-3 shadow-xl backdrop-blur-md">
          <p className="mb-1 text-sm font-semibold text-slate-200">{label}</p>
          <p className="text-sm font-medium" style={{ color: payload[0].payload.fill }}>
            Number of Tickets : {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Pie Chart
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-slate-700 bg-slate-900/95 p-3 shadow-xl backdrop-blur-md">
          <p className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <span 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: payload[0].payload.fill }} 
            />
            {payload[0].name}: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderLegendText = (value: string, entry: any) => {
    return <span className="text-sm font-medium text-slate-300 ml-1">{value}</span>;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
      {/* Category Bar Chart */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a0a0a] shadow-sm p-5 flex flex-col">
        <div className="mb-4">
          <h3 className="flex items-center gap-2 text-base font-semibold text-slate-800 dark:text-slate-200">
            <BarChart3 className="h-4 w-4 text-slate-500 dark:text-slate-400" /> Tickets by Category
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Number of tickets by category from Supabase.
          </p>
        </div>
        <div className="flex-1 w-full min-h-[250px]">
          <ResponsiveContainer minWidth={0} minHeight={0} width="100%" height="100%">
            <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={true} horizontal={true} />
              <XAxis 
                dataKey="name" 
                stroke="#737373" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                stroke="#737373" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(val) => Math.floor(val).toString()}
              />
              <Tooltip cursor={{ fill: '#262626', opacity: 0.5 }} content={<CustomBarTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                content={() => (
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <div className="w-4 h-4 bg-purple-500 rounded-sm"></div>
                    <span className="text-sm text-purple-400 font-medium">Number of Tickets</span>
                  </div>
                )}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {categoryChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Priority Donut Chart */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a0a0a] shadow-sm p-5 flex flex-col">
        <div className="mb-4">
          <h3 className="flex items-center gap-2 text-base font-semibold text-slate-800 dark:text-slate-200">
            <PieChartIcon className="h-4 w-4 text-slate-500 dark:text-slate-400" /> Ticket Priority Breakdown
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Current ticket distribution by priority from Supabase.
          </p>
        </div>
        <div className="flex-1 w-full min-h-[250px] flex items-center justify-center">
          <ResponsiveContainer minWidth={0} minHeight={0} width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomPieTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="square" 
                formatter={renderLegendText}
                wrapperStyle={{ paddingTop: "20px" }}
              />
              <Pie
                data={priorityChartData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {priorityChartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={PRIORITY_COLORS[entry.name as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS.Medium} 
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
