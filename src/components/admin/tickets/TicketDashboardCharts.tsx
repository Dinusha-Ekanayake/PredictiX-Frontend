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
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";
import { apiGet } from "@/lib/apiClient";
import { listUsers, type UserItem } from "@/lib/userService";
import { BarChart3, PieChart as PieChartIcon, Users, Clock, AlertCircle } from "lucide-react";

type TicketData = {
  id: string;
  title: string;
  status: string;
  priority: string;
  final_category: string | null;
  predicted_category: string | null;
  assigned_to: string | null;
  created_at: string;
};

const PRIORITY_COLORS = {
  High: "#ef4444",   // Red
  Medium: "#f59e0b", // Amber/Orange
  Low: "#10b981",    // Emerald Green
};

const CATEGORY_COLORS = {
  Electrical: "#06b6d4", // Cyan
  Software: "#ec4899",   // Pink
};

const PRIORITY_VALS = {
  High: 3,
  Medium: 2,
  Low: 1,
};

export default function TicketDashboardCharts({ refreshTrigger = 0 }: { refreshTrigger?: number }) {
  const [data, setData] = useState<TicketData[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [tickets, fetchedUsers] = await Promise.all([
          apiGet<TicketData[]>("/tickets/?limit=500"),
          listUsers(),
        ]);
        setData(tickets ?? []);
        setUsers(fetchedUsers ?? []);
      } catch (err) {
        console.error("Error fetching tickets or users for charts:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [refreshTrigger]);

  const userMap = React.useMemo(() => {
    const map = new Map<string, string>();
    users.forEach((u) => {
      map.set(u.id, u.name);
    });
    return map;
  }, [users]);

  // 1. Process data for Category Bar Chart
  const categoryCounts = data.reduce((acc, ticket) => {
    const rawCat = ticket.final_category || ticket.predicted_category;
    if (!rawCat) return acc;
    
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
      fill: CATEGORY_COLORS[name as keyof typeof CATEGORY_COLORS] || "#94a3b8",
    }))
    .sort((a, b) => b.count - a.count);

  // 2. Process data for Priority Donut Chart
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

  // 3. Process data for Technician Queue Depth (Active Tickets only, grouped by priority)
  const techQueueCounts = data.reduce((acc, ticket) => {
    // Exclude resolved and closed from queue depth
    const status = (ticket.status || "").toLowerCase();
    if (status === "resolved" || status === "closed") return acc;

    const assigneeId = ticket.assigned_to;
    const name = assigneeId ? (userMap.get(assigneeId) ?? "Unknown") : "Unassigned";
    
    let prio = (ticket.priority || "Medium").toLowerCase();
    let prioKey: "High" | "Medium" | "Low" = "Medium";
    if (prio === "high") prioKey = "High";
    else if (prio === "medium") prioKey = "Medium";
    else if (prio === "low") prioKey = "Low";

    if (!acc[name]) {
      acc[name] = { name, High: 0, Medium: 0, Low: 0, total: 0 };
    }
    acc[name][prioKey] += 1;
    acc[name].total += 1;
    return acc;
  }, {} as Record<string, { name: string; High: number; Medium: number; Low: number; total: number }>);

  const techQueueData = Object.values(techQueueCounts)
    .sort((a, b) => b.total - a.total);

  // 4. Process data for Ticket Category vs. Priority (Stacked Bar Chart)
  const categoryPriorityData = React.useMemo(() => {
    const counts = {
      Mechanical: { name: "Mechanical", High: 0, Medium: 0, Low: 0, total: 0 },
      Electrical: { name: "Electrical", High: 0, Medium: 0, Low: 0, total: 0 },
      Software: { name: "Software", High: 0, Medium: 0, Low: 0, total: 0 },
    };

    data.forEach((ticket) => {
      // Exclude resolved and closed
      const status = (ticket.status || "").toLowerCase();
      if (status === "resolved" || status === "closed") return;

      const rawCat = ticket.final_category || ticket.predicted_category;
      let cat = (rawCat || "").toLowerCase();
      let catKey: "Mechanical" | "Electrical" | "Software" | null = null;
      if (cat === "mechanical") catKey = "Mechanical";
      else if (cat === "electrical") catKey = "Electrical";
      else if (cat === "software") catKey = "Software";

      if (!catKey) return;

      let prio = (ticket.priority || "Medium").toLowerCase();
      let prioKey: "High" | "Medium" | "Low" = "Medium";
      if (prio === "high") prioKey = "High";
      else if (prio === "medium") prioKey = "Medium";
      else if (prio === "low") prioKey = "Low";

      counts[catKey][prioKey] += 1;
      counts[catKey].total += 1;
    });

    return Object.values(counts);
  }, [data]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-pulse">
        <div className="h-[350px] rounded-xl bg-card border border-border" />
        <div className="h-[350px] rounded-xl bg-card border border-border" />
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

  // Custom Tooltip for Technician Queue
  const CustomTechTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border border-slate-700 bg-slate-900/95 p-3 shadow-xl backdrop-blur-md">
          <p className="mb-1.5 text-sm font-semibold text-slate-200">{label}</p>
          <p className="text-xs font-medium text-rose-500">High Priority: {data.High}</p>
          <p className="text-xs font-medium text-amber-500">Medium Priority: {data.Medium}</p>
          <p className="text-xs font-medium text-emerald-500">Low Priority: {data.Low}</p>
          <p className="text-sm font-semibold text-violet-400 mt-1 border-t border-slate-800 pt-1">
            Total Active Tickets: {data.total}
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Category vs Priority
  const CustomCatPrioTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border border-slate-700 bg-slate-900/95 p-3 shadow-xl backdrop-blur-md">
          <p className="mb-1.5 text-sm font-semibold text-slate-200">{label}</p>
          <p className="text-xs font-medium text-rose-500">High Priority: {data.High}</p>
          <p className="text-xs font-medium text-amber-500">Medium Priority: {data.Medium}</p>
          <p className="text-xs font-medium text-emerald-500">Low Priority: {data.Low}</p>
          <p className="text-sm font-semibold text-violet-400 mt-1 border-t border-slate-800 pt-1">
            Total Active Tickets: {data.total}
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
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a0a0a] shadow-sm p-5 flex flex-col h-[350px]">
        <div className="mb-2">
          <h3 className="flex items-center gap-2 text-base font-semibold text-slate-800 dark:text-slate-200">
            <BarChart3 className="h-4 w-4 text-slate-500 dark:text-slate-400" /> Tickets by Category
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Number of tickets by category from Supabase.
          </p>
        </div>
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
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
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a0a0a] shadow-sm p-5 flex flex-col h-[350px]">
        <div className="mb-2">
          <h3 className="flex items-center gap-2 text-base font-semibold text-slate-800 dark:text-slate-200">
            <PieChartIcon className="h-4 w-4 text-slate-500 dark:text-slate-400" /> Ticket Priority Breakdown
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Current ticket distribution by priority from Supabase.
          </p>
        </div>
        <div className="flex-1 w-full min-h-0 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomPieTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="square" 
                formatter={renderLegendText}
                wrapperStyle={{ paddingTop: "10px" }}
              />
              <Pie
                data={priorityChartData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={90}
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

      {/* Technician Queue Depth (Horizontal Bar Chart) */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a0a0a] shadow-sm p-5 flex flex-col h-[350px]">
        <div className="mb-2">
          <h3 className="flex items-center gap-2 text-base font-semibold text-slate-800 dark:text-slate-200">
            <Users className="h-4 w-4 text-slate-500 dark:text-slate-400" /> Technician Workload
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Active tickets assigned to each maintenance technician.
          </p>
        </div>
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={techQueueData} 
              layout="vertical"
              margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={true} horizontal={false} />
              <XAxis 
                type="number"
                stroke="#737373" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(val) => Math.floor(val).toString()}
              />
              <YAxis 
                type="category"
                dataKey="name" 
                stroke="#737373" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false} 
                width={90}
              />
              <Tooltip cursor={{ fill: '#262626', opacity: 0.3 }} content={<CustomTechTooltip />} />
              <Bar dataKey="Low" stackId="a" fill={PRIORITY_COLORS.Low} />
              <Bar dataKey="Medium" stackId="a" fill={PRIORITY_COLORS.Medium} />
              <Bar dataKey="High" stackId="a" fill={PRIORITY_COLORS.High} />
              <Legend verticalAlign="bottom" height={24} iconType="circle" iconSize={8} formatter={renderLegendText} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ticket Category vs. Priority Chart */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a0a0a] shadow-sm p-5 flex flex-col h-[350px]">
        <div className="mb-2">
          <h3 className="flex items-center gap-2 text-base font-semibold text-slate-800 dark:text-slate-200">
            <BarChart3 className="h-4 w-4 text-slate-500 dark:text-slate-400" /> Category vs. Priority
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Active tickets by category stacked by priority breakdown.
          </p>
        </div>
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryPriorityData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} horizontal={true} />
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
              <Tooltip cursor={{ fill: '#262626', opacity: 0.3 }} content={<CustomCatPrioTooltip />} />
              <Bar dataKey="Low" stackId="a" fill={PRIORITY_COLORS.Low} />
              <Bar dataKey="Medium" stackId="a" fill={PRIORITY_COLORS.Medium} />
              <Bar dataKey="High" stackId="a" fill={PRIORITY_COLORS.High} radius={[6, 6, 0, 0]} />
              <Legend verticalAlign="bottom" height={24} iconType="circle" iconSize={8} formatter={renderLegendText} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
