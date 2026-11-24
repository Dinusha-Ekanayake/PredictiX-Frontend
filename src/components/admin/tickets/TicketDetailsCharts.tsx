"use client";

import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,


  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,

  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";
import { apiGet } from "@/lib/apiClient";
import { LineChart } from "lucide-react";

type HistoryEntry = {
  created_at: string;
  new_status: string;
  old_status: string | null;
};

type TicketDetailsChartsProps = {
  ticketId: string;
  createdAt: string;
  resolvedAt: string | null;
  closedAt: string | null;
  currentStatus: string;
  history: HistoryEntry[];
  assetId: string | null;
};

const PRIORITY_COLORS = {
  high: "#f59e0b",   // Orange
  medium: "#3b82f6", // Blue
  low: "#94a3b8",    // Slate/Gray
};

export default function TicketDetailsCharts({
  ticketId,
  assetId,
}: TicketDetailsChartsProps) {
  const [assetTickets, setAssetTickets] = useState<any[]>([]);
  const [loadingAsset, setLoadingAsset] = useState(false);

  // Load other tickets for the same asset.
  //
  // State is set inside the async body rather than synchronously in the effect,
  // which would trigger a cascading render. The cancelled flag stops a slow
  // response from an earlier asset overwriting a newer one.
  useEffect(() => {
    if (!assetId) return;
    let cancelled = false;

    (async () => {
      setLoadingAsset(true);
      try {
        const data = await apiGet<any[]>(`/tickets/?asset_id=${assetId}`);
        if (!cancelled) setAssetTickets(data || []);
      } catch (err) {
        if (!cancelled) console.error("Failed to load asset tickets:", err);
      } finally {
        if (!cancelled) setLoadingAsset(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [assetId, ticketId]);

  // 2. Process Asset Chronology Scatter Plot
  const scatterData = React.useMemo(() => {
    return assetTickets
      .map((t: any) => {
        const createdTime = new Date(t.created_at).getTime();
        const endTime = t.resolved_at || t.closed_at
          ? new Date(t.resolved_at || t.closed_at).getTime()
          : new Date().getTime();

        const resolutionDays = Math.max(0, parseFloat(((endTime - createdTime) / (1000 * 60 * 60 * 24)).toFixed(1)));
        const prio = (t.priority || "medium").toLowerCase();

        return {
          id: t.id,
          title: t.title,
          createdDate: createdTime,
          resolutionTime: resolutionDays,
          priority: prio.charAt(0).toUpperCase() + prio.slice(1),
          fill: PRIORITY_COLORS[prio as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS.medium,
          z: t.id === ticketId ? 250 : 100, // Make current ticket stand out as a bigger bubble
        };
      })
      .sort((a, b) => a.createdDate - b.createdDate);
  }, [assetTickets, ticketId]);

  // Custom Tooltip for Asset Chronology Scatter Plot
  const CustomScatterTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const dateStr = new Date(item.createdDate).toLocaleDateString();
      const isCurrent = item.id === ticketId;
      return (
        <div className="rounded-lg border border-border bg-card/95 p-3 shadow-xl backdrop-blur-md max-w-xs">
          <p className="text-sm font-bold text-foreground truncate flex items-center gap-1.5">
            {isCurrent && <span className="h-2 w-2 rounded-full bg-violet-500 animate-pulse" />}
            {item.title}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Date Created: <span className="text-foreground">{dateStr}</span></p>
          <p className="text-xs text-muted-foreground">Priority: <span className="font-semibold" style={{ color: item.fill }}>{item.priority}</span></p>
          <p className="text-xs text-muted-foreground">Resolution Time: <span className="font-semibold text-foreground">{item.resolutionTime} days</span></p>
          {isCurrent && <p className="text-[10px] text-violet-400 font-semibold mt-1">★ Current Ticket</p>}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full mt-4">
      {/* Asset Chronology Scatter Plot */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a0a0a] p-4 flex flex-col h-[260px]">
        <div className="mb-2">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
            <LineChart className="h-4 w-4 text-slate-500" /> Asset Ticket Chronology
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Resolution time of all tickets related to this asset.
          </p>
        </div>
        <div className="flex-1 w-full min-h-0">
          {loadingAsset ? (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              Loading asset history…
            </div>
          ) : assetTickets.length === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground italic">
              No asset history available.
            </div>
          ) : (
            <ResponsiveContainer initialDimension={{ width: 1, height: 1 }} width="100%" height="100%">
              <ScatterChart margin={{ top: 15, right: 15, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  type="number"
                  dataKey="createdDate"
                  name="Date"
                  domain={["auto", "auto"]}
                  tickFormatter={(t) => new Date(t).toLocaleDateString()}
                  stroke="#737373"
                  fontSize={10}
                  tickLine={false}
                />
                <YAxis
                  type="number"
                  dataKey="resolutionTime"
                  name="Resolution Days"
                  unit="d"
                  stroke="#737373"
                  fontSize={11}
                  tickLine={false}
                />
                <ZAxis type="number" dataKey="z" range={[80, 250]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomScatterTooltip />} />
                <Scatter name="Asset Tickets" data={scatterData}>
                  {scatterData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.fill}
                      stroke={entry.id === ticketId ? "#8b5cf6" : "none"} // Highlight current ticket border
                      strokeWidth={entry.id === ticketId ? 2 : 0}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
