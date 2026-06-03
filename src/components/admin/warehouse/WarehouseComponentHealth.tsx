"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cpu, AlertCircle } from "lucide-react";

interface ComponentHealth {
  avg_tire?: number;
  avg_brake?: number;
  avg_battery?: number;
  avg_oil?: number;
  avg_hydraulic?: number;
}

interface Props {
  componentHealth?: ComponentHealth;
  totalFaultCodes?: number;
  assetsWithSensors?: number;
  isLoading?: boolean;
}

const COMPONENTS = [
  { key: "avg_tire",      label: "Tire",      unit: "%" },
  { key: "avg_brake",     label: "Brake",     unit: "%" },
  { key: "avg_battery",   label: "Battery",   unit: "%" },
  { key: "avg_oil",       label: "Oil Life",  unit: "%" },
  { key: "avg_hydraulic", label: "Hydraulic", unit: "%" },
] as const;

function healthColor(val: number) {
  if (val >= 80) return { bar: "#10b981", text: "#059669", label: "Good" };
  if (val >= 60) return { bar: "#f59e0b", text: "#d97706", label: "Monitor" };
  return { bar: "#ef4444", text: "#dc2626", label: "Action Needed" };
}

export default function WarehouseComponentHealth({ componentHealth, totalFaultCodes = 0, assetsWithSensors = 0, isLoading }: Props) {
  if (isLoading) {
    return (
      <Card className="rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Cpu className="h-4 w-4 text-teal-500" /> Component Health Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-24 rounded-xl animate-pulse bg-muted" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasData = componentHealth && Object.values(componentHealth).some(v => (v ?? 0) > 0);
  if (!hasData) return null;

  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Cpu className="h-4 w-4 text-teal-500" /> Component Health Overview
          </CardTitle>
          {assetsWithSensors > 0 && (
            <span className="text-xs text-muted-foreground">{assetsWithSensors} assets with sensor data</span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {COMPONENTS.map(({ key, label }) => {
            const val = componentHealth?.[key] ?? 0;
            const { bar, text, label: statusLabel } = healthColor(val);
            return (
              <div
                key={key}
                className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 p-4 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
                  <span className="text-sm font-bold" style={{ color: text }}>{val.toFixed(1)}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(val, 100)}%`, backgroundColor: bar }}
                  />
                </div>
                <span className="text-[11px] font-medium" style={{ color: text }}>{statusLabel}</span>
              </div>
            );
          })}
        </div>

        {totalFaultCodes > 0 && (
          <div className="flex items-center gap-3 rounded-xl border border-rose-100 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/10 px-4 py-3">
            <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
            <span className="text-sm text-rose-700 dark:text-rose-400">
              <span className="font-bold">{totalFaultCodes}</span> active fault code{totalFaultCodes !== 1 ? "s" : ""} detected across the fleet.{" "}
              <span className="text-rose-500 dark:text-rose-500">Review sensor logs for affected assets.</span>
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
