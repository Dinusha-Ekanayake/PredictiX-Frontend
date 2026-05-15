// "use client";

// import * as React from "react";
// import {
//   AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
//   XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
// } from "recharts";
// import {
//   Activity, AlertTriangle, ArrowUpRight, Bot, Brain,
//   ChevronRight, Clock, ExternalLink, Flame, Package,
//   RefreshCw, ShieldAlert, Ticket, TrendingDown, TrendingUp,
//   Warehouse, Wrench, Zap, CheckCircle2, Timer, BarChart2,
//   ThumbsUp, CircleDot,
// } from "lucide-react";
// import { cn } from "@/lib/utils";

// // ─── Floating Particle Background ─────────────────────────────────────────────

// function ParticleCanvas() {
//   const canvasRef = React.useRef<HTMLCanvasElement>(null);

//   React.useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const ctx = canvas.getContext("2d");
//     if (!ctx) return;

//     let raf: number;
//     const particles: {
//       x: number; y: number; r: number;
//       vx: number; vy: number; alpha: number; va: number;
//     }[] = [];

//     function resize() {
//       if (!canvas) return;
//       canvas.width  = canvas.offsetWidth;
//       canvas.height = canvas.offsetHeight;
//     }
//     resize();
//     window.addEventListener("resize", resize);

//     const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
//     const COUNT = 55;

//     for (let i = 0; i < COUNT; i++) {
//       particles.push({
//         x: Math.random() * canvas.width,
//         y: Math.random() * canvas.height,
//         r: Math.random() * 1.8 + 0.4,
//         vx: (Math.random() - 0.5) * 0.22,
//         vy: (Math.random() - 0.5) * 0.22,
//         alpha: Math.random() * 0.5 + 0.1,
//         va: (Math.random() - 0.5) * 0.003,
//       });
//     }

//     function draw() {
//       if (!ctx || !canvas) return;
//       ctx.clearRect(0, 0, canvas.width, canvas.height);
//       for (const p of particles) {
//         p.x += p.vx;
//         p.y += p.vy;
//         p.alpha = Math.max(0.05, Math.min(0.6, p.alpha + p.va));
//         if (p.alpha <= 0.05 || p.alpha >= 0.6) p.va *= -1;
//         if (p.x < 0) p.x = canvas.width;
//         if (p.x > canvas.width) p.x = 0;
//         if (p.y < 0) p.y = canvas.height;
//         if (p.y > canvas.height) p.y = 0;

//         ctx.beginPath();
//         ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
//         ctx.fillStyle = isDark
//           ? `rgba(167,139,250,${p.alpha})`
//           : `rgba(109,40,217,${p.alpha * 0.45})`;
//         ctx.fill();
//       }
//       // draw faint connection lines
//       for (let i = 0; i < particles.length; i++) {
//         for (let j = i + 1; j < particles.length; j++) {
//           const dx = particles[i].x - particles[j].x;
//           const dy = particles[i].y - particles[j].y;
//           const d  = Math.sqrt(dx * dx + dy * dy);
//           if (d < 80) {
//             ctx.beginPath();
//             ctx.moveTo(particles[i].x, particles[i].y);
//             ctx.lineTo(particles[j].x, particles[j].y);
//             const a = isDark
//               ? (1 - d / 80) * 0.12
//               : (1 - d / 80) * 0.06;
//             ctx.strokeStyle = isDark
//               ? `rgba(167,139,250,${a})`
//               : `rgba(109,40,217,${a})`;
//             ctx.lineWidth = 0.5;
//             ctx.stroke();
//           }
//         }
//       }
//       raf = requestAnimationFrame(draw);
//     }
//     draw();

//     return () => {
//       cancelAnimationFrame(raf);
//       window.removeEventListener("resize", resize);
//     };
//   }, []);

//   return (
//     <canvas
//       ref={canvasRef}
//       className="pointer-events-none absolute inset-0 w-full h-full"
//       aria-hidden="true"
//     />
//   );
// }

// // ─── Types ────────────────────────────────────────────────────────────────────

// type Trend = "up" | "down" | "flat";

// interface KpiDef {
//   label: string; value: string; sub: string;
//   trend: Trend; delta: string;
//   icon: React.ElementType;
//   iconBg: string; iconColor: string; accent: string;
// }

// interface AlertRow {
//   id: string; severity: "critical" | "warning" | "info";
//   asset: string; location: string; msg: string; ago: string;
// }

// interface TicketRow {
//   id: string; title: string; asset: string;
//   priority: "critical" | "high" | "medium" | "low";
//   status: "open" | "in_progress" | "resolved";
//   person: string;
// }

// interface RiskRow {
//   id: string; name: string; loc: string;
//   score: number; prob: number; days: number;
// }

// // ─── Data ─────────────────────────────────────────────────────────────────────

// const KPI: KpiDef[] = [
//   { label:"Total Assets",       value:"284",  sub:"3 warehouses",        trend:"up",   delta:"+4 this month",     icon:Package,  iconBg:"bg-violet-100 dark:bg-violet-500/15", iconColor:"text-violet-600 dark:text-violet-400", accent:"text-violet-600 dark:text-violet-400" },
//   { label:"Critical Alerts",    value:"12",   sub:"Require action now",  trend:"up",   delta:"+3 yesterday",      icon:Flame,    iconBg:"bg-rose-100 dark:bg-rose-500/15",     iconColor:"text-rose-600 dark:text-rose-400",    accent:"text-rose-600 dark:text-rose-400"    },
//   { label:"Open Tickets",       value:"37",   sub:"9 high priority",     trend:"down", delta:"−5 this week",      icon:Ticket,   iconBg:"bg-amber-100 dark:bg-amber-500/15",   iconColor:"text-amber-600 dark:text-amber-400",  accent:"text-amber-600 dark:text-amber-400"  },
//   { label:"Fleet Health",       value:"76%",  sub:"Fleet-wide average",  trend:"down", delta:"−2.1% this week",   icon:Activity, iconBg:"bg-emerald-100 dark:bg-emerald-500/15",iconColor:"text-emerald-600 dark:text-emerald-400",accent:"text-emerald-600 dark:text-emerald-400"},
//   { label:"Predicted Failures", value:"18",   sub:"Next 8 weeks",        trend:"up",   delta:"+2 new",            icon:Brain,    iconBg:"bg-sky-100 dark:bg-sky-500/15",       iconColor:"text-sky-600 dark:text-sky-400",      accent:"text-sky-600 dark:text-sky-400"      },
//   { label:"Est. Maint. Cost",   value:"2.4M", sub:"LKR · 30 days",       trend:"flat", delta:"±8% variance",      icon:Wrench,   iconBg:"bg-slate-100 dark:bg-slate-500/15",   iconColor:"text-slate-500 dark:text-slate-400",  accent:"text-slate-600 dark:text-slate-400"  },
// ];

// const ALERTS: AlertRow[] = [
//   { id:"AL-1042", severity:"critical", asset:"Forklift FL-22",   location:"Warehouse A", msg:"Vibration RMS 12.3 mm/s — failure probability 91%.",    ago:"8m"  },
//   { id:"AL-1041", severity:"critical", asset:"Compressor CP-07", location:"Warehouse B", msg:"Thermal anomaly — 42°C above baseline.",                 ago:"23m" },
//   { id:"AL-1040", severity:"warning",  asset:"Conveyor C-09",    location:"Warehouse B", msg:"Belt tension dropping — failure predicted in ~14 days.", ago:"1h"  },
//   { id:"AL-1039", severity:"warning",  asset:"Pump P-04",        location:"Warehouse C", msg:"Pressure variance increasing over past 6 hours.",        ago:"2h"  },
//   { id:"AL-1038", severity:"info",     asset:"Generator G-11",   location:"Warehouse C", msg:"Maintenance window opens in 3 days.",                    ago:"4h"  },
// ];

// const TICKETS: TicketRow[] = [
//   { id:"TK-2201", title:"Hydraulic seal replacement", asset:"Forklift FL-22",   priority:"critical", status:"in_progress", person:"Sahan S."   },
//   { id:"TK-2200", title:"Cooling system overhaul",    asset:"Compressor CP-07", priority:"high",     status:"open",        person:"Nimal P."   },
//   { id:"TK-2199", title:"Belt tension adjustment",    asset:"Conveyor C-09",    priority:"high",     status:"open",        person:"—"          },
//   { id:"TK-2197", title:"Quarterly inspection",       asset:"Generator G-11",   priority:"medium",   status:"open",        person:"Kavindu P." },
//   { id:"TK-2195", title:"Lubrication service",        asset:"Palletizer P-03",  priority:"low",      status:"resolved",    person:"Dinithi J." },
// ];

