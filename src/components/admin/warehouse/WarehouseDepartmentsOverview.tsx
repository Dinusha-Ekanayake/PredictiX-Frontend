"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, Truck, Ticket } from "lucide-react";

export interface DepartmentOverviewRow {
  id: string;
  name: string;
  code: string;
  activeUsers: number;
  assetCount: number;
  ticketCount: number;
  openTickets: number;
}

interface Props {
  departments?: DepartmentOverviewRow[];
  isLoading?: boolean;
}

export default function WarehouseDepartmentsOverview({ departments = [], isLoading }: Props) {
  if (isLoading) {
    return (
      <Card className="rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4 text-indigo-500" /> Departments Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 rounded-lg animate-pulse bg-muted" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!departments || departments.length === 0) return null;

  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4 text-indigo-500" /> Departments Overview
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            {departments.length} department{departments.length === 1 ? "" : "s"}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="pb-2 pr-4 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                  Department
                </th>
                <th className="pb-2 pr-4 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                  <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> Active Users</span>
                </th>
                <th className="pb-2 pr-4 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                  <span className="inline-flex items-center gap-1"><Truck className="h-3 w-3" /> Assets</span>
                </th>
                <th className="pb-2 pr-4 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                  <span className="inline-flex items-center gap-1"><Ticket className="h-3 w-3" /> Tickets</span>
                </th>
                <th className="pb-2 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                  Open
                </th>
              </tr>
            </thead>
            <tbody>
              {departments.map((d) => (
                <tr
                  key={d.id}
                  className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="py-2.5 pr-4">
                    <div className="font-medium text-sm leading-tight">{d.name}</div>
                    <div className="text-[11px] text-muted-foreground font-mono">{d.code}</div>
                  </td>
                  <td className="py-2.5 pr-4 text-sm font-semibold tabular-nums">{d.activeUsers}</td>
                  <td className="py-2.5 pr-4 text-sm font-semibold tabular-nums">{d.assetCount}</td>
                  <td className="py-2.5 pr-4 text-sm font-semibold tabular-nums">{d.ticketCount}</td>
                  <td className="py-2.5 text-sm tabular-nums">
                    {d.openTickets > 0 ? (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                        {d.openTickets}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
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
