"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
} from "lucide-react";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  Legend,
} from "recharts";

/* ------------------------------ Demo Data ------------------------------ */

const healthTrendData = [
  { month: "Jul", assetsInMaintenance: 10, avgHealth: 92 },
  { month: "Aug", assetsInMaintenance: 15, avgHealth: 89 },
  { month: "Sep", assetsInMaintenance: 18, avgHealth: 86 },
  { month: "Oct", assetsInMaintenance: 22, avgHealth: 83 },
  { month: "Nov", assetsInMaintenance: 28, avgHealth: 80 },
  { month: "Dec", assetsInMaintenance: 35, avgHealth: 77 },
];

const assetStatusData = [
  { name: "Operational", value: 67 },
  { name: "Maintenance", value: 17 },
  { name: "Critical", value: 17 },
  { name: "Offline", value: 0 },
];

const healthScoreBuckets = [
  { range: "90–100%", assets: 2 },
  { range: "80–89%", assets: 1 },
  { range: "70–79%", assets: 1 },
  { range: "60–69%", assets: 1 },
  { range: "< 60%", assets: 1 },
];

const ticketPriorityData = [
  { name: "Low", value: 1 },
  { name: "Medium", value: 1 },
  { name: "High", value: 1 },
  { name: "Critical", value: 1 },
];

const ticketsByCategory = [
  { category: "Electrical", tickets: 1 },
  { category: "Mechanical", tickets: 2 },
  { category: "Software", tickets: 1 },
];

const assetsByType = [
  { type: "Material Handling", assets: 2 },
  { type: "Automation", assets: 2 },
  { type: "Heavy Equipment", assets: 1 },
  { type: "Climate Control", assets: 1 },
];

const predictiveScheduleData = [
  { asset: "HVAC H-A1", scheduled: 5, predicted: 3 },
  { asset: "Pallet Jack PJ-05", scheduled: 4, predicted: 2 },
  { asset: "Loading Dock LD-03", scheduled: 3, predicted: 2 },
  { asset: "Conveyor CN-12", scheduled: 4, predicted: 4 },
  { asset: "Forklift FL-08", scheduled: 5, predicted: 5 },
];

const monthlyTicketVolume = [
  { month: "Jul", tickets: 12 },
  { month: "Aug", tickets: 18 },
  { month: "Sep", tickets: 14 },
  { month: "Oct", tickets: 16 },
  { month: "Nov", tickets: 20 },
  { month: "Dec", tickets: 7 },
];

const STATUS_COLORS = ["#22c55e", "#eab308", "#ef4444", "#94a3b8"];
const PRIORITY_COLORS = ["#3b82f6", "#f59e0b", "#f97316", "#ef4444"];

function chartTooltipStyle() {
  return {
    backgroundColor: "#0b1220",
    border: "1px solid #334155",
    borderRadius: 12,
    color: "#e2e8f0",
  } as const;
}

function KpiCard(props: {
  title: string;
  value: string;
  helper: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium">{props.title}</CardTitle>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-sky-600 dark:border-slate-800 dark:bg-slate-950 dark:text-sky-300">
          {props.icon}
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="text-3xl font-semibold tracking-tight">{props.value}</div>
        <div className="text-sm text-slate-500 dark:text-slate-400">
          {props.helper}
        </div>
      </CardContent>
    </Card>
  );
}