// const RISKS: RiskRow[] = [
//   { id:"R1", name:"Forklift FL-22",   loc:"WH-A", score:91, prob:0.91, days:3  },
//   { id:"R2", name:"Compressor CP-07", loc:"WH-B", score:84, prob:0.84, days:5  },
//   { id:"R3", name:"Conveyor C-09",    loc:"WH-B", score:72, prob:0.62, days:14 },
//   { id:"R4", name:"Palletizer P-03",  loc:"WH-A", score:68, prob:0.58, days:18 },
//   { id:"R5", name:"Pump P-04",        loc:"WH-C", score:55, prob:0.48, days:22 },
// ];

// const healthSeries = [
//   {m:"Nov",v:82},{m:"Dec",v:79},{m:"Jan",v:81},
//   {m:"Feb",v:78},{m:"Mar",v:76},{m:"Apr",v:74},{m:"May",v:76},
// ];

// const ticketSeries = [
//   {w:"W18",open:29,done:24,prog:11},{w:"W19",open:34,done:31,prog:14},
//   {w:"W20",open:28,done:29,prog:9},{w:"W21",open:41,done:36,prog:17},{w:"W22",open:37,done:28,prog:13},
// ];

// const distData = [
//   {name:"Excellent",n:98, c:"#10b981"},
//   {name:"Good",     n:112,c:"#6366f1"},
//   {name:"Moderate", n:49, c:"#f59e0b"},
//   {name:"Poor",     n:18, c:"#f97316"},
//   {name:"Critical", n:7,  c:"#ef4444"},
// ];

// const costData = [
//   {m:"Feb",est:1.80,act:1.65},{m:"Mar",est:2.10,act:2.28},
//   {m:"Apr",est:1.95,act:1.87},{m:"May",est:2.40,act:null},
// ];

// const downtimeData = [
//   {name:"WH-A",planned:12,unplanned:8},{name:"WH-B",planned:9,unplanned:14},
//   {name:"WH-C",planned:6,unplanned:3},
// ];

// const INSIGHTS = [
//   { icon:AlertTriangle, color:"text-rose-500", bg:"bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20", title:"Imminent failure cluster", body:"FL-22 and CP-07 share a vibration-thermal failure pattern. Historical data shows 87% of similar dual-anomaly cases fail within 10 days. Schedule both simultaneously to cut downtime by an estimated 6 hours." },
//   { icon:ThumbsUp,      color:"text-emerald-500", bg:"bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20", title:"WH-C performing well", body:"Warehouse C maintains 84% health with only 1 active alert. Preventive schedule is on track. Model confidence: 92%. No action required this week." },
//   { icon:BarChart2,     color:"text-violet-500", bg:"bg-violet-50 dark:bg-violet-500/10 border-violet-100 dark:border-violet-500/20", title:"Cost overrun risk in March", body:"Unplanned downtime in WH-B drove a 8.6% cost overrun last month. If Conveyor C-09 belt fails without intervention, May forecast increases by LKR 340K." },
//   { icon:Timer,         color:"text-amber-500", bg:"bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20", title:"Ticket resolution slowing", body:"Average resolution time increased from 2.1d to 3.4d over 4 weeks. 6 tickets unassigned. Recommend redistributing WH-B workload to reduce backlog by est. 40%." },
// ];

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// function TrendChip({ trend, delta }: { trend: Trend; delta: string }) {
//   if (trend === "up")
//     return <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-rose-500"><TrendingUp className="h-3 w-3"/>{delta}</span>;
//   if (trend === "down")
//     return <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-500"><TrendingDown className="h-3 w-3"/>{delta}</span>;
//   return <span className="text-[10px] text-muted-foreground">{delta}</span>;
// }

// const SEV_DOT:   Record<AlertRow["severity"], string> = { critical:"bg-rose-500 animate-pulse", warning:"bg-amber-400", info:"bg-sky-400" };
// const SEV_LABEL: Record<AlertRow["severity"], string> = { critical:"text-rose-600 dark:text-rose-400", warning:"text-amber-600 dark:text-amber-400", info:"text-sky-600 dark:text-sky-400" };
// const SEV_ROW:   Record<AlertRow["severity"], string> = { critical:"hover:bg-rose-50/60 dark:hover:bg-rose-500/5", warning:"hover:bg-amber-50/60 dark:hover:bg-amber-500/5", info:"hover:bg-sky-50/40 dark:hover:bg-sky-500/5" };

// const PRI: Record<TicketRow["priority"], string> = {
//   critical:"bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/20",
//   high:"bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-500/20",
//   medium:"bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20",
//   low:"bg-slate-50 text-slate-500 ring-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:ring-slate-500/20",
// };
// const STA: Record<TicketRow["status"], string> = {
//   in_progress:"bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/20",
//   resolved:"bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20",
//   open:"bg-slate-50 text-slate-500 ring-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:ring-slate-500/20",
// };

// function Chip({ label, cls }: { label: string; cls: string }) {
//   return <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset", cls)}>{label}</span>;
// }

// function PieTip({ active, payload }: { active?: boolean; payload?: Array<{payload:{name:string;n:number}}> }) {
//   if (!active || !payload?.length) return null;
//   const d = payload[0].payload;
//   return <div className="rounded-lg border border-border bg-popover px-3 py-1.5 text-xs shadow-md"><p className="font-semibold">{d.name}</p><p className="text-muted-foreground">{d.n} assets</p></div>;
// }

// function CTip({ active, payload, label, fmt }: { active?: boolean; payload?: Array<{name:string;value:number;color:string}>; label?: string; fmt?: (v:number)=>string }) {
//   if (!active || !payload?.length) return null;
//   return (
//     <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md space-y-1 min-w-[110px]">
//       <p className="font-semibold text-foreground">{label}</p>
//       {payload.map((p) => (
//         <div key={p.name} className="flex items-center gap-2 text-muted-foreground">
//           <span className="h-1.5 w-1.5 rounded-full" style={{background:p.color}}/>
//           <span className="flex-1">{p.name}</span>
//           <span className="font-semibold text-foreground">{fmt ? fmt(p.value) : p.value}</span>
//         </div>
//       ))}
//     </div>
//   );
// }

// function ScoreBar({ score }: { score: number }) {
//   const c = score >= 80 ? "#ef4444" : score >= 60 ? "#f59e0b" : "#10b981";
//   const tc = score >= 80 ? "text-rose-600 dark:text-rose-400" : score >= 60 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400";
//   return (
//     <div className="flex items-center gap-2 shrink-0">
//       <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
//         <div className="h-full rounded-full transition-all" style={{width:`${score}%`,background:c}}/>
//       </div>
//       <span className={cn("text-xs font-semibold tabular-nums w-7",tc)}>{score}</span>
//     </div>
//   );
// }

// function Card({ children, className }: { children: React.ReactNode; className?: string }) {
//   return <div className={cn("rounded-xl border border-border bg-card shadow-xs", className)}>{children}</div>;
// }

// function SectionTitle({ children }: { children: React.ReactNode }) {
//   return <p className="text-[13px] font-semibold text-foreground">{children}</p>;
// }
// function SectionSub({ children }: { children: React.ReactNode }) {
//   return <p className="text-[11px] text-muted-foreground mt-0.5">{children}</p>;
// }

// // ─── Page ─────────────────────────────────────────────────────────────────────

// export default function AdminDashboardPage() {
//   const [refreshing, setRefreshing] = React.useState(false);
//   const [now, setNow] = React.useState(new Date());
//   const [tab, setTab] = React.useState<"health"|"tickets"|"cost">("health");

//   function refresh() {
//     setRefreshing(true);
//     setTimeout(() => { setNow(new Date()); setRefreshing(false); }, 900);
//   }

//   const time = now.toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });
//   const date = now.toLocaleDateString([], { weekday:"short", month:"short", day:"numeric" });

//   return (
//     <div className="relative space-y-5 pb-20">

