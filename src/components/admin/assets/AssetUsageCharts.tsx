"use client";

import * as React from "react";
import {
  Area, Bar, CartesianGrid, ComposedChart, Line,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import type { UsagePoint } from "./types";

const COLOR = {
  operating: "#0d9488",
  idle: "#94a3b8",
  distance: "#6366f1",
  downtime: "#f97316",
  sinceService: "#0ea5e9",
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * A month formatted for the x-axis, e.g. "Sep 24".
 *
 * The date parts are read straight out of the string rather than through a
 * Date. A "YYYY-MM-DD" value parses as UTC midnight, which falls in the
 * previous month for any viewer behind UTC, and locale month names are not
 * uniform in length ("Sept" under en-GB) which makes the axis ragged.
 */
export function formatPeriod(iso: string): string {
  const m = /^(\d{4})-(\d{2})-\d{2}/.exec(iso);
  if (!m) return iso;
  const month = MONTHS[Number(m[2]) - 1];
  if (!month) return iso;
  return `${month} ${m[1].slice(2)}`;
}

export type ChartRow = {
  period: string;
  label: string;
  operating: number | null;
  idle: number | null;
  distance: number | null;
  sinceService: number | null;
  downtime: number | null;
};

/** Reshape the API's points for recharts, keeping nulls as gaps. */
export function toChartRows(points: UsagePoint[]): ChartRow[] {
  return points.map((p) => ({
    period: p.period,
    label: formatPeriod(p.period),
    operating: p.operating_hours,
    idle: p.idle_hours,
    distance: p.distance_km,
    sinceService: p.days_since_last_service,
    downtime: p.downtime_hours_90d,
  }));
}

/**
 * Whether a series can be drawn as a line.
 *
 * A single point draws no visible line, so it is reported separately and shown
 * as a value instead of an empty chart. "empty" also covers a series whose
 * every month came back null.
 */
export function seriesState(
  rows: ChartRow[], keys: Array<keyof ChartRow>,
): "empty" | "single" | "ok" {
  const usable = rows.filter((r) => keys.some((k) => r[k] != null));
  if (usable.length === 0) return "empty";
  if (usable.length === 1) return "single";
  return "ok";
}

/** Total hours the asset was running vs sitting, across the whole window. */
export function dutySplit(rows: ChartRow[]): { operating: number; idle: number; idlePct: number } | null {
  const operating = rows.reduce((sum, r) => sum + (r.operating ?? 0), 0);
  const idle = rows.reduce((sum, r) => sum + (r.idle ?? 0), 0);
  const total = operating + idle;
  if (total <= 0) return null;
  return {
    operating: Math.round(operating),
    idle: Math.round(idle),
    idlePct: Math.round((idle / total) * 100),
  };
}

/**
 * Each month the days-since-service counter fell, meaning the asset was
 * serviced at some point in that month. Counting the drops gives the number of
 * services in the window without needing the maintenance log.
 */
export function countServiceResets(rows: ChartRow[]): number {
  let resets = 0;
  let previous: number | null = null;
  for (const r of rows) {
    const current = r.sinceService;
    if (current == null) continue;
    if (previous != null && current < previous) resets += 1;
    previous = current;
  }
  return resets;
}

function ChartTooltip({ active, payload, label, units }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number | null; color?: string }>;
  label?: string;
  units: Record<string, string>;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 text-xs shadow-lg">
      {label && <p className="mb-1 font-semibold text-foreground">{label}</p>}
      {payload.filter((p) => p.value != null).map((p) => (
        <div key={p.name} className="flex items-center gap-2 text-muted-foreground">
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: p.color }} />
          <span className="flex-1">{p.name}</span>
          <span className="font-semibold text-foreground tabular-nums">
            {p.value}{units[p.name] ?? ""}
          </span>
        </div>
      ))}
    </div>
  );
}

function PanelShell({ title, hint, children }: {
  title: string; hint: string; children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200/80 dark:border-white/6 bg-slate-50/30 dark:bg-white/2 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest">
          {title}
        </div>
        <span className="text-[10px] text-muted-foreground/50 cursor-help" title={hint}>
          What is this?
        </span>
      </div>
      {children}
    </div>
  );
}

function Empty({ message }: { message: string }) {
  return <div className="text-sm text-muted-foreground py-6 text-center">{message}</div>;
}

const AXIS = { fontSize: 10, fill: "currentColor" } as const;

