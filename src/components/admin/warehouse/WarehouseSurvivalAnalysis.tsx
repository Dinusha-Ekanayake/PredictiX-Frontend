"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Activity,
  AlertTriangle,
  Clock,
  Gauge,
  HeartPulse,
  ShieldAlert,
  TrendingDown,
  Timer,
  Wallet,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Octagon,
} from "lucide-react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
  ResponsiveContainer,
} from "recharts";
import type {
  SurvivalSummary,
  SurvivalComponentSummary,
} from "@/lib/warehouseService";

interface Props {
  data?: SurvivalSummary | null;
  isLoading?: boolean;
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function fmtMoney(n?: number | null) {
  if (n == null) return "—";
  return `LKR ${Math.round(n).toLocaleString()}`;
}

const COMPONENTS = ["tire", "battery", "hydraulic", "oil", "brake"] as const;
const COMPONENT_COLOR: Record<string, string> = {
  Brake: "#ef4444",
  Tire: "#f59e0b",
  Battery: "#10b981",
  Oil: "#0ea5e9",
  Hydraulic: "#8b5cf6",
};

interface RiskTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: { name: string; avgPct: number; count: number } }>;
  window?: "7d" | "30d";
}

function RiskTooltip({ active, payload, window }: RiskTooltipProps) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 shadow-md text-xs z-50">
      <div className="font-semibold" style={{ color: COMPONENT_COLOR[p.name] }}>{p.name}</div>
      <div className="text-muted-foreground mt-1">
        Avg P(fail) ≤{window}: <span className="font-semibold text-foreground">{p.avgPct}%</span>
      </div>
      <div className="text-muted-foreground">
        {p.count} asset{p.count === 1 ? "" : "s"} at risk
      </div>
    </div>
  );
}

