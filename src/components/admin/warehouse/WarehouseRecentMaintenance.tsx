"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench } from "lucide-react";

interface MaintenanceEvent {
  asset: string;
  code: string;
  type: string;
  vendor: string;
  cost: number;
  date: string;
  notes: string;
}

interface Props {
  events?: MaintenanceEvent[];
  isLoading?: boolean;
}

const TYPE_COLORS: Record<string, string> = {
  "Preventive":  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  "Corrective":  "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  "Inspection":  "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
  "Emergency":   "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
};

function typeBadge(type: string) {
  const cls = TYPE_COLORS[type] ?? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${cls}`}>{type}</span>;
}

export default function WarehouseRecentMaintenance({ events = [], isLoading }: Props) {
  if (isLoading) {
    return (
      <Card className="rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Wrench className="h-4 w-4 text-amber-500" /> Recent Maintenance Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-10 rounded-lg animate-pulse bg-muted" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!events || events.length === 0) return null;

  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Wrench className="h-4 w-4 text-amber-500" /> Recent Maintenance Events
          </CardTitle>
          <span className="text-xs text-muted-foreground">Last {events.length} events</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                {["Date", "Asset", "Type", "Vendor", "Cost (LKR)", "Notes"].map(h => (
                  <th
                    key={h}
                    className="pb-2 pr-4 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {events.map((e, i) => (
                <tr
                  key={i}
                  className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="py-2.5 pr-4 font-mono text-xs text-muted-foreground whitespace-nowrap">{e.date}</td>
                  <td className="py-2.5 pr-4">
                    <div className="font-medium text-sm leading-tight">{e.asset}</div>
                    {e.code !== "—" && (
                      <div className="text-[11px] text-muted-foreground font-mono">{e.code}</div>
                    )}
                  </td>
                  <td className="py-2.5 pr-4 whitespace-nowrap">{typeBadge(e.type)}</td>
                  <td className="py-2.5 pr-4 text-xs text-muted-foreground whitespace-nowrap">{e.vendor}</td>
                  <td className="py-2.5 pr-4 text-xs font-semibold tabular-nums">
                    {e.cost > 0 ? e.cost.toLocaleString() : "—"}
                  </td>
                  <td className="py-2.5 text-xs text-muted-foreground max-w-[200px] truncate" title={e.notes}>
                    {e.notes || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