//       {/* ══ Hero header with particle bg ════════════════════════════════════ */}
//       <div className="relative overflow-hidden rounded-2xl border border-violet-200/60 dark:border-violet-500/20">
//         {/* Particle canvas */}
//         <ParticleCanvas />

//         {/* Gradient layer */}
//         <div className="absolute inset-0 bg-linear-to-br from-violet-50/90 via-white/70 to-sky-50/80 dark:from-violet-950/70 dark:via-slate-950/60 dark:to-sky-950/50 pointer-events-none" />

//         {/* Content */}
//         <div className="relative px-7 py-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
//           <div>
//             {/* Breadcrumb */}
//             <div className="flex items-center gap-2 mb-3">
//               <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-violet-500 dark:text-violet-400">PredictiX</span>
//               <span className="text-muted-foreground/30 text-xs font-light">/</span>
//               <span className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground/60">Admin</span>
//               <span className="text-muted-foreground/30 text-xs font-light">/</span>
//               <span className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground/80">Dashboard</span>
//             </div>

//             {/* Title */}
//             <h1 className="text-[26px] font-semibold tracking-[-0.025em] leading-none text-foreground">
//               Operations Dashboard
//             </h1>

//             {/* Subtitle + live badge */}
//             <div className="flex items-center gap-2.5 mt-2.5">
//               <p className="text-[12px] text-muted-foreground leading-tight max-w-sm">
//                 Real-time asset health, AI failure predictions and maintenance operations.
//               </p>
//               <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/25 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 shrink-0">
//                 <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"/>
//                 Live
//               </span>
//             </div>
//           </div>

//           {/* Right controls */}
//           <div className="flex flex-col items-end gap-2.5 shrink-0">
//             <div className="flex items-center gap-2">
//               <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground bg-background/60 dark:bg-white/5 border border-border backdrop-blur-sm rounded-lg px-3 py-1.5">
//                 <Clock className="h-3 w-3"/>
//                 <span>{date} · <span className="font-semibold text-foreground">{time}</span></span>
//               </div>
//               <button
//                 onClick={refresh}
//                 className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background/70 dark:bg-white/5 backdrop-blur-sm px-3 py-1.5 text-[11px] font-medium text-foreground hover:bg-background transition-colors"
//               >
//                 <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")}/>
//                 Refresh
//               </button>
//             </div>
//             {/* Quick stat pills */}
//             <div className="flex items-center gap-2">
//               <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100/80 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/25 px-2.5 py-1 text-[10px] font-semibold text-rose-700 dark:text-rose-300">
//                 <Flame className="h-3 w-3"/> 12 critical alerts
//               </span>
//               <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100/80 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25 px-2.5 py-1 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
//                 <Ticket className="h-3 w-3"/> 37 open tickets
//               </span>
//               <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100/80 dark:bg-sky-500/15 border border-sky-200 dark:border-sky-500/25 px-2.5 py-1 text-[10px] font-semibold text-sky-700 dark:text-sky-300">
//                 <Brain className="h-3 w-3"/> 18 predicted failures
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ══ KPIs ════════════════════════════════════════════════════════════ */}
//       <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
//         {KPI.map((k) => (
//           <Card key={k.label} className="p-4 hover:shadow-sm transition-shadow cursor-default">
//             <div className="flex items-center justify-between mb-3">
//               <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", k.iconBg)}>
//                 <k.icon className={cn("h-4 w-4", k.iconColor)}/>
//               </div>
//               <TrendChip trend={k.trend} delta={k.delta}/>
//             </div>
//             <p className={cn("text-[22px] font-semibold tracking-tight leading-none", k.accent)}>{k.value}</p>
//             <p className="mt-1.5 text-[12px] font-medium text-foreground">{k.label}</p>
//             <p className="mt-0.5 text-[10px] text-muted-foreground">{k.sub}</p>
//           </Card>
//         ))}
//       </div>

//       {/* ══ AI Insights strip ════════════════════════════════════════════════ */}
//       <div>
//         <div className="flex items-center gap-2 mb-3">
//           <Bot className="h-4 w-4 text-violet-500"/>
//           <span className="text-[12px] font-semibold text-foreground">AI Insights</span>
//           <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 dark:bg-violet-500/15 border border-violet-200 dark:border-violet-500/25 px-2 py-0.5 text-[9px] font-bold text-violet-700 dark:text-violet-300 uppercase tracking-wide">
//             <Zap className="h-2.5 w-2.5"/> XGBoost · BERT
//           </span>
//         </div>
//         <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
//           {INSIGHTS.map((ins) => (
//             <div key={ins.title} className={cn("rounded-xl border p-4", ins.bg)}>
//               <div className="flex items-start gap-2.5">
//                 <div className="mt-0.5 shrink-0">
//                   <ins.icon className={cn("h-4 w-4", ins.color)}/>
//                 </div>
//                 <div>
//                   <p className="text-[12px] font-semibold text-foreground leading-tight">{ins.title}</p>
//                   <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">{ins.body}</p>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* ══ Charts row ══════════════════════════════════════════════════════ */}
//       <div className="grid gap-4 lg:grid-cols-5">

//         {/* Tabbed main chart */}
//         <Card className="lg:col-span-3 overflow-hidden">
//           <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border">
//             <div>
//               <SectionTitle>Asset & Operations Trends</SectionTitle>
//               <SectionSub>7-month historical view</SectionSub>
//             </div>
//             <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-0.5">
//               {(["health","tickets","cost"] as const).map((t) => (
//                 <button
//                   key={t}
//                   onClick={() => setTab(t)}
//                   className={cn(
//                     "rounded-md px-2.5 py-1 text-[11px] font-medium transition-all capitalize",
//                     tab === t ? "bg-background text-foreground shadow-xs border border-border" : "text-muted-foreground hover:text-foreground"
//                   )}
//                 >{t === "cost" ? "Maint. cost" : t === "health" ? "Health" : "Tickets"}</button>
//               ))}
//             </div>
//           </div>

//           <div className="px-5 pt-4 pb-2">
//             {tab === "health" && (
//               <div style={{height:210,minHeight:210}}>
//                 <ResponsiveContainer width="100%" height="100%" debounce={200}>
//                   <AreaChart data={healthSeries} margin={{top:4,right:4,left:-24,bottom:0}}>
//                     <defs>
//                       <linearGradient id="hG" x1="0" y1="0" x2="0" y2="1">
//                         <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.18}/>
//                         <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
//                       </linearGradient>
//                     </defs>
//                     <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border))" opacity={0.5}/>
//                     <XAxis dataKey="m" tick={{fontSize:11,fill:"hsl(var(--muted-foreground))"}} axisLine={false} tickLine={false}/>
//                     <YAxis domain={[60,100]} tick={{fontSize:11,fill:"hsl(var(--muted-foreground))"}} axisLine={false} tickLine={false}/>
//                     <Tooltip content={<CTip fmt={v=>`${v}%`}/>}/>
//                     <Area type="monotone" dataKey="v" name="Health score" stroke="#6366f1" strokeWidth={2} fill="url(#hG)"
//                       dot={{fill:"#6366f1",r:3,strokeWidth:0}} activeDot={{r:5,fill:"#6366f1",strokeWidth:2,stroke:"#fff"}}/>
//                   </AreaChart>
//                 </ResponsiveContainer>
//               </div>
//             )}
//             {tab === "tickets" && (
//               <div style={{height:210,minHeight:210}}>
//                 <ResponsiveContainer width="100%" height="100%" debounce={200}>
//                   <BarChart data={ticketSeries} margin={{top:4,right:4,left:-24,bottom:0}} barGap={3}>
//                     <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border))" opacity={0.5}/>
//                     <XAxis dataKey="w" tick={{fontSize:11,fill:"hsl(var(--muted-foreground))"}} axisLine={false} tickLine={false}/>
//                     <YAxis tick={{fontSize:11,fill:"hsl(var(--muted-foreground))"}} axisLine={false} tickLine={false}/>
//                     <Tooltip content={<CTip/>}/>
//                     <Legend wrapperStyle={{fontSize:11}}/>
//                     <Bar dataKey="open" name="Opened"      fill="#f59e0b" radius={[3,3,0,0]}/>
//                     <Bar dataKey="prog" name="In progress" fill="#8b5cf6" radius={[3,3,0,0]}/>
//                     <Bar dataKey="done" name="Resolved"    fill="#10b981" radius={[3,3,0,0]}/>
//                   </BarChart>
//                 </ResponsiveContainer>
//               </div>
//             )}
//             {tab === "cost" && (
//               <div style={{height:210,minHeight:210}}>
//                 <ResponsiveContainer width="100%" height="100%" debounce={200}>
//                   <BarChart data={costData} margin={{top:4,right:4,left:-20,bottom:0}} barGap={4}>
//                     <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border))" opacity={0.5}/>
//                     <XAxis dataKey="m" tick={{fontSize:11,fill:"hsl(var(--muted-foreground))"}} axisLine={false} tickLine={false}/>
//                     <YAxis tick={{fontSize:11,fill:"hsl(var(--muted-foreground))"}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}M`}/>
//                     <Tooltip content={<CTip fmt={v=>`LKR ${v}M`}/>}/>
//                     <Legend wrapperStyle={{fontSize:11}}/>
//                     <Bar dataKey="est" name="Estimated" fill="#8b5cf6" radius={[3,3,0,0]}/>
//                     <Bar dataKey="act" name="Actual"    fill="#06b6d4" radius={[3,3,0,0]}/>
//                   </BarChart>
//                 </ResponsiveContainer>
//               </div>
//             )}
//           </div>