export default function WarehouseSurvivalAnalysis({ data, isLoading }: Props) {
  const [slide, setSlide] = React.useState<0 | 1>(0);

  if (isLoading) {
    return (
      <Card className="rounded-2xl border-teal-100/60 dark:border-teal-900/30 h-full">
        <CardHeader className="pb-3 bg-gradient-to-r from-teal-500/10 via-cyan-500/5 to-transparent border-b border-teal-100/50 dark:border-teal-900/30">
          <CardTitle className="text-base flex items-center gap-2">
            <HeartPulse className="h-4 w-4 text-teal-500" /> Asset component survival analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-64 rounded-xl animate-pulse bg-muted" />
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.component_summary?.length) {
    return (
      <Card className="rounded-2xl border-teal-100/60 dark:border-teal-900/30 h-full">
        <CardHeader className="pb-3 bg-gradient-to-r from-teal-500/10 via-cyan-500/5 to-transparent border-b border-teal-100/50 dark:border-teal-900/30">
          <CardTitle className="text-base flex items-center gap-2">
            <HeartPulse className="h-4 w-4 text-teal-500" /> Asset component survival analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center pt-6">
          <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-3 mb-4">
            <HeartPulse className="h-6 w-6 text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">No critical assets detected</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-[250px]">
            The survival model runs automatically when assets fall below 50% health.
          </p>
        </CardContent>
      </Card>
    );
  }

  const {
    expected_spend_7d,
    expected_spend_30d,
    component_summary,
    assets = [],
  } = data;

  // ── Risk bar-chart data: average P(fail) per component for at-risk assets ──
  const buildChart = (window: "7d" | "30d") => {
    return COMPONENTS.map((c) => {
      const name = cap(c);
      const cs = component_summary.find((x: any) => x.component.toLowerCase() === c);
      
      const avg = window === "7d" ? cs?.avg_fail_prob_7d ?? 0 : cs?.avg_fail_prob_30d ?? 0;
      const count = window === "7d" ? cs?.at_risk_7d ?? 0 : cs?.at_risk_30d ?? 0;
      
      return { name, avgPct: +(avg * 100).toFixed(1), count };
    });
  };

  const slides = [
    {
      key: "7d" as const,
      label: "Next 7 days",
      totalCost: expected_spend_7d,
      data: buildChart("7d"),
    },
    {
      key: "30d" as const,
      label: "Next 30 days (one month)",
      totalCost: expected_spend_30d,
      data: buildChart("30d"),
    },
  ];
  
  const active = slides[slide];

  // Calculate totals for the KPIs
  const totalFailures30d = component_summary.reduce((s, c) => s + (c.at_risk_30d || 0), 0);
  const totalFailures7d = component_summary.reduce((s, c) => s + (c.at_risk_7d || 0), 0);
  const highestRiskComp = [...active.data].sort((a, b) => b.avgPct - a.avgPct)[0];

  const tireRisk = component_summary.find(c => c.component.toLowerCase() === "tire")?.at_risk_7d || 0;
  const batteryRisk = component_summary.find(c => c.component.toLowerCase() === "battery")?.at_risk_7d || 0;
  const hydraulicRisk = component_summary.find(c => c.component.toLowerCase() === "hydraulic")?.at_risk_7d || 0;
  const oilRisk = component_summary.find(c => c.component.toLowerCase() === "oil")?.at_risk_7d || 0;
  const brakeRisk = component_summary.find(c => c.component.toLowerCase() === "brake")?.at_risk_7d || 0;

  return (
    <Card className="rounded-2xl overflow-hidden border-teal-100/60 dark:border-teal-900/30 h-full flex flex-col bg-transparent !border-0 !shadow-none">
      <CardHeader className="pb-3 bg-gradient-to-r from-teal-500/10 via-cyan-500/5 to-transparent border-b border-teal-100/50 dark:border-teal-900/30 rounded-t-2xl">
        <CardTitle className="text-base flex items-center gap-2">
          <HeartPulse className="h-4 w-4 text-teal-500" /> Asset component survival analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 flex flex-col">
        {/* ── Failure-risk bar-chart carousel (7-day / 30-day) ── */}
        <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-4 h-full flex flex-col">
          <div className="flex items-center justify-between gap-2 mb-4">
            <span className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-teal-500" /> Component Failure Risk — {active.label}
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setSlide((s) => (s === 0 ? 1 : 0))}
                aria-label="Previous chart"
                className="rounded-full border border-slate-200 dark:border-slate-700 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <div className="flex items-center gap-1.5 px-1">
                {slides.map((s, i) => (
                  <span
                    key={s.key}
                    className={`h-1.5 rounded-full transition-all ${i === slide ? "w-4 bg-teal-500" : "w-1.5 bg-slate-300 dark:bg-slate-700"}`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => setSlide((s) => (s === 0 ? 1 : 0))}
                aria-label="Next chart"
                className="rounded-full border border-slate-200 dark:border-slate-700 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="w-full mt-2 mb-6" style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={active.data} margin={{ top: 20, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.15)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={false} width={44} />
                <Tooltip content={<RiskTooltip window={active.key} />} cursor={{ fill: "rgba(148,163,184,0.05)" }} />
                <Bar dataKey="avgPct" radius={[4, 4, 0, 0]} maxBarSize={56} isAnimationActive>
                  {active.data.map((d) => (
                    <Cell key={d.name} fill={COMPONENT_COLOR[d.name]} />
                  ))}
                  <LabelList dataKey="avgPct" position="top" formatter={(value) => `${value}%`} fill="#94a3b8" fontSize={10} fontWeight={500} offset={8} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Key Performance Indicator Table */}
          <div className="rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden bg-slate-50/40 dark:bg-slate-900/40">
            <Table>
              <TableHeader className="bg-slate-100/50 dark:bg-slate-800/50">
                <TableRow className="border-b border-slate-200 dark:border-slate-700/50 hover:bg-transparent">
                  <TableHead className="text-slate-600 dark:text-slate-300 font-semibold h-9">Key Performance Indicator</TableHead>
                  <TableHead className="text-slate-600 dark:text-slate-300 font-semibold text-right h-9">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* 30d Failures */}
                <TableRow className="border-b border-slate-200 dark:border-slate-700/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/50">
                  <TableCell className="py-2.5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg p-1.5 bg-rose-500/10">
                        <AlertTriangle className="h-4 w-4 text-rose-500" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-slate-100">Component failures (30d)</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">within the next 30 days</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-lg font-bold text-slate-900 dark:text-slate-100">{totalFailures30d}</TableCell>
                </TableRow>

                {/* 7d Failures */}
                <TableRow className="border-b border-slate-200 dark:border-slate-700/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/50">
                  <TableCell className="py-2.5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg p-1.5 border border-amber-500/20 bg-amber-500/10">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-slate-100">Component failures (7d)</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">within the next 7 days</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-lg font-bold text-slate-900 dark:text-slate-100">{totalFailures7d}</TableCell>
                </TableRow>

                {/* Spend */}
                <TableRow className="border-b border-slate-200 dark:border-slate-700/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/50">
                  <TableCell className="py-2.5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg p-1.5 bg-teal-500/10">
                        <Wallet className="h-4 w-4 text-teal-500" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-slate-100">Est. replacement spend</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">based on cost-estimation model</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-lg font-bold text-teal-500 dark:text-teal-400">{fmtMoney(expected_spend_7d)}</TableCell>
                </TableRow>

                {/* Highest Risk Component */}
                <TableRow className="border-b border-slate-200 dark:border-slate-700/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/50">
                  <TableCell className="py-2.5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg p-1.5 bg-fuchsia-500/10">
                        <TrendingDown className="h-4 w-4 text-fuchsia-500" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-slate-100">Highest Risk Component</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">component with highest average failure probability</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-lg font-bold text-slate-900 dark:text-slate-100">{highestRiskComp?.name ?? "—"}</TableCell>
                </TableRow>

                {/* Tire Component Risk */}
                <TableRow className="border-b border-slate-200 dark:border-slate-700/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/50">
                  <TableCell className="py-2.5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg p-1.5 bg-amber-500/10">
                        <Gauge className="h-4 w-4 text-amber-500" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-slate-100">Tire Component Risk</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">assets at risk ≤7d</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-lg font-bold text-slate-900 dark:text-slate-100">{tireRisk}</TableCell>
                </TableRow>

                {/* Battery Component Risk */}
                <TableRow className="border-b border-slate-200 dark:border-slate-700/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/50">
                  <TableCell className="py-2.5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg p-1.5 bg-emerald-500/10">
                        <HeartPulse className="h-4 w-4 text-emerald-500" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-slate-100">Battery Component Risk</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">assets at risk ≤7d</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-lg font-bold text-slate-900 dark:text-slate-100">{batteryRisk}</TableCell>
                </TableRow>
                
                {/* Hydraulic Component Risk */}
                <TableRow className="border-b border-slate-200 dark:border-slate-700/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/50">
                  <TableCell className="py-2.5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg p-1.5 bg-indigo-500/10">
                        <Activity className="h-4 w-4 text-indigo-500" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-slate-100">Hydraulic Component Risk</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">assets at risk ≤7d</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-lg font-bold text-slate-900 dark:text-slate-100">{hydraulicRisk}</TableCell>
                </TableRow>

                {/* Oil Component Risk */}
                <TableRow className="border-b border-slate-200 dark:border-slate-700/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/50">
                  <TableCell className="py-2.5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg p-1.5 bg-sky-500/10">
                        <Droplets className="h-4 w-4 text-sky-500" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-slate-100">Oil Component Risk</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">assets at risk ≤7d</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-lg font-bold text-slate-900 dark:text-slate-100">{oilRisk}</TableCell>
                </TableRow>

                {/* Brake Component Risk */}
                <TableRow className="hover:bg-slate-100/50 dark:hover:bg-slate-800/50">
                  <TableCell className="py-2.5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg p-1.5 bg-rose-500/10">
                        <Octagon className="h-4 w-4 text-rose-500" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-slate-100">Brake Component Risk</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">assets at risk ≤7d</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-lg font-bold text-slate-900 dark:text-slate-100">{brakeRisk}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <p className="text-[11px] text-muted-foreground mt-4 leading-relaxed">
            The Component Failure Risk chart dynamically filters your fleet data. For the {active.label} view, 
            the average failure probability bars only factor in assets with an estimated Remaining Useful Life (RUL) of 
            ≤ {active.key.replace("d", " days")}. This highly-targeted logic isolates true high-risk assets rather than 
            diluting the percentages with healthy vehicles.
          </p>

        </div>
      </CardContent>
    </Card>
  );
}