/** Hours worked against hours idle each month, with distance covered. */
export function UtilisationChart({ rows }: { rows: ChartRow[] }) {
  const state = seriesState(rows, ["operating", "idle"]);
  const split = dutySplit(rows);
  const hint =
    "Recorded hours the asset ran and sat idle in each month, with the distance " +
    "it covered. Measured values from its sensor readings, not a prediction.";

  return (
    <PanelShell title="Utilisation & Duty Cycle" hint={hint}>
      {state === "empty" ? (
        <Empty message="No operating hours recorded for this asset yet." />
      ) : state === "single" ? (
        <Empty message="Only one month of operating history so far, not enough to plot a trend." />
      ) : (
        <>
          {split && (
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-muted-foreground">
              <span>Running <b className="text-foreground tabular-nums">{split.operating}h</b></span>
              <span>Idle <b className="text-foreground tabular-nums">{split.idle}h</b></span>
              <span>Idle share <b className="text-foreground tabular-nums">{split.idlePct}%</b></span>
            </div>
          )}
          <div className="h-[190px] text-muted-foreground">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.15} vertical={false} />
                <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={18} />
                <YAxis yAxisId="hours" tick={AXIS} tickLine={false} axisLine={false} width={38} />
                <YAxis yAxisId="km" orientation="right" tick={AXIS} tickLine={false} axisLine={false} width={38} />
                <Tooltip content={<ChartTooltip units={{ Running: "h", Idle: "h", Distance: "km" }} />} />
                <Area yAxisId="hours" type="monotone" dataKey="operating" name="Running" stackId="duty"
                  stroke={COLOR.operating} fill={COLOR.operating} fillOpacity={0.5} connectNulls />
                <Area yAxisId="hours" type="monotone" dataKey="idle" name="Idle" stackId="duty"
                  stroke={COLOR.idle} fill={COLOR.idle} fillOpacity={0.4} connectNulls />
                <Line yAxisId="km" type="monotone" dataKey="distance" name="Distance"
                  stroke={COLOR.distance} strokeWidth={1.75} dot={false} connectNulls />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <Legend items={[
            { color: COLOR.operating, label: "Running hours" },
            { color: COLOR.idle, label: "Idle hours" },
            { color: COLOR.distance, label: "Distance (km)" },
          ]} />
        </>
      )}
    </PanelShell>
  );
}

/** Days since the last service, against downtime logged over the prior 90 days. */
export function ServiceCadenceChart({ rows }: { rows: ChartRow[] }) {
  const state = seriesState(rows, ["sinceService", "downtime"]);
  const resets = countServiceResets(rows);
  const hint =
    "The line counts days since the last service, so each drop is a service " +
    "taking place. Bars are downtime hours logged over the preceding 90 days.";

  return (
    <PanelShell title="Service Cadence & Downtime" hint={hint}>
      {state === "empty" ? (
        <Empty message="No service or downtime history recorded for this asset yet." />
      ) : state === "single" ? (
        <Empty message="Only one month of service history so far, not enough to plot a trend." />
      ) : (
        <>
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-muted-foreground">
            <span>Services in window <b className="text-foreground tabular-nums">{resets}</b></span>
            <span>
              Total downtime{" "}
              <b className="text-foreground tabular-nums">
                {Math.round(rows.reduce((s, r) => s + (r.downtime ?? 0), 0))}h
              </b>
            </span>
          </div>
          <div className="h-[190px] text-muted-foreground">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.15} vertical={false} />
                <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={18} />
                <YAxis yAxisId="hours" tick={AXIS} tickLine={false} axisLine={false} width={38} />
                <YAxis yAxisId="days" orientation="right" tick={AXIS} tickLine={false} axisLine={false} width={38} />
                <Tooltip content={<ChartTooltip units={{ Downtime: "h", "Days since service": "d" }} />} />
                <Bar yAxisId="hours" dataKey="downtime" name="Downtime"
                  fill={COLOR.downtime} fillOpacity={0.55} radius={[2, 2, 0, 0]} />
                <Line yAxisId="days" type="monotone" dataKey="sinceService" name="Days since service"
                  stroke={COLOR.sinceService} strokeWidth={1.75} dot={false} connectNulls />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <Legend items={[
            { color: COLOR.downtime, label: "Downtime (h, prior 90d)" },
            { color: COLOR.sinceService, label: "Days since service" },
          ]} />
        </>
      )}
    </PanelShell>
  );
}

function Legend({ items }: { items: Array<{ color: string; label: string }> }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
      {items.map((it) => (
        <div key={it.label} className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ background: it.color }} />
          <span className="text-[10px] text-muted-foreground/70">{it.label}</span>
        </div>
      ))}
    </div>
  );
}