//           {/* Stat summary footer */}
//           <div className="border-t border-border grid grid-cols-3 divide-x divide-border">
//             {[
//               {label:"Avg health score", val:"76%",   color:"text-amber-600 dark:text-amber-400"},
//               {label:"Tickets resolved", val:"148",   color:"text-emerald-600 dark:text-emerald-400"},
//               {label:"Avg resolution",   val:"3.4d",  color:"text-sky-600 dark:text-sky-400"},
//             ].map((s) => (
//               <div key={s.label} className="px-4 py-3">
//                 <p className={cn("text-[17px] font-semibold", s.color)}>{s.val}</p>
//                 <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
//               </div>
//             ))}
//           </div>
//         </Card>

//         {/* Right column */}
//         <div className="lg:col-span-2 flex flex-col gap-4">

//           {/* Donut */}
//           <Card className="p-4 flex-1">
//             <SectionTitle>Health Distribution</SectionTitle>
//             <SectionSub>284 assets by condition band</SectionSub>
//             <div className="flex items-center gap-4 mt-3">
//               <div style={{height:110,minHeight:110,width:110,flexShrink:0}}>
//                 <ResponsiveContainer width="100%" height="100%" debounce={200}>
//                   <PieChart>
//                     <Pie data={distData} dataKey="n" innerRadius={34} outerRadius={52}
//                       paddingAngle={2} startAngle={90} endAngle={-270}>
//                       {distData.map((d,i) => <Cell key={i} fill={d.c} strokeWidth={0}/>)}
//                     </Pie>
//                     <Tooltip content={<PieTip/>}/>
//                   </PieChart>
//                 </ResponsiveContainer>
//               </div>
//               <div className="flex-1 space-y-1.5">
//                 {distData.map((d) => (
//                   <div key={d.name} className="flex items-center gap-2">
//                     <span className="h-2 w-2 rounded-full shrink-0" style={{background:d.c}}/>
//                     <span className="text-[11px] text-muted-foreground flex-1">{d.name}</span>
//                     <div className="w-12 h-1 rounded-full bg-muted overflow-hidden">
//                       <div className="h-full rounded-full" style={{width:`${(d.n/284)*100}%`,background:d.c}}/>
//                     </div>
//                     <span className="text-[11px] font-semibold tabular-nums w-6 text-right">{d.n}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </Card>

//           {/* Downtime by warehouse */}
//           <Card className="p-4">
//             <SectionTitle>Downtime by Warehouse</SectionTitle>
//             <SectionSub>Planned vs unplanned hours — this month</SectionSub>
//             <div className="mt-3" style={{height:110,minHeight:110}}>
//               <ResponsiveContainer width="100%" height="100%" debounce={200}>
//                 <BarChart data={downtimeData} layout="vertical" margin={{top:0,right:4,left:36,bottom:0}} barGap={3}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} horizontal={false}/>
//                   <XAxis type="number" tick={{fontSize:10,fill:"hsl(var(--muted-foreground))"}} axisLine={false} tickLine={false}/>
//                   <YAxis type="category" dataKey="name" tick={{fontSize:11,fill:"hsl(var(--muted-foreground))"}} axisLine={false} tickLine={false} width={34}/>
//                   <Tooltip content={<CTip/>}/>
//                   <Legend wrapperStyle={{fontSize:10}}/>
//                   <Bar dataKey="planned"    name="Planned"    fill="#6366f1" radius={[0,3,3,0]}/>
//                   <Bar dataKey="unplanned"  name="Unplanned"  fill="#ef4444" radius={[0,3,3,0]}/>
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>
//           </Card>
//         </div>
//       </div>

//       {/* ══ Risk + Alerts ════════════════════════════════════════════════════ */}
//       <div className="grid gap-4 lg:grid-cols-2">

//         <Card>
//           <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
//             <div><SectionTitle>Top Risk Assets</SectionTitle><SectionSub>Ranked by AI predicted failure probability</SectionSub></div>
//             <button className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground font-medium">View all<ChevronRight className="h-3.5 w-3.5"/></button>
//           </div>
//           <div>
//             {RISKS.map((a,i) => (
//               <div key={a.id} className={cn("flex items-center gap-3 px-5 py-3 border-b border-border last:border-0 transition-colors hover:bg-muted/20 cursor-pointer")}>
//                 <div className={cn(
//                   "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold",
//                   i===0?"bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400":
//                   i===1?"bg-rose-50 text-rose-400 dark:bg-rose-500/10 dark:text-rose-500":
//                   "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
//                 )}>{i+1}</div>
//                 <div className="flex-1 min-w-0">
//                   <div className="flex items-center gap-1.5">
//                     <p className="text-[12px] font-semibold truncate">{a.name}</p>
//                     {i<2 && <ShieldAlert className="h-3 w-3 text-rose-500 shrink-0"/>}
//                   </div>
//                   <p className="text-[10px] text-muted-foreground mt-0.5">{a.loc} · {a.days}d to maintenance · {Math.round(a.prob*100)}% fail prob.</p>
//                 </div>
//                 <ScoreBar score={a.score}/>
//               </div>
//             ))}
//           </div>
//         </Card>

//         <Card>
//           <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
//             <div><SectionTitle>Recent Alerts</SectionTitle><SectionSub>Asset monitoring — latest events</SectionSub></div>
//             <button className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground font-medium">View all<ChevronRight className="h-3.5 w-3.5"/></button>
//           </div>
//           <div>
//             {ALERTS.map((a) => (
//               <div key={a.id} className={cn("flex items-start gap-3 px-5 py-3 border-b border-border last:border-0 transition-colors cursor-default", SEV_ROW[a.severity])}>
//                 <span className={cn("h-2 w-2 rounded-full shrink-0 mt-1.5", SEV_DOT[a.severity])}/>
//                 <div className="flex-1 min-w-0">
//                   <div className="flex items-center gap-2 mb-0.5">
//                     <span className={cn("text-[10px] font-bold uppercase tracking-wide", SEV_LABEL[a.severity])}>{a.severity}</span>
//                     <span className="text-[10px] text-muted-foreground">{a.id}</span>
//                     <span className="ml-auto text-[10px] text-muted-foreground shrink-0">{a.ago} ago</span>
//                   </div>
//                   <p className="text-[12px] font-semibold text-foreground">{a.asset}</p>
//                   <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{a.msg}</p>
//                   <p className="text-[10px] text-muted-foreground/60 mt-1">{a.location}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </Card>
//       </div>