function ChartCard(props: {
  title: string;
  description?: string;
  heightClass: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">{props.title}</CardTitle>
        {props.description ? (
          <CardDescription>{props.description}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent>
        <div className={props.heightClass}>{props.children}</div>
      </CardContent>
    </Card>
  );
}

export function WarehouseInsightsSection() {
  return (
    <section className="space-y-4">
      {/* KPI row */}
      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard
          title="Average Health"
          value="77%"
          helper="Across all assets"
          icon={<Activity className="h-5 w-5" />}
        />
        <KpiCard
          title="Healthy Assets"
          value="3"
          helper="50% of total"
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
        />
        <KpiCard
          title="At Risk"
          value="1"
          helper="Require attention"
          icon={<AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400" />}
        />
        <KpiCard
          title="Active Tickets"
          value="3"
          helper="Of 4 total"
          icon={<BarChart3 className="h-5 w-5 text-violet-600 dark:text-violet-300" />}
        />
      </div>

      {/* Row 1 */}
      <div className="grid gap-4 md:grid-cols-2">
        <ChartCard
          title="Health & Maintenance Trends"
          description="Assets in maintenance vs Avg health score"
          heightClass="h-[260px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={healthTrendData} margin={{ left: 8, right: 8, top: 10 }}>
              <defs>
                <linearGradient id="gradMaint" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.7} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradHealth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.7} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} stroke="#94a3b8" />
              <YAxis yAxisId="left" tickLine={false} axisLine={false} stroke="#94a3b8" width={32} />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickLine={false}
                axisLine={false}
                stroke="#94a3b8"
                width={42}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip contentStyle={chartTooltipStyle()} labelStyle={{ color: "#e2e8f0" }} />
              <Legend />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="assetsInMaintenance"
                name="Assets in maintenance"
                stroke="#22c55e"
                fill="url(#gradMaint)"
                strokeWidth={2}
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="avgHealth"
                name="Avg health score"
                stroke="#38bdf8"
                fill="url(#gradHealth)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Asset Status Distribution"
          description="Share of assets by status"
          heightClass="h-[260px]"
        >
          <div className="flex h-full items-center gap-4">
            <div className="h-full flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip contentStyle={chartTooltipStyle()} labelStyle={{ color: "#e2e8f0" }} />
                  <Pie
                    data={assetStatusData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                  >
                    {assetStatusData.map((_, i) => (
                      <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-44 space-y-2 text-sm">
              {assetStatusData.map((s, i) => (
                <div key={s.name} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: STATUS_COLORS[i % STATUS_COLORS.length] }}
                    />
                    <span className="text-slate-700 dark:text-slate-300">{s.name}</span>
                  </div>
                  <span className="text-slate-500 dark:text-slate-400">{s.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Row 2 */}
      <div className="grid gap-4 md:grid-cols-2">
        <ChartCard
          title="Health Score Distribution"
          description="Number of assets per range"
          heightClass="h-[220px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={healthScoreBuckets} margin={{ left: 8, right: 8, top: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="range" tickLine={false} axisLine={false} stroke="#94a3b8" />
              <YAxis tickLine={false} axisLine={false} stroke="#94a3b8" width={32} />
              <Tooltip contentStyle={chartTooltipStyle()} labelStyle={{ color: "#e2e8f0" }} />
              <Bar dataKey="assets" fill="#22d3ee" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Ticket Priority Breakdown"
          description="Open tickets by priority"
          heightClass="h-[220px]"
        >
          <div className="flex h-full items-center gap-4">
            <div className="h-full flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip contentStyle={chartTooltipStyle()} labelStyle={{ color: "#e2e8f0" }} />
                  <Pie
                    data={ticketPriorityData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    paddingAngle={2}
                  >
                    {ticketPriorityData.map((_, i) => (
                      <Cell key={i} fill={PRIORITY_COLORS[i % PRIORITY_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-44 space-y-2 text-sm">
              {ticketPriorityData.map((p, i) => (
                <div key={p.name} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: PRIORITY_COLORS[i % PRIORITY_COLORS.length] }}
                    />
                    <span className="text-slate-700 dark:text-slate-300">{p.name}</span>
                  </div>
                  <span className="text-slate-500 dark:text-slate-400">{p.value}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Row 3 */}
      <div className="grid gap-4 md:grid-cols-2">
        <ChartCard
          title="Tickets by Category"
          description="Open tickets across categories"
          heightClass="h-[220px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ticketsByCategory} margin={{ left: 8, right: 8, top: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="category" tickLine={false} axisLine={false} stroke="#94a3b8" />
              <YAxis tickLine={false} axisLine={false} stroke="#94a3b8" width={32} />
              <Tooltip contentStyle={chartTooltipStyle()} labelStyle={{ color: "#e2e8f0" }} />
              <Bar dataKey="tickets" fill="#a855f7" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Assets by Type"
          description="Inventory split by asset family"
          heightClass="h-[220px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={assetsByType} margin={{ left: 110, right: 18, top: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
              <XAxis type="number" tickLine={false} axisLine={false} stroke="#94a3b8" />
              <YAxis type="category" dataKey="type" tickLine={false} axisLine={false} stroke="#94a3b8" />
              <Tooltip contentStyle={chartTooltipStyle()} labelStyle={{ color: "#e2e8f0" }} />
              <Bar dataKey="assets" fill="#10b981" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Predictive schedule */}
      <ChartCard
        title="Predictive Maintenance Schedule"
        description="Scheduled vs predicted maintenance window"
        heightClass="h-[240px]"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={predictiveScheduleData} margin={{ left: 8, right: 8, top: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="asset" tickLine={false} axisLine={false} stroke="#94a3b8" />
            <YAxis tickLine={false} axisLine={false} stroke="#94a3b8" width={32} />
            <Tooltip contentStyle={chartTooltipStyle()} labelStyle={{ color: "#e2e8f0" }} />
            <Legend />
            <Bar dataKey="predicted" name="Predicted Need (days)" fill="#fb7185" radius={[4, 4, 0, 0]} />
            <Bar dataKey="scheduled" name="Scheduled (days)" fill="#22c55e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Monthly ticket volume */}
      <ChartCard
        title="Monthly Ticket Volume"
        description="Total tickets created in the last 6 months"
        heightClass="h-[260px]"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={monthlyTicketVolume} margin={{ left: 8, right: 8, top: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} stroke="#94a3b8" />
            <YAxis tickLine={false} axisLine={false} stroke="#94a3b8" width={32} />
            <Tooltip contentStyle={chartTooltipStyle()} labelStyle={{ color: "#e2e8f0" }} />
            <Line
              type="monotone"
              dataKey="tickets"
              stroke="#a855f7"
              strokeWidth={2}
              dot={{ r: 3, fill: "#a855f7" }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </section>
  );
}

export default WarehouseInsightsSection;