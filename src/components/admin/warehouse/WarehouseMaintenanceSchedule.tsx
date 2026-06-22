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
    <Card className="rounded-2xl">
      <CardHeader className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-muted-foreground" />
              Predictive Maintenance Schedule
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Showing {displayData.length} of {allData.length} assets | Predicted vs Scheduled maintenance
            </p>
          </div>
        </div>

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
      </CardHeader>

      <CardContent>
        {/* Scrollable Chart Container */}
        <div
          className="border rounded-lg bg-muted/20 overflow-y-auto"
          style={{ maxHeight: "600px", minHeight: "400px" }}
        >
          <div style={{ height: Math.max(500, displayData.length * 50) }} className="w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={displayData}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 200, bottom: 10 }}
                barCategoryGap={12}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis type="number" tick={{ fill: axisColor, fontSize: 12 }} />
                <YAxis
                  type="category"
                  dataKey="asset"
                  tick={{ fill: axisColor, fontSize: 12 }}
                  width={195}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ color: axisColor, paddingTop: "10px" }} />
                <Bar
                  dataKey="predicted"
                  name="🔴 Predicted (weeks)"
                  fill="#ef4444"
                  radius={[0, 8, 8, 0]}
                  barSize={32}
                />
                <Bar
                  dataKey="scheduled"
                  name="🟢 Scheduled (weeks)"
                  fill="#10b981"
                  radius={[0, 8, 8, 0]}
                  barSize={32}
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