//       {/* ══ Tickets table ════════════════════════════════════════════════════ */}
//       <Card>
//         <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
//           <div><SectionTitle>Maintenance Tickets</SectionTitle><SectionSub>Latest open and in-progress work orders</SectionSub></div>
//           <button className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-[11px] font-medium hover:bg-muted transition-colors">
//             <ArrowUpRight className="h-3.5 w-3.5"/> Manage
//           </button>
//         </div>
//         <div className="grid grid-cols-[1fr_auto_auto_auto_auto] bg-muted/40 border-b border-border">
//           {["Ticket","Asset","Priority","Status","Assigned"].map((h) => (
//             <div key={h} className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{h}</div>
//           ))}
//         </div>
//         {TICKETS.map((t) => (
//           <div key={t.id} className="grid grid-cols-[1fr_auto_auto_auto_auto] border-b border-border last:border-0 hover:bg-muted/20 transition-colors cursor-pointer">
//             <div className="px-4 py-3">
//               <p className="text-[12px] font-semibold">{t.title}</p>
//               <p className="text-[10px] text-muted-foreground mt-0.5">{t.id}</p>
//             </div>
//             <div className="px-4 py-3 flex items-center"><span className="text-[11px] text-muted-foreground">{t.asset}</span></div>
//             <div className="px-4 py-3 flex items-center"><Chip label={t.priority} cls={PRI[t.priority]}/></div>
//             <div className="px-4 py-3 flex items-center">
//               <Chip
//                 label={t.status==="in_progress"?"In progress":t.status==="resolved"?"Resolved":"Open"}
//                 cls={STA[t.status]}
//               />
//             </div>
//             <div className="px-4 py-3 flex items-center"><span className="text-[11px] text-muted-foreground">{t.person}</span></div>
//           </div>
//         ))}
//       </Card>

//       {/* ══ AI summary banner ════════════════════════════════════════════════ */}
//       <div className="rounded-xl border border-violet-200 dark:border-violet-500/20 bg-linear-to-br from-violet-50 to-indigo-50/60 dark:from-violet-950/40 dark:to-indigo-950/30 p-5">
//         <div className="flex items-start gap-4">
//           <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-200 dark:border-violet-500/30 bg-violet-100 dark:bg-violet-500/15">
//             <Bot className="h-5 w-5 text-violet-600 dark:text-violet-400"/>
//           </div>
//           <div className="flex-1 min-w-0">
//             <div className="flex items-center gap-2 flex-wrap mb-2">
//               <p className="text-[13px] font-semibold">AI Operational Summary</p>
//               <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset bg-violet-100 text-violet-700 ring-violet-200 dark:bg-violet-500/15 dark:text-violet-300 dark:ring-violet-500/25">
//                 <Zap className="h-2.5 w-2.5"/> XGBoost · BERT · RAG
//               </span>
//               <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/25">
//                 <CheckCircle2 className="h-2.5 w-2.5"/> High confidence
//               </span>
//             </div>
//             <p className="text-[12px] text-muted-foreground leading-relaxed">
//               Fleet health declined <strong className="text-foreground">−4.2%</strong> over 30 days.
//               Elevated vibration in WH-A and thermal anomalies in WH-B are primary drivers.
//               Model predicts <strong className="text-rose-600 dark:text-rose-400">3 critical failures</strong> within 14 days — FL-22, CP-07, C-09.
//               Immediate intervention reduces 8-week failures from 18 → 9 and saves{" "}
//               <strong className="text-emerald-600 dark:text-emerald-400">LKR 820,000</strong> in unplanned downtime.
//               WH-B unplanned downtime (14h this month) is the largest cost driver — a belt replacement on C-09 this week
//               prevents the highest-ROI intervention available.
//             </p>
//           </div>
//           <button className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-violet-200 dark:border-violet-500/30 bg-white/70 dark:bg-violet-500/10 hover:bg-violet-50 dark:hover:bg-violet-500/20 px-3 py-1.5 text-[11px] font-semibold text-violet-700 dark:text-violet-300 transition-colors">
//             Full report <ExternalLink className="h-3.5 w-3.5"/>
//           </button>
//         </div>
//       </div>

//     </div>
//   );
// }

"use client";

import * as React from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  Activity, AlertTriangle, ArrowUpRight, Bot, Brain,
  ChevronRight, Clock, ExternalLink, Flame, Package,
  RefreshCw, ShieldAlert, Ticket, TrendingDown, TrendingUp,
  Warehouse, Wrench, Zap, CheckCircle2, Timer, BarChart2,
  ThumbsUp, CircleDot,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Floating Particle Background ─────────────────────────────────────────────

