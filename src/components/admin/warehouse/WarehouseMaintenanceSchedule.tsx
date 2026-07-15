"use client";

import * as React from "react";
import { useEffect, useState } from "react";
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
import { CalendarClock, Lightbulb, Loader2, ArrowUpDown } from "lucide-react";
import { useTheme } from "next-themes";
import { getMaintenanceSchedule } from "@/lib/warehouseService";
import { Button } from "@/components/ui/button";

type SortBy = "urgent" | "alphabetical";

// Custom Tooltip for professional look
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-slate-200/20 dark:border-white/10 bg-white/80 dark:bg-black/40 backdrop-blur-md p-4 shadow-2xl">
        <p className="font-semibold text-sm mb-3 text-slate-900 dark:text-white">{label}</p>
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => {
            const isPredicted = entry.dataKey === "predicted";
            return (
              <div key={index} className="flex items-center justify-between gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="h-2.5 w-2.5 rounded-full shadow-sm" 
                    style={{ backgroundColor: isPredicted ? "#f43f5e" : "#10b981" }} 
                  />
                  <span className="text-slate-600 dark:text-slate-300 font-medium">
                    {isPredicted ? "Predicted RUL" : "Scheduled Service"}
                  </span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white font-mono">
                  {entry.value} wks
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

export default function WarehouseMaintenanceSchedule({ data: propsData }: { data?: any[] } = {}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  
  // If an array is passed (even empty), it means the parent manages the data — never self-fetch.
  const managedExternally = Array.isArray(propsData);

  const [allData, setAllData] = useState<any[]>(propsData ?? []);
  const [displayData, setDisplayData] = useState<any[]>([]);
  const [loading, setLoading] = useState(!managedExternally);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>("urgent");
  const [itemsToShow, setItemsToShow] = useState(15);

  // Sync externally-managed data into local state
  useEffect(() => {
    if (managedExternally) {
      setAllData(propsData!);
      setLoading(false);
      return;
    }

    // No prop passed — self-fetch as fallback
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedData = await getMaintenanceSchedule();
        setAllData(fetchedData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load maintenance schedule';
        console.warn('[WarehouseMaintenanceSchedule] fetch failed:', errorMessage);
        setError(errorMessage);
        setAllData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [propsData, managedExternally]);

  // Update display data based on sort and filter
  useEffect(() => {
    let sorted = [...allData];

    if (sortBy === "urgent") {
      // Sort by urgency: where predicted < scheduled (needs maintenance sooner)
      sorted.sort((a, b) => {
        const diffA = (a.predicted || 0) - (a.scheduled || 0);
        const diffB = (b.predicted || 0) - (b.scheduled || 0);
        return diffA - diffB; // Most urgent first (most negative)
      });
    } else {
      // Sort alphabetically by asset name
      sorted.sort((a, b) => (a.asset || "").localeCompare(b.asset || ""));
    }

    setDisplayData(sorted.slice(0, itemsToShow));
  }, [allData, sortBy, itemsToShow]);

  const axisColor = isDark ? "#cbd5e1" : "#475569";
  const gridColor = isDark
    ? "rgba(148, 163, 184, 0.18)"
    : "rgba(148, 163, 184, 0.3)";
  const tooltipStyle = {
    backgroundColor: isDark ? "#0f172a" : "#ffffff",
    border: isDark ? "1px solid #334155" : "1px solid #e2e8f0",
    color: isDark ? "#f8fafc" : "#0f172a",
  };

  // Show loading state
  if (loading) {
    return null;
  }

  // Show error state
  if (error) {
    return (
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
            Predictive Maintenance Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">Error: {error}</p>
        </CardContent>
      </Card>
    );
  }

  // Only show chart if real data exists
  if (!allData || allData.length === 0) {
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
    <Card className="rounded-2xl overflow-hidden border-teal-100/60 dark:border-teal-900/30 h-full flex flex-col p-0 gap-0">
      {/* Gradient header strip */}
      <div className="bg-gradient-to-r from-teal-500/10 via-cyan-500/5 to-transparent px-6 py-4 border-b border-teal-100/50 dark:border-teal-900/30 shrink-0">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-teal-500/15 p-2">
              <CalendarClock className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold leading-tight">Predictive Maintenance Schedule</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Showing {displayData.length} of {allData.length} assets | Predicted vs Scheduled maintenance
              </p>
            </div>
          </div>
        </div>
      </div>

      <CardContent className="space-y-4 pt-6 flex-1 flex flex-col">

        {/* Controls */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={sortBy === "urgent" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("urgent")}
            className="gap-1"
          >
            <ArrowUpDown className="h-3 w-3" />
            Most Urgent First
          </Button>
          <Button
            variant={sortBy === "alphabetical" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("alphabetical")}
            className="gap-1"
          >
            <ArrowUpDown className="h-3 w-3" />
            A-Z
          </Button>

          <div className="ml-auto flex gap-1">
            {[10, 15, 20, 30].map((num) => (
              <Button
                key={num}
                variant={itemsToShow === num ? "default" : "outline"}
                size="sm"
                onClick={() => setItemsToShow(num)}
              >
                {num}
              </Button>
            ))}
          </div>
        </div>

        {/* Scrollable Chart Container */}
        <div
          className="border rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 overflow-y-auto"
          style={{ maxHeight: "600px", minHeight: "400px" }}
        >
          <div style={{ height: Math.max(500, displayData.length * 60) }} className="w-full pt-4">
            <ResponsiveContainer minWidth={0} minHeight={0} width="100%" height="100%">
                <BarChart
                  data={displayData}
                  layout="vertical"
                  margin={{ top: 10, right: 20, left: 120, bottom: 20 }}
                  barCategoryGap={20}
                >
                  <defs>
                    <linearGradient id="colorPredicted" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#fb923c" stopOpacity={0.9} />
                    </linearGradient>
                    <linearGradient id="colorScheduled" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#0d9488" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.9} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridColor} />
                  <XAxis 
                    type="number" 
                    tick={{ fill: axisColor, fontSize: 11, fontWeight: 500 }} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <YAxis
                    type="category"
                    dataKey="asset"
                    tick={{ fill: axisColor, fontSize: 11, fontWeight: 500 }}
                    width={110}
                    axisLine={false}
                    tickLine={false}
                  />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }} />
                <Legend 
                  wrapperStyle={{ paddingTop: "20px", fontSize: "13px", fontWeight: 500, color: axisColor }} 
                  iconType="circle"
                />
                <Bar
                  dataKey="predicted"
                  name="Predicted RUL"
                  fill="url(#colorPredicted)"
                  radius={[0, 6, 6, 0]}
                  barSize={16}
                  animationDuration={1500}
                />
                <Bar
                  dataKey="scheduled"
                  name="Scheduled Service"
                  fill="url(#colorScheduled)"
                  radius={[0, 6, 6, 0]}
                  barSize={16}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-6 rounded-xl border bg-muted/25 px-4 py-3">
          <div className="flex items-start gap-2">
            <Lightbulb className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Quick Tips:</span>
              <ul className="mt-1 space-y-1 list-disc list-inside">
                <li>Red bars shorter than green = needs maintenance sooner than scheduled</li>
                <li>Click "Most Urgent First" to prioritize high-risk assets</li>
                <li>Use the number buttons to show more assets at once</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