// Full-page particle background (fixed, behind everything)
function PageParticles() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    const particles: {
      x: number; y: number; r: number;
      vx: number; vy: number; alpha: number; va: number;
    }[] = [];

    function resize() {
      if (!canvas) return;
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    const COUNT = 80;
    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x:  Math.random() * window.innerWidth,
        y:  Math.random() * window.innerHeight,
        r:  Math.random() * 1.6 + 0.3,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        alpha: Math.random() * 0.45 + 0.08,
        va: (Math.random() - 0.5) * 0.002,
      });
    }

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha = Math.max(0.05, Math.min(0.5, p.alpha + p.va));
        if (p.alpha <= 0.05 || p.alpha >= 0.5) p.va *= -1;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = isDark
          ? `rgba(167,139,250,${p.alpha})`
          : `rgba(109,40,217,${p.alpha * 0.35})`;
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < 90) {
            const a = isDark
              ? (1 - d / 90) * 0.1
              : (1 - d / 90) * 0.04;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = isDark
              ? `rgba(167,139,250,${a})`
              : `rgba(109,40,217,${a})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 w-full h-full z-0"
      style={{ opacity: 1 }}
      aria-hidden="true"
    />
  );
}

// Header-only particle canvas (kept for header section)
function ParticleCanvas() {
  return null; // replaced by PageParticles
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Trend = "up" | "down" | "flat";

interface KpiDef {
  label: string; value: string; sub: string;
  trend: Trend; delta: string;
  icon: React.ElementType;
  iconBg: string; iconColor: string; accent: string;
}

interface AlertRow {
  id: string; severity: "critical" | "warning" | "info";
  asset: string; location: string; msg: string; ago: string;
}

interface TicketRow {
  id: string; title: string; asset: string;
  priority: "critical" | "high" | "medium" | "low";
  status: "open" | "in_progress" | "resolved";
  person: string;
}

interface RiskRow {
  id: string; name: string; loc: string;
  score: number; prob: number; days: number;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const KPI: KpiDef[] = [
  { label:"Total Assets",       value:"284",  sub:"3 warehouses",        trend:"up",   delta:"+4 this month",     icon:Package,  iconBg:"bg-violet-100 dark:bg-violet-500/15", iconColor:"text-violet-600 dark:text-violet-400", accent:"text-violet-600 dark:text-violet-400" },
  { label:"Critical Alerts",    value:"12",   sub:"Require action now",  trend:"up",   delta:"+3 yesterday",      icon:Flame,    iconBg:"bg-rose-100 dark:bg-rose-500/15",     iconColor:"text-rose-600 dark:text-rose-400",    accent:"text-rose-600 dark:text-rose-400"    },
  { label:"Open Tickets",       value:"37",   sub:"9 high priority",     trend:"down", delta:"−5 this week",      icon:Ticket,   iconBg:"bg-amber-100 dark:bg-amber-500/15",   iconColor:"text-amber-600 dark:text-amber-400",  accent:"text-amber-600 dark:text-amber-400"  },
  { label:"Fleet Health",       value:"76%",  sub:"Fleet-wide average",  trend:"down", delta:"−2.1% this week",   icon:Activity, iconBg:"bg-emerald-100 dark:bg-emerald-500/15",iconColor:"text-emerald-600 dark:text-emerald-400",accent:"text-emerald-600 dark:text-emerald-400"},
  { label:"Predicted Failures", value:"18",   sub:"Next 8 weeks",        trend:"up",   delta:"+2 new",            icon:Brain,    iconBg:"bg-sky-100 dark:bg-sky-500/15",       iconColor:"text-sky-600 dark:text-sky-400",      accent:"text-sky-600 dark:text-sky-400"      },
  { label:"Est. Maint. Cost",   value:"2.4M", sub:"LKR · 30 days",       trend:"flat", delta:"±8% variance",      icon:Wrench,   iconBg:"bg-slate-100 dark:bg-slate-500/15",   iconColor:"text-slate-500 dark:text-slate-400",  accent:"text-slate-600 dark:text-slate-400"  },
];

const ALERTS: AlertRow[] = [
  { id:"AL-1042", severity:"critical", asset:"Forklift FL-22",   location:"Warehouse A", msg:"Vibration RMS 12.3 mm/s — failure probability 91%.",    ago:"8m"  },
  { id:"AL-1041", severity:"critical", asset:"Compressor CP-07", location:"Warehouse B", msg:"Thermal anomaly — 42°C above baseline.",                 ago:"23m" },
  { id:"AL-1040", severity:"warning",  asset:"Conveyor C-09",    location:"Warehouse B", msg:"Belt tension dropping — failure predicted in ~14 days.", ago:"1h"  },
  { id:"AL-1039", severity:"warning",  asset:"Pump P-04",        location:"Warehouse C", msg:"Pressure variance increasing over past 6 hours.",        ago:"2h"  },
  { id:"AL-1038", severity:"info",     asset:"Generator G-11",   location:"Warehouse C", msg:"Maintenance window opens in 3 days.",                    ago:"4h"  },
];

const TICKETS: TicketRow[] = [
  { id:"TK-2201", title:"Hydraulic seal replacement", asset:"Forklift FL-22",   priority:"critical", status:"in_progress", person:"Sahan S."   },
  { id:"TK-2200", title:"Cooling system overhaul",    asset:"Compressor CP-07", priority:"high",     status:"open",        person:"Nimal P."   },
  { id:"TK-2199", title:"Belt tension adjustment",    asset:"Conveyor C-09",    priority:"high",     status:"open",        person:"—"          },
  { id:"TK-2197", title:"Quarterly inspection",       asset:"Generator G-11",   priority:"medium",   status:"open",        person:"Kavindu P." },
  { id:"TK-2195", title:"Lubrication service",        asset:"Palletizer P-03",  priority:"low",      status:"resolved",    person:"Dinithi J." },
];

const RISKS: RiskRow[] = [
  { id:"R1", name:"Forklift FL-22",   loc:"WH-A", score:91, prob:0.91, days:3  },
  { id:"R2", name:"Compressor CP-07", loc:"WH-B", score:84, prob:0.84, days:5  },
  { id:"R3", name:"Conveyor C-09",    loc:"WH-B", score:72, prob:0.62, days:14 },
  { id:"R4", name:"Palletizer P-03",  loc:"WH-A", score:68, prob:0.58, days:18 },
  { id:"R5", name:"Pump P-04",        loc:"WH-C", score:55, prob:0.48, days:22 },
];

const healthSeries = [
  {m:"Nov",v:82},{m:"Dec",v:79},{m:"Jan",v:81},
  {m:"Feb",v:78},{m:"Mar",v:76},{m:"Apr",v:74},{m:"May",v:76},
];

const ticketSeries = [
  {w:"W18",open:29,done:24,prog:11},{w:"W19",open:34,done:31,prog:14},
  {w:"W20",open:28,done:29,prog:9},{w:"W21",open:41,done:36,prog:17},{w:"W22",open:37,done:28,prog:13},
];

const distData = [
  {name:"Excellent",n:98, c:"#10b981"},
  {name:"Good",     n:112,c:"#6366f1"},
  {name:"Moderate", n:49, c:"#f59e0b"},
  {name:"Poor",     n:18, c:"#f97316"},
  {name:"Critical", n:7,  c:"#ef4444"},
];

const costData = [
  {m:"Feb",est:1.80,act:1.65},{m:"Mar",est:2.10,act:2.28},
  {m:"Apr",est:1.95,act:1.87},{m:"May",est:2.40,act:null},
];

const downtimeData = [
  {name:"WH-A",planned:12,unplanned:8},{name:"WH-B",planned:9,unplanned:14},
  {name:"WH-C",planned:6,unplanned:3},
];

const INSIGHTS = [
  { icon:AlertTriangle, color:"text-rose-500", bg:"bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20", title:"Imminent failure cluster", body:"FL-22 and CP-07 share a vibration-thermal failure pattern. Historical data shows 87% of similar dual-anomaly cases fail within 10 days. Schedule both simultaneously to cut downtime by an estimated 6 hours." },
  { icon:ThumbsUp,      color:"text-emerald-500", bg:"bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20", title:"WH-C performing well", body:"Warehouse C maintains 84% health with only 1 active alert. Preventive schedule is on track. Model confidence: 92%. No action required this week." },
  { icon:BarChart2,     color:"text-violet-500", bg:"bg-violet-50 dark:bg-violet-500/10 border-violet-100 dark:border-violet-500/20", title:"Cost overrun risk in March", body:"Unplanned downtime in WH-B drove a 8.6% cost overrun last month. If Conveyor C-09 belt fails without intervention, May forecast increases by LKR 340K." },
  { icon:Timer,         color:"text-amber-500", bg:"bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20", title:"Ticket resolution slowing", body:"Average resolution time increased from 2.1d to 3.4d over 4 weeks. 6 tickets unassigned. Recommend redistributing WH-B workload to reduce backlog by est. 40%." },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function TrendChip({ trend, delta }: { trend: Trend; delta: string }) {
  if (trend === "up")
    return <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-rose-500"><TrendingUp className="h-3 w-3"/>{delta}</span>;
  if (trend === "down")
    return <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-500"><TrendingDown className="h-3 w-3"/>{delta}</span>;
  return <span className="text-[10px] text-muted-foreground">{delta}</span>;
}

const SEV_DOT:   Record<AlertRow["severity"], string> = { critical:"bg-rose-500 animate-pulse", warning:"bg-amber-400", info:"bg-sky-400" };
const SEV_LABEL: Record<AlertRow["severity"], string> = { critical:"text-rose-600 dark:text-rose-400", warning:"text-amber-600 dark:text-amber-400", info:"text-sky-600 dark:text-sky-400" };
const SEV_ROW:   Record<AlertRow["severity"], string> = { critical:"hover:bg-rose-50/60 dark:hover:bg-rose-500/5", warning:"hover:bg-amber-50/60 dark:hover:bg-amber-500/5", info:"hover:bg-sky-50/40 dark:hover:bg-sky-500/5" };

const PRI: Record<TicketRow["priority"], string> = {
  critical:"bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/20",
  high:"bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-500/20",
  medium:"bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20",
  low:"bg-slate-50 text-slate-500 ring-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:ring-slate-500/20",
};
const STA: Record<TicketRow["status"], string> = {
  in_progress:"bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/20",
  resolved:"bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20",
  open:"bg-slate-50 text-slate-500 ring-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:ring-slate-500/20",
};

function Chip({ label, cls }: { label: string; cls: string }) {
  return <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset", cls)}>{label}</span>;
}

function PieTip({ active, payload }: { active?: boolean; payload?: Array<{payload:{name:string;n:number}}> }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return <div className="rounded-lg border border-border bg-popover px-3 py-1.5 text-xs shadow-md"><p className="font-semibold">{d.name}</p><p className="text-muted-foreground">{d.n} assets</p></div>;
}

function CTip({ active, payload, label, fmt }: { active?: boolean; payload?: Array<{name:string;value:number;color:string}>; label?: string; fmt?: (v:number)=>string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md space-y-1 min-w-[110px]">
      <p className="font-semibold text-foreground">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full" style={{background:p.color}}/>
          <span className="flex-1">{p.name}</span>
          <span className="font-semibold text-foreground">{fmt ? fmt(p.value) : p.value}</span>
        </div>
      ))}
    </div>
  );
}

function ScoreBar({ score }: { score: number }) {
  const c = score >= 80 ? "#ef4444" : score >= 60 ? "#f59e0b" : "#10b981";
  const tc = score >= 80 ? "text-rose-600 dark:text-rose-400" : score >= 60 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400";
  return (
    <div className="flex items-center gap-2 shrink-0">
      <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{width:`${score}%`,background:c}}/>
      </div>
      <span className={cn("text-xs font-semibold tabular-nums w-7",tc)}>{score}</span>
    </div>
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-xl border border-slate-200 dark:border-slate-700 bg-card shadow-sm", className)}>{children}</div>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p className="text-[13px] font-semibold text-foreground">{children}</p>;
}
function SectionSub({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] text-muted-foreground mt-0.5">{children}</p>;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const [refreshing, setRefreshing] = React.useState(false);
  const [now, setNow] = React.useState(new Date());
  const [tab, setTab] = React.useState<"health"|"tickets"|"cost">("health");

  function refresh() {
    setRefreshing(true);
    setTimeout(() => { setNow(new Date()); setRefreshing(false); }, 900);
  }

  const time = now.toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });
  const date = now.toLocaleDateString([], { weekday:"short", month:"short", day:"numeric" });

  return (
    <div className="relative space-y-5 pb-20">
      {/* Full-page floating particle background */}
      <PageParticles />

      {/* All content sits above the canvas */}
      <div className="relative z-10 space-y-5">

      {/* ══ Hero header with particle bg ════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-2xl border border-violet-200/60 dark:border-violet-500/20">
        {/* Particle canvas */}
        <ParticleCanvas />

        {/* Gradient layer */}
        <div className="absolute inset-0 bg-linear-to-br from-violet-50/90 via-white/70 to-sky-50/80 dark:from-violet-950/70 dark:via-slate-950/60 dark:to-sky-950/50 pointer-events-none" />

        {/* Content */}
        <div className="relative px-7 py-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-violet-500 dark:text-violet-400">PredictiX</span>
              <span className="text-muted-foreground/30 text-xs font-light">/</span>
              <span className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground/60">Admin</span>
              <span className="text-muted-foreground/30 text-xs font-light">/</span>
              <span className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground/80">Dashboard</span>
            </div>

            {/* Title */}
            <h1 className="text-[26px] font-semibold tracking-[-0.025em] leading-none text-foreground">
              Operations Dashboard
            </h1>

            {/* Subtitle + live badge */}
            <div className="flex items-center gap-2.5 mt-2.5">
              <p className="text-[12px] text-muted-foreground leading-tight max-w-sm">
                Real-time asset health, AI failure predictions and maintenance operations.
              </p>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/25 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"/>
                Live
              </span>
            </div>
          </div>

          {/* Right controls */}
          <div className="flex flex-col items-end gap-2.5 shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground bg-background/60 dark:bg-white/5 border border-border backdrop-blur-sm rounded-lg px-3 py-1.5">
                <Clock className="h-3 w-3"/>
                <span>{date} · <span className="font-semibold text-foreground">{time}</span></span>
              </div>
              <button
                onClick={refresh}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background/70 dark:bg-white/5 backdrop-blur-sm px-3 py-1.5 text-[11px] font-medium text-foreground hover:bg-background transition-colors"
              >
                <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")}/>
                Refresh
              </button>
            </div>
            {/* Quick stat pills */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100/80 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/25 px-2.5 py-1 text-[10px] font-semibold text-rose-700 dark:text-rose-300">
                <Flame className="h-3 w-3"/> 12 critical alerts
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100/80 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25 px-2.5 py-1 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                <Ticket className="h-3 w-3"/> 37 open tickets
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100/80 dark:bg-sky-500/15 border border-sky-200 dark:border-sky-500/25 px-2.5 py-1 text-[10px] font-semibold text-sky-700 dark:text-sky-300">
                <Brain className="h-3 w-3"/> 18 predicted failures
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ══ KPIs ════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {KPI.map((k) => (
          <Card key={k.label} className="p-4 hover:shadow-sm transition-shadow cursor-default">
            <div className="flex items-center justify-between mb-3">
              <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", k.iconBg)}>
                <k.icon className={cn("h-4 w-4", k.iconColor)}/>
              </div>
              <TrendChip trend={k.trend} delta={k.delta}/>
            </div>
            <p className={cn("text-[22px] font-semibold tracking-tight leading-none", k.accent)}>{k.value}</p>
            <p className="mt-1.5 text-[12px] font-medium text-foreground">{k.label}</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">{k.sub}</p>
          </Card>
        ))}
      </div>

      {/* ══ AI Insights strip ════════════════════════════════════════════════ */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Bot className="h-4 w-4 text-violet-500"/>
          <span className="text-[12px] font-semibold text-foreground">AI Insights</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 dark:bg-violet-500/15 border border-violet-200 dark:border-violet-500/25 px-2 py-0.5 text-[9px] font-bold text-violet-700 dark:text-violet-300 uppercase tracking-wide">
            <Zap className="h-2.5 w-2.5"/> XGBoost · BERT
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {INSIGHTS.map((ins) => (
            <div key={ins.title} className={cn("rounded-xl border p-4", ins.bg)}>
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 shrink-0">
                  <ins.icon className={cn("h-4 w-4", ins.color)}/>
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-foreground leading-tight">{ins.title}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">{ins.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ Charts row ══════════════════════════════════════════════════════ */}
      <div className="grid gap-4 lg:grid-cols-5">

        {/* Tabbed main chart */}
        <Card className="lg:col-span-3 overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-200 dark:border-slate-700">
            <div>
              <SectionTitle>Asset & Operations Trends</SectionTitle>
              <SectionSub>7-month historical view</SectionSub>
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-0.5">
              {(["health","tickets","cost"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-[11px] font-medium transition-all capitalize",
                    tab === t ? "bg-background text-foreground shadow-xs border border-border" : "text-muted-foreground hover:text-foreground"
                  )}
                >{t === "cost" ? "Maint. cost" : t === "health" ? "Health" : "Tickets"}</button>
              ))}
            </div>
          </div>

          <div className="px-5 pt-4 pb-2">
            {tab === "health" && (
              <div style={{height:210,minHeight:210}}>
                <ResponsiveContainer width="100%" height="100%" debounce={200}>
                  <AreaChart data={healthSeries} margin={{top:4,right:4,left:-24,bottom:0}}>
                    <defs>
                      <linearGradient id="hG" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.18}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border))" opacity={0.5}/>
                    <XAxis dataKey="m" tick={{fontSize:11,fill:"hsl(var(--muted-foreground))"}} axisLine={false} tickLine={false}/>
                    <YAxis domain={[60,100]} tick={{fontSize:11,fill:"hsl(var(--muted-foreground))"}} axisLine={false} tickLine={false}/>
                    <Tooltip content={<CTip fmt={v=>`${v}%`}/>}/>
                    <Area type="monotone" dataKey="v" name="Health score" stroke="#6366f1" strokeWidth={2} fill="url(#hG)"
                      dot={{fill:"#6366f1",r:3,strokeWidth:0}} activeDot={{r:5,fill:"#6366f1",strokeWidth:2,stroke:"#fff"}}/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
            {tab === "tickets" && (
              <div style={{height:210,minHeight:210}}>
                <ResponsiveContainer width="100%" height="100%" debounce={200}>
                  <BarChart data={ticketSeries} margin={{top:4,right:4,left:-24,bottom:0}} barGap={3}>
                    <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border))" opacity={0.5}/>
                    <XAxis dataKey="w" tick={{fontSize:11,fill:"hsl(var(--muted-foreground))"}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fontSize:11,fill:"hsl(var(--muted-foreground))"}} axisLine={false} tickLine={false}/>
                    <Tooltip content={<CTip/>}/>
                    <Legend wrapperStyle={{fontSize:11}}/>
                    <Bar dataKey="open" name="Opened"      fill="#f59e0b" radius={[3,3,0,0]}/>
                    <Bar dataKey="prog" name="In progress" fill="#8b5cf6" radius={[3,3,0,0]}/>
                    <Bar dataKey="done" name="Resolved"    fill="#10b981" radius={[3,3,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            {tab === "cost" && (
              <div style={{height:210,minHeight:210}}>
                <ResponsiveContainer width="100%" height="100%" debounce={200}>
                  <BarChart data={costData} margin={{top:4,right:4,left:-20,bottom:0}} barGap={4}>
                    <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border))" opacity={0.5}/>
                    <XAxis dataKey="m" tick={{fontSize:11,fill:"hsl(var(--muted-foreground))"}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fontSize:11,fill:"hsl(var(--muted-foreground))"}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}M`}/>
                    <Tooltip content={<CTip fmt={v=>`LKR ${v}M`}/>}/>
                    <Legend wrapperStyle={{fontSize:11}}/>
                    <Bar dataKey="est" name="Estimated" fill="#8b5cf6" radius={[3,3,0,0]}/>
                    <Bar dataKey="act" name="Actual"    fill="#06b6d4" radius={[3,3,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Stat summary footer */}
          <div className="border-t border-slate-200 dark:border-slate-700 grid grid-cols-3 divide-x divide-slate-200 dark:divide-slate-700">
            {[
              {label:"Avg health score", val:"76%",   color:"text-amber-600 dark:text-amber-400"},
              {label:"Tickets resolved", val:"148",   color:"text-emerald-600 dark:text-emerald-400"},
              {label:"Avg resolution",   val:"3.4d",  color:"text-sky-600 dark:text-sky-400"},
            ].map((s) => (
              <div key={s.label} className="px-4 py-3">
                <p className={cn("text-[17px] font-semibold", s.color)}>{s.val}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Right column */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* Donut */}
          <Card className="p-4 flex-1">
            <SectionTitle>Health Distribution</SectionTitle>
            <SectionSub>284 assets by condition band</SectionSub>
            <div className="flex items-center gap-4 mt-3">
              <div style={{height:110,minHeight:110,width:110,flexShrink:0}}>
                <ResponsiveContainer width="100%" height="100%" debounce={200}>
                  <PieChart>
                    <Pie data={distData} dataKey="n" innerRadius={34} outerRadius={52}
                      paddingAngle={2} startAngle={90} endAngle={-270}>
                      {distData.map((d,i) => <Cell key={i} fill={d.c} strokeWidth={0}/>)}
                    </Pie>
                    <Tooltip content={<PieTip/>}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-1.5">
                {distData.map((d) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{background:d.c}}/>
                    <span className="text-[11px] text-muted-foreground flex-1">{d.name}</span>
                    <div className="w-12 h-1 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full" style={{width:`${(d.n/284)*100}%`,background:d.c}}/>
                    </div>
                    <span className="text-[11px] font-semibold tabular-nums w-6 text-right">{d.n}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Downtime by warehouse */}
          <Card className="p-4">
            <SectionTitle>Downtime by Warehouse</SectionTitle>
            <SectionSub>Planned vs unplanned hours — this month</SectionSub>
            <div className="mt-3" style={{height:110,minHeight:110}}>
              <ResponsiveContainer width="100%" height="100%" debounce={200}>
                <BarChart data={downtimeData} layout="vertical" margin={{top:0,right:4,left:36,bottom:0}} barGap={3}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} horizontal={false}/>
                  <XAxis type="number" tick={{fontSize:10,fill:"hsl(var(--muted-foreground))"}} axisLine={false} tickLine={false}/>
                  <YAxis type="category" dataKey="name" tick={{fontSize:11,fill:"hsl(var(--muted-foreground))"}} axisLine={false} tickLine={false} width={34}/>
                  <Tooltip content={<CTip/>}/>
                  <Legend wrapperStyle={{fontSize:10}}/>
                  <Bar dataKey="planned"    name="Planned"    fill="#6366f1" radius={[0,3,3,0]}/>
                  <Bar dataKey="unplanned"  name="Unplanned"  fill="#ef4444" radius={[0,3,3,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* ══ Risk + Alerts ════════════════════════════════════════════════════ */}
      <div className="grid gap-4 lg:grid-cols-2">

        <Card>
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-700">
            <div><SectionTitle>Top Risk Assets</SectionTitle><SectionSub>Ranked by AI predicted failure probability</SectionSub></div>
            <button className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground font-medium">View all<ChevronRight className="h-3.5 w-3.5"/></button>
          </div>
          <div>
            {RISKS.map((a,i) => (
              <div key={a.id} className={cn("flex items-center gap-3 px-5 py-3 border-b border-slate-200 dark:border-slate-700 last:border-0 transition-colors hover:bg-muted/20 cursor-pointer")}>
                <div className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold",
                  i===0?"bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400":
                  i===1?"bg-rose-50 text-rose-400 dark:bg-rose-500/10 dark:text-rose-500":
                  "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                )}>{i+1}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[12px] font-semibold truncate">{a.name}</p>
                    {i<2 && <ShieldAlert className="h-3 w-3 text-rose-500 shrink-0"/>}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{a.loc} · {a.days}d to maintenance · {Math.round(a.prob*100)}% fail prob.</p>
                </div>
                <ScoreBar score={a.score}/>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-700">
            <div><SectionTitle>Recent Alerts</SectionTitle><SectionSub>Asset monitoring — latest events</SectionSub></div>
            <button className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground font-medium">View all<ChevronRight className="h-3.5 w-3.5"/></button>
          </div>
          <div>
            {ALERTS.map((a) => (
              <div key={a.id} className={cn("flex items-start gap-3 px-5 py-3 border-b border-slate-200 dark:border-slate-700 last:border-0 transition-colors cursor-default", SEV_ROW[a.severity])}>
                <span className={cn("h-2 w-2 rounded-full shrink-0 mt-1.5", SEV_DOT[a.severity])}/>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={cn("text-[10px] font-bold uppercase tracking-wide", SEV_LABEL[a.severity])}>{a.severity}</span>
                    <span className="text-[10px] text-muted-foreground">{a.id}</span>
                    <span className="ml-auto text-[10px] text-muted-foreground shrink-0">{a.ago} ago</span>
                  </div>
                  <p className="text-[12px] font-semibold text-foreground">{a.asset}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{a.msg}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1">{a.location}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ══ Tickets table ════════════════════════════════════════════════════ */}
      <Card>
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-700">
          <div><SectionTitle>Maintenance Tickets</SectionTitle><SectionSub>Latest open and in-progress work orders</SectionSub></div>
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-[11px] font-medium hover:bg-muted transition-colors">
            <ArrowUpRight className="h-3.5 w-3.5"/> Manage
          </button>
        </div>
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto] bg-muted/40 border-b border-slate-200 dark:border-slate-700">
          {["Ticket","Asset","Priority","Status","Assigned"].map((h) => (
            <div key={h} className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{h}</div>
          ))}
        </div>
        {TICKETS.map((t) => (
          <div key={t.id} className="grid grid-cols-[1fr_auto_auto_auto_auto] border-b border-slate-200 dark:border-slate-700 last:border-0 hover:bg-muted/20 transition-colors cursor-pointer">
            <div className="px-4 py-3">
              <p className="text-[12px] font-semibold">{t.title}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{t.id}</p>
            </div>
            <div className="px-4 py-3 flex items-center"><span className="text-[11px] text-muted-foreground">{t.asset}</span></div>
            <div className="px-4 py-3 flex items-center"><Chip label={t.priority} cls={PRI[t.priority]}/></div>
            <div className="px-4 py-3 flex items-center">
              <Chip
                label={t.status==="in_progress"?"In progress":t.status==="resolved"?"Resolved":"Open"}
                cls={STA[t.status]}
              />
            </div>
            <div className="px-4 py-3 flex items-center"><span className="text-[11px] text-muted-foreground">{t.person}</span></div>
          </div>
        ))}
      </Card>

      {/* ══ AI summary banner ════════════════════════════════════════════════ */}
      <div className="rounded-xl border border-violet-200 dark:border-violet-500/20 bg-linear-to-br from-violet-50 to-indigo-50/60 dark:from-violet-950/40 dark:to-indigo-950/30 p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-200 dark:border-violet-500/30 bg-violet-100 dark:bg-violet-500/15">
            <Bot className="h-5 w-5 text-violet-600 dark:text-violet-400"/>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <p className="text-[13px] font-semibold">AI Operational Summary</p>
              <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset bg-violet-100 text-violet-700 ring-violet-200 dark:bg-violet-500/15 dark:text-violet-300 dark:ring-violet-500/25">
                <Zap className="h-2.5 w-2.5"/> XGBoost · BERT · RAG
              </span>
              <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/25">
                <CheckCircle2 className="h-2.5 w-2.5"/> High confidence
              </span>
            </div>
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              Fleet health declined <strong className="text-foreground">−4.2%</strong> over 30 days.
              Elevated vibration in WH-A and thermal anomalies in WH-B are primary drivers.
              Model predicts <strong className="text-rose-600 dark:text-rose-400">3 critical failures</strong> within 14 days — FL-22, CP-07, C-09.
              Immediate intervention reduces 8-week failures from 18 → 9 and saves{" "}
              <strong className="text-emerald-600 dark:text-emerald-400">LKR 820,000</strong> in unplanned downtime.
              WH-B unplanned downtime (14h this month) is the largest cost driver — a belt replacement on C-09 this week
              prevents the highest-ROI intervention available.
            </p>
          </div>
          <button className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-violet-200 dark:border-violet-500/30 bg-white/70 dark:bg-violet-500/10 hover:bg-violet-50 dark:hover:bg-violet-500/20 px-3 py-1.5 text-[11px] font-semibold text-violet-700 dark:text-violet-300 transition-colors">
            Full report <ExternalLink className="h-3.5 w-3.5"/>
          </button>
        </div>
      </div>

      </div>{/* end z-10 content wrapper */}
    </div>
  );
}