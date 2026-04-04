/* eslint-disable @typescript-eslint/no-explicit-any */
// // // "use client";

// // // import * as React from "react";
// // // import {
// // //   LineChart,
// // //   Line,
// // //   XAxis,
// // //   YAxis,
// // //   Tooltip,
// // //   ResponsiveContainer,
// // //   CartesianGrid,
// // //   PieChart,
// // //   Pie,
// // //   Cell,
// // //   Legend,
// // // } from "recharts";

// // // import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// // // import { Button } from "@/components/ui/button";
// // // import { Badge } from "@/components/ui/badge";
// // // import { Separator } from "@/components/ui/separator";

// // // import {
// // //   Table,
// // //   TableBody,
// // //   TableCell,
// // //   TableHead,
// // //   TableHeader,
// // //   TableRow,
// // // } from "@/components/ui/table";

// // // import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// // // import {
// // //   Activity,
// // //   AlertTriangle,
// // //   Wrench,
// // //   Cpu,
// // //   Plus,
// // //   FileText,
// // //   RefreshCw,
// // //   ArrowUpRight,
// // // } from "lucide-react";

// // // /**
// // //  * Admin Dashboard (PredictiX)
// // //  * - Uses mock data now
// // //  * - Replace mock data with API calls later (FastAPI)
// // //  */

// // // type AlertItem = {
// // //   id: string;
// // //   severity: "Critical" | "Warning" | "Info";
// // //   asset: string;
// // //   message: string;
// // //   time: string;
// // // };

// // // type TicketItem = {
// // //   id: string;
// // //   title: string;
// // //   category: string;
// // //   priority: "High" | "Medium" | "Low";
// // //   status: "Open" | "In Progress" | "Resolved";
// // //   createdAt: string;
// // // };

// // // const kpis = [
// // //   {
// // //     label: "Total Assets",
// // //     value: "128",
// // //     sub: "+4 this month",
// // //     icon: Activity,
// // //   },
// // //   {
// // //     label: "Critical Alerts",
// // //     value: "7",
// // //     sub: "Needs immediate action",
// // //     icon: AlertTriangle,
// // //   },
// // //   {
// // //     label: "Open Tickets",
// // //     value: "23",
// // //     sub: "6 high priority",
// // //     icon: Wrench,
// // //   },
// // //   {
// // //     label: "Model Health",
// // //     value: "92%",
// // //     sub: "Avg. confidence",
// // //     icon: Cpu,
// // //   },
// // // ] as const;

// // // const downtimeTrend = [
// // //   { name: "Mon", minutes: 18 },
// // //   { name: "Tue", minutes: 10 },
// // //   { name: "Wed", minutes: 25 },
// // //   { name: "Thu", minutes: 14 },
// // //   { name: "Fri", minutes: 9 },
// // //   { name: "Sat", minutes: 6 },
// // //   { name: "Sun", minutes: 12 },
// // // ];

// // // const healthDistribution = [
// // //   { name: "Healthy", value: 86 },
// // //   { name: "Warning", value: 30 },
// // //   { name: "Critical", value: 12 },
// // // ];

// // // const PIE_COLORS = [
// // //   "hsl(var(--primary))",
// // //   "hsl(var(--muted-foreground))",
// // //   "hsl(var(--destructive))",
// // // ];

// // // const recentAlerts: AlertItem[] = [
// // //   {
// // //     id: "AL-1007",
// // //     severity: "Critical",
// // //     asset: "Compressor A-14",
// // //     message: "Vibration exceeded threshold (RMS 12.3 mm/s).",
// // //     time: "10 mins ago",
// // //   },
// // //   {
// // //     id: "AL-1006",
// // //     severity: "Warning",
// // //     asset: "Pump P-09",
// // //     message: "Temperature rising trend detected (last 3 hours).",
// // //     time: "34 mins ago",
// // //   },
// // //   {
// // //     id: "AL-1005",
// // //     severity: "Info",
// // //     asset: "Motor M-02",
// // //     message: "Maintenance window scheduled for tomorrow.",
// // //     time: "2 hrs ago",
// // //   },
// // // ];

// // // const latestTickets: TicketItem[] = [
// // //   {
// // //     id: "TCK-2301",
// // //     title: "Abnormal vibration on Compressor A-14",
// // //     category: "Mechanical",
// // //     priority: "High",
// // //     status: "Open",
// // //     createdAt: "2026-01-05",
// // //   },
// // //   {
// // //     id: "TCK-2297",
// // //     title: "Oil leak suspected near Pump P-09",
// // //     category: "Maintenance",
// // //     priority: "Medium",
// // //     status: "In Progress",
// // //     createdAt: "2026-01-04",
// // //   },
// // //   {
// // //     id: "TCK-2293",
// // //     title: "Sensor drift on Motor M-02",
// // //     category: "Sensors",
// // //     priority: "Low",
// // //     status: "Resolved",
// // //     createdAt: "2026-01-03",
// // //   },
// // // ];

// // // function SeverityBadge({ severity }: { severity: AlertItem["severity"] }) {
// // //   if (severity === "Critical") return <Badge variant="destructive">Critical</Badge>;
// // //   if (severity === "Warning") return <Badge variant="secondary">Warning</Badge>;
// // //   return <Badge variant="outline">Info</Badge>;
// // // }

// // // function PriorityBadge({ priority }: { priority: TicketItem["priority"] }) {
// // //   if (priority === "High") return <Badge variant="destructive">High</Badge>;
// // //   if (priority === "Medium") return <Badge variant="secondary">Medium</Badge>;
// // //   return <Badge variant="outline">Low</Badge>;
// // // }

// // // function StatusBadge({ status }: { status: TicketItem["status"] }) {
// // //   if (status === "Open") return <Badge variant="destructive">Open</Badge>;
// // //   if (status === "In Progress") return <Badge variant="secondary">In Progress</Badge>;
// // //   return <Badge variant="outline">Resolved</Badge>;
// // // }

// // // export default function AdminDashboardPage() {
// // //   const [isRefreshing, setIsRefreshing] = React.useState(false);

// // //   async function onRefresh() {
// // //     setIsRefreshing(true);
// // //     await new Promise((r) => setTimeout(r, 700));
// // //     setIsRefreshing(false);
// // //   }

// // //   return (
// // //     <div className="min-h-[calc(100vh-64px)] w-full">
// // //       <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
// // //         <div>
// // //           <h1 className="text-2xl font-semibold tracking-tight">Admin Dashboard</h1>
// // //           <p className="text-sm text-muted-foreground">
// // //             Overview of assets, alerts, tickets, and predictive signals.
// // //           </p>
// // //         </div>

// // //         <div className="flex flex-wrap items-center gap-2">
// // //           <Button variant="outline" onClick={onRefresh} disabled={isRefreshing}>
// // //             <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
// // //             Refresh
// // //           </Button>

// // //           <Button>
// // //             <Plus className="mr-2 h-4 w-4" />
// // //             Add Asset
// // //           </Button>

// // //           <Button variant="secondary">
// // //             <FileText className="mr-2 h-4 w-4" />
// // //             Generate Report
// // //           </Button>
// // //         </div>
// // //       </div>

// // //       <Separator className="my-6" />

// // //       <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
// // //         {kpis.map((k) => (
// // //           <Card key={k.label} className="rounded-2xl">
// // //             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
// // //               <CardTitle className="text-sm font-medium text-muted-foreground">{k.label}</CardTitle>
// // //               <k.icon className="h-5 w-5 text-muted-foreground" />
// // //             </CardHeader>
// // //             <CardContent>
// // //               <div className="text-2xl font-semibold">{k.value}</div>
// // //               <p className="mt-1 text-xs text-muted-foreground">{k.sub}</p>
// // //             </CardContent>
// // //           </Card>
// // //         ))}
// // //       </div>

// // //       <div className="mt-6 grid gap-4 lg:grid-cols-3">
// // //         <Card className="rounded-2xl lg:col-span-2">
// // //           <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
// // //             <div>
// // //               <CardTitle>Operational Trend</CardTitle>
// // //               <p className="text-sm text-muted-foreground">Weekly downtime minutes (sample)</p>
// // //             </div>

// // //             <Tabs defaultValue="downtime" className="w-full sm:w-auto">
// // //               <TabsList className="grid w-full grid-cols-2 sm:w-[240px]">
// // //                 <TabsTrigger value="downtime">Downtime</TabsTrigger>
// // //                 <TabsTrigger value="health">Health Split</TabsTrigger>
// // //               </TabsList>

// // //               <TabsContent value="downtime" className="mt-3">
// // //                 <div className="h-[260px] w-full">
// // //                   <ResponsiveContainer width="100%" height="100%">
// // //                     <LineChart data={downtimeTrend} margin={{ top: 10, right: 16, left: -8, bottom: 0 }}>
// // //                       <CartesianGrid strokeDasharray="3 3" />
// // //                       <XAxis dataKey="name" />
// // //                       <YAxis />
// // //                       <Tooltip />
// // //                       <Line
// // //                         type="monotone"
// // //                         dataKey="minutes"
// // //                         stroke="hsl(var(--primary))"
// // //                         strokeWidth={2}
// // //                         dot={false}
// // //                       />
// // //                     </LineChart>
// // //                   </ResponsiveContainer>
// // //                 </div>
// // //               </TabsContent>

// // //               <TabsContent value="health" className="mt-3">
// // //                 <div className="h-[260px] w-full">
// // //                   <ResponsiveContainer width="100%" height="100%">
// // //                     <PieChart>
// // //                       <Pie
// // //                         data={healthDistribution}
// // //                         dataKey="value"
// // //                         nameKey="name"
// // //                         innerRadius={55}
// // //                         outerRadius={90}
// // //                         paddingAngle={4}
// // //                       >
// // //                         {healthDistribution.map((_, idx) => (
// // //                           <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
// // //                         ))}
// // //                       </Pie>
// // //                       <Tooltip />
// // //                       <Legend />
// // //                     </PieChart>
// // //                   </ResponsiveContainer>
// // //                 </div>
// // //               </TabsContent>
// // //             </Tabs>
// // //           </CardHeader>
// // //         </Card>

// // //         <Card className="rounded-2xl">
// // //           <CardHeader>
// // //             <CardTitle className="flex items-center justify-between">
// // //               Recent Alerts
// // //               <Button variant="ghost" size="sm" className="gap-1">
// // //                 View all <ArrowUpRight className="h-4 w-4" />
// // //               </Button>
// // //             </CardTitle>
// // //             <p className="text-sm text-muted-foreground">
// // //               Latest detected events from asset monitoring.
// // //             </p>
// // //           </CardHeader>

// // //           <CardContent className="space-y-3">
// // //             {recentAlerts.map((a) => (
// // //               <div key={a.id} className="rounded-xl border p-3">
// // //                 <div className="flex items-center justify-between gap-2">
// // //                   <SeverityBadge severity={a.severity} />
// // //                   <span className="text-xs text-muted-foreground">{a.time}</span>
// // //                 </div>
// // //                 <div className="mt-2">
// // //                   <p className="text-sm font-medium">{a.asset}</p>
// // //                   <p className="mt-1 text-xs text-muted-foreground">{a.message}</p>
// // //                 </div>
// // //               </div>
// // //             ))}
// // //           </CardContent>
// // //         </Card>
// // //       </div>

// // //       <Card className="mt-6 rounded-2xl">
// // //         <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
// // //           <div>
// // //             <CardTitle>Latest Tickets</CardTitle>
// // //             <p className="text-sm text-muted-foreground">Monitor current issues and progress.</p>
// // //           </div>
// // //           <div className="flex gap-2">
// // //             <Button variant="outline">Manage Tickets</Button>
// // //             
// // //               <Plus className="mr-2 h-4 w-4" />
// // //               New Ticket
// // //             </Button>
// // //           </div>
// // //         </CardHeader>

// // //         <CardContent>
// // //           <div className="overflow-x-auto rounded-xl border">
// // //             <Table>
// // //               <TableHeader>
// // //                 <TableRow>
// // //                   <TableHead className="w-[120px]">Ticket ID</TableHead>
// // //                   <TableHead>Title</TableHead>
// // //                   <TableHead className="w-[140px]">Category</TableHead>
// // //                   <TableHead className="w-[120px]">Priority</TableHead>
// // //                   <TableHead className="w-[140px]">Status</TableHead>
// // //                   <TableHead className="w-[130px]">Created</TableHead>
// // //                 </TableRow>
// // //               </TableHeader>

// // //               <TableBody>
// // //                 {latestTickets.map((t) => (
// // //                   <TableRow key={t.id}>
// // //                     <TableCell className="font-medium">{t.id}</TableCell>
// // //                     <TableCell className="min-w-[320px]">{t.title}</TableCell>
// // //                     <TableCell>{t.category}</TableCell>
// // //                     <TableCell>
// // //                       <PriorityBadge priority={t.priority} />
// // //                     </TableCell>
// // //                     <TableCell>
// // //                       <StatusBadge status={t.status} />
// // //                     </TableCell>
// // //                     <TableCell className="text-muted-foreground">{t.createdAt}</TableCell>
// // //                   </TableRow>
// // //                 ))}
// // //               </TableBody>
// // //             </Table>
// // //           </div>
// // //         </CardContent>
// // //       </Card>
// // //     </div>
// // //   );
// // // }


// // "use client";

// // import * as React from "react";
// // import {
// //   LineChart,
// //   Line,
// //   XAxis,
// //   YAxis,
// //   Tooltip,
// //   ResponsiveContainer,
// //   CartesianGrid,
// //   PieChart,
// //   Pie,
// //   Cell,
// //   Legend,
// // } from "recharts";

// // import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// // import { Button } from "@/components/ui/button";
// // import { Badge } from "@/components/ui/badge";
// // import { Separator } from "@/components/ui/separator";
// // import {
// //   Table,
// //   TableBody,
// //   TableCell,
// //   TableHead,
// //   TableHeader,
// //   TableRow,
// // } from "@/components/ui/table";
// // import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// // import {
// //   Activity,
// //   AlertTriangle,
// //   Wrench,
// //   Cpu,
// //   Plus,
// //   FileText,
// //   RefreshCw,
// //   ArrowUpRight,
// // } from "lucide-react";

// // type AlertItem = {
// //   id: string;
// //   severity: "Critical" | "Warning" | "Info";
// //   asset: string;
// //   message: string;
// //   time: string;
// // };

// // type TicketItem = {
// //   id: string;
// //   title: string;
// //   category: string;
// //   priority: "High" | "Medium" | "Low";
// //   status: "Open" | "In Progress" | "Resolved";
// //   createdAt: string;
// // };

// // const kpis = [
// //   { label: "Total Assets", value: "128", sub: "+4 this month", icon: Activity },
// //   { label: "Critical Alerts", value: "7", sub: "Needs immediate action", icon: AlertTriangle },
// //   { label: "Open Tickets", value: "23", sub: "6 high priority", icon: Wrench },
// //   { label: "Model Health", value: "92%", sub: "Avg. confidence", icon: Cpu },
// // ] as const;

// // const downtimeTrend = [
// //   { name: "Mon", minutes: 18 },
// //   { name: "Tue", minutes: 10 },
// //   { name: "Wed", minutes: 25 },
// //   { name: "Thu", minutes: 14 },
// //   { name: "Fri", minutes: 9 },
// //   { name: "Sat", minutes: 6 },
// //   { name: "Sun", minutes: 12 },
// // ];

// // const healthDistribution = [
// //   { name: "Healthy", value: 86 },
// //   { name: "Warning", value: 30 },
// //   { name: "Critical", value: 12 },
// // ];

// // const PIE_COLORS = [
// //   "hsl(var(--primary))",
// //   "hsl(var(--muted-foreground))",
// //   "hsl(var(--destructive))",
// // ];

// // const recentAlerts: AlertItem[] = [
// //   { id: "AL-1007", severity: "Critical", asset: "Compressor A-14", message: "Vibration exceeded threshold (RMS 12.3 mm/s).", time: "10 mins ago" },
// //   { id: "AL-1006", severity: "Warning", asset: "Pump P-09", message: "Temperature rising trend detected (last 3 hours).", time: "34 mins ago" },
// //   { id: "AL-1005", severity: "Info", asset: "Motor M-02", message: "Maintenance window scheduled for tomorrow.", time: "2 hrs ago" },
// // ];

// // const latestTickets: TicketItem[] = [
// //   { id: "TCK-2301", title: "Abnormal vibration on Compressor A-14", category: "Mechanical", priority: "High", status: "Open", createdAt: "2026-01-05" },
// //   { id: "TCK-2297", title: "Oil leak suspected near Pump P-09", category: "Maintenance", priority: "Medium", status: "In Progress", createdAt: "2026-01-04" },
// //   { id: "TCK-2293", title: "Sensor drift on Motor M-02", category: "Sensors", priority: "Low", status: "Resolved", createdAt: "2026-01-03" },
// // ];

// // function SeverityBadge({ severity }: { severity: AlertItem["severity"] }) {
// //   if (severity === "Critical") return <Badge variant="destructive">Critical</Badge>;
// //   if (severity === "Warning") return <Badge variant="secondary">Warning</Badge>;
// //   return <Badge variant="outline">Info</Badge>;
// // }

// // function PriorityBadge({ priority }: { priority: TicketItem["priority"] }) {
// //   if (priority === "High") return <Badge variant="destructive">High</Badge>;
// //   if (priority === "Medium") return <Badge variant="secondary">Medium</Badge>;
// //   return <Badge variant="outline">Low</Badge>;
// // }

// // function StatusBadge({ status }: { status: TicketItem["status"] }) {
// //   if (status === "Open") return <Badge variant="destructive">Open</Badge>;
// //   if (status === "In Progress") return <Badge variant="secondary">In Progress</Badge>;
// //   return <Badge variant="outline">Resolved</Badge>;
// // }

// // export default function AdminDashboardPage() {
// //   const [isRefreshing, setIsRefreshing] = React.useState(false);

// //   async function onRefresh() {
// //     setIsRefreshing(true);
// //     await new Promise((r) => setTimeout(r, 700));
// //     setIsRefreshing(false);
// //   }

// //   return (
// //     <div className="w-full">
// //       <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
// //         <div>
// //           <h1 className="text-2xl font-semibold tracking-tight">Admin Dashboard</h1>
// //           <p className="text-sm text-muted-foreground">
// //             Overview of assets, alerts, tickets, and predictive signals.
// //           </p>
// //         </div>

// //         <div className="flex flex-wrap items-center gap-2">
// //           <Button variant="outline" onClick={onRefresh} disabled={isRefreshing}>
// //             <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
// //             Refresh
// //           </Button>

// //           <Button>
// //             <Plus className="mr-2 h-4 w-4" />
// //             Add Asset
// //           </Button>

// //           <Button variant="secondary">
// //             <FileText className="mr-2 h-4 w-4" />
// //             Generate Report
// //           </Button>
// //         </div>
// //       </div>

// //       <Separator className="my-6" />

// //       <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
// //         {kpis.map((k) => (
// //           <Card key={k.label} className="rounded-2xl">
// //             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
// //               <CardTitle className="text-sm font-medium text-muted-foreground">{k.label}</CardTitle>
// //               <k.icon className="h-5 w-5 text-muted-foreground" />
// //             </CardHeader>
// //             <CardContent>
// //               <div className="text-2xl font-semibold">{k.value}</div>
// //               <p className="mt-1 text-xs text-muted-foreground">{k.sub}</p>
// //             </CardContent>
// //           </Card>
// //         ))}
// //       </div>

// //       <div className="mt-6 grid gap-4 lg:grid-cols-3">
// //         <Card className="rounded-2xl lg:col-span-2">
// //           <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
// //             <div>
// //               <CardTitle>Operational Trend</CardTitle>
// //               <p className="text-sm text-muted-foreground">Weekly downtime minutes (sample)</p>
// //             </div>

// //             <Tabs defaultValue="downtime" className="w-full sm:w-auto">
// //               <TabsList className="grid w-full grid-cols-2 sm:w-[240px]">
// //                 <TabsTrigger value="downtime">Downtime</TabsTrigger>
// //                 <TabsTrigger value="health">Health Split</TabsTrigger>
// //               </TabsList>

// //               <TabsContent value="downtime" className="mt-3">
// //                 <div className="h-[260px] w-full">
// //                   <ResponsiveContainer width="100%" height="100%">
// //                     <LineChart data={downtimeTrend} margin={{ top: 10, right: 16, left: -8, bottom: 0 }}>
// //                       <CartesianGrid strokeDasharray="3 3" />
// //                       <XAxis dataKey="name" />
// //                       <YAxis />
// //                       <Tooltip />
// //                       <Line type="monotone" dataKey="minutes" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
// //                     </LineChart>
// //                   </ResponsiveContainer>
// //                 </div>
// //               </TabsContent>

// //               <TabsContent value="health" className="mt-3">
// //                 <div className="h-[260px] w-full">
// //                   <ResponsiveContainer width="100%" height="100%">
// //                     <PieChart>
// //                       <Pie data={healthDistribution} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={4}>
// //                         {healthDistribution.map((_, idx) => (
// //                           <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
// //                         ))}
// //                       </Pie>
// //                       <Tooltip />
// //                       <Legend />
// //                     </PieChart>
// //                   </ResponsiveContainer>
// //                 </div>
// //               </TabsContent>
// //             </Tabs>
// //           </CardHeader>
// //         </Card>

// //         <Card className="rounded-2xl">
// //           <CardHeader>
// //             <CardTitle className="flex items-center justify-between">
// //               Recent Alerts
// //               <Button variant="ghost" size="sm" className="gap-1">
// //                 View all <ArrowUpRight className="h-4 w-4" />
// //               </Button>
// //             </CardTitle>
// //             <p className="text-sm text-muted-foreground">
// //               Latest detected events from asset monitoring.
// //             </p>
// //           </CardHeader>

// //           <CardContent className="space-y-3">
// //             {recentAlerts.map((a) => (
// //               <div key={a.id} className="rounded-xl border p-3">
// //                 <div className="flex items-center justify-between gap-2">
// //                   <SeverityBadge severity={a.severity} />
// //                   <span className="text-xs text-muted-foreground">{a.time}</span>
// //                 </div>
// //                 <div className="mt-2">
// //                   <p className="text-sm font-medium">{a.asset}</p>
// //                   <p className="mt-1 text-xs text-muted-foreground">{a.message}</p>
// //                 </div>
// //               </div>
// //             ))}
// //           </CardContent>
// //         </Card>
// //       </div>

// //       <Card className="mt-6 rounded-2xl">
// //         <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
// //           <div>
// //             <CardTitle>Latest Tickets</CardTitle>
// //             <p className="text-sm text-muted-foreground">Monitor current issues and progress.</p>
// //           </div>
// //           <div className="flex gap-2">
// //             <Button variant="outline">Manage Tickets</Button>
// //             <Button>
// //               <Plus className="mr-2 h-4 w-4" />
// //               New Ticket
// //             </Button>
// //           </div>
// //         </CardHeader>

// //         <CardContent>
// //           <div className="overflow-x-auto rounded-xl border">
// //             <Table>
// //               <TableHeader>
// //                 <TableRow>
// //                   <TableHead className="w-[120px]">Ticket ID</TableHead>
// //                   <TableHead>Title</TableHead>
// //                   <TableHead className="w-[140px]">Category</TableHead>
// //                   <TableHead className="w-[120px]">Priority</TableHead>
// //                   <TableHead className="w-[140px]">Status</TableHead>
// //                   <TableHead className="w-[130px]">Created</TableHead>
// //                 </TableRow>
// //               </TableHeader>

// //               <TableBody>
// //                 {latestTickets.map((t) => (
// //                   <TableRow key={t.id}>
// //                     <TableCell className="font-medium">{t.id}</TableCell>
// //                     <TableCell className="min-w-[320px]">{t.title}</TableCell>
// //                     <TableCell>{t.category}</TableCell>
// //                     <TableCell><PriorityBadge priority={t.priority} /></TableCell>
// //                     <TableCell><StatusBadge status={t.status} /></TableCell>
// //                     <TableCell className="text-muted-foreground">{t.createdAt}</TableCell>
// //                   </TableRow>
// //                 ))}
// //               </TableBody>
// //             </Table>
// //           </div>
// //         </CardContent>
// //       </Card>

// //       {/* Add some height to test scroll navbar behavior */}
// //       <div className="h-20" />
// //     </div>
// //   );
// // }


// // "use client";

// // import * as React from "react";
// // import { Button } from "@/components/ui/button";
// // import { Separator } from "@/components/ui/separator";
// // import {
// //   Table,
// //   TableBody,
// //   TableCell,
// //   TableHead,
// //   TableHeader,
// //   TableRow,
// // } from "@/components/ui/table";
// // import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// // import {
// //   Activity,
// //   AlertTriangle,
// //   Wrench,
// //   Cpu,
// //   Plus,
// //   FileText,
// //   RefreshCw,
// //   ArrowUpRight,
// // } from "lucide-react";

// // type AlertItem = {
// //   id: string;
// //   severity: "Critical" | "Warning" | "Info";
// //   asset: string;
// //   message: string;
// //   time: string;
// // };

// // type TicketItem = {
// //   id: string;
// //   title: string;
// //   category: string;
// //   priority: "High" | "Medium" | "Low";
// //   status: "Open" | "In Progress" | "Resolved";
// //   createdAt: string;
// // };

// // const kpis = [
// //   { label: "Total Assets", value: "128", sub: "+4 this month", icon: Activity },
// //   { label: "Critical Alerts", value: "7", sub: "Needs immediate action", icon: AlertTriangle },
// //   { label: "Open Tickets", value: "23", sub: "6 high priority", icon: Wrench },
// //   { label: "Model Health", value: "92%", sub: "Avg. confidence", icon: Cpu },
// // ] as const;

// // const downtimeTrend = [
// //   { name: "Mon", minutes: 18 },
// //   { name: "Tue", minutes: 10 },
// //   { name: "Wed", minutes: 25 },
// //   { name: "Thu", minutes: 14 },
// //   { name: "Fri", minutes: 9 },
// //   { name: "Sat", minutes: 6 },
// //   { name: "Sun", minutes: 12 },
// // ];

// // const healthDistribution = [
// //   { name: "Healthy", value: 86 },
// //   { name: "Warning", value: 30 },
// //   { name: "Critical", value: 12 },
// // ];

// // const PIE_COLORS = ["#6366f1", "#8b8fa3", "#ef4444"];

// // const recentAlerts: AlertItem[] = [
// //   { id: "AL-1007", severity: "Critical", asset: "Compressor A-14", message: "Vibration exceeded threshold (RMS 12.3 mm/s).", time: "10 mins ago" },
// //   { id: "AL-1006", severity: "Warning", asset: "Pump P-09", message: "Temperature rising trend detected (last 3 hours).", time: "34 mins ago" },
// //   { id: "AL-1005", severity: "Info", asset: "Motor M-02", message: "Maintenance window scheduled for tomorrow.", time: "2 hrs ago" },
// // ];

// // const latestTickets: TicketItem[] = [
// //   { id: "TCK-2301", title: "Abnormal vibration on Compressor A-14", category: "Mechanical", priority: "High", status: "Open", createdAt: "2026-01-05" },
// //   { id: "TCK-2297", title: "Oil leak suspected near Pump P-09", category: "Maintenance", priority: "Medium", status: "In Progress", createdAt: "2026-01-04" },
// //   { id: "TCK-2293", title: "Sensor drift on Motor M-02", category: "Sensors", priority: "Low", status: "Resolved", createdAt: "2026-01-03" },
// // ];

// // function SeverityBadge({ severity }: { severity: AlertItem["severity"] }) {
// //   if (severity === "Critical") return <Badge variant="destructive">Critical</Badge>;
// //   if (severity === "Warning") return <Badge variant="secondary">Warning</Badge>;
// //   return <Badge variant="outline">Info</Badge>;
// // }

// // import KpiCards from "@/components/admin/dashboard/KpiCards";
// // import OperationalCharts from "@/components/admin/dashboard/OperationalCharts";
// // import RecentAlerts from "@/components/admin/dashboard/RecentAlerts";
// // import LatestTickets from "@/components/admin/dashboard/LatestTickets";

// // export default function AdminDashboardPage() {
// //   const [refreshing, setRefreshing] = React.useState(false);

// //   async function onRefresh() {
// //     setRefreshing(true);
// //     await new Promise((r) => setTimeout(r, 700));
// //     setRefreshing(false);
// //   }


// //   return (
// //     <div className="w-full space-y-6">
// //       <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
// //         <div>
// //           <h1 className="text-3xl font-semibold tracking-tight">Admin Dashboard</h1>
// //           <p className="text-sm text-muted-foreground">
// //             Overview of assets, alerts, tickets, and predictive signals.
// //           </p>
// //         </div>

// //         <div className="flex flex-wrap items-center gap-2">
// //           <Button variant="outline" onClick={onRefresh} disabled={refreshing}>
// //             <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
// //             Refresh
// //           </Button>

// //           <Button>
// //             <Plus className="mr-2 h-4 w-4" />
// //             Add Asset
// //           </Button>

// //           <Button variant="secondary">
// //             <FileText className="mr-2 h-4 w-4" />
// //             Generate Report
// //           </Button>
// //         </div>
// //       </div>

// //       <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
// //         {kpis.map((k) => (
// //           <Card key={k.label} className="rounded-2xl">
// //             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
// //               <CardTitle className="text-sm font-medium text-muted-foreground">{k.label}</CardTitle>
// //               <k.icon className="h-6 w-6 text-muted-foreground" />
// //             </CardHeader>
// //             <CardContent>
// //               <div className="text-2xl font-semibold">{k.value}</div>
// //               <p className="mt-1 text-xs text-muted-foreground">{k.sub}</p>
// //             </CardContent>
// //           </Card>
// //         ))}
// //       </div>

// //       <div className="grid gap-4 lg:grid-cols-3">
// //         <Card className="rounded-2xl lg:col-span-2">
// //           <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
// //             <div>
// //               <CardTitle>Operational Trend</CardTitle>
// //               <p className="text-sm text-muted-foreground">Weekly downtime minutes (sample)</p>
// //             </div>

// //             <Tabs defaultValue="downtime" className="w-full sm:w-auto">
// //               <TabsList className="grid w-full grid-cols-2 sm:w-[240px]">
// //                 <TabsTrigger value="downtime">Downtime</TabsTrigger>
// //                 <TabsTrigger value="health">Health Split</TabsTrigger>
// //               </TabsList>

// //               <TabsContent value="downtime" className="mt-3">
// //                 <div className="h-[260px] w-full">
// //                   <ResponsiveContainer width="100%" height="100%">
// //                     <LineChart data={downtimeTrend} margin={{ top: 10, right: 16, left: -8, bottom: 0 }}>
// //                       <CartesianGrid strokeDasharray="3 3" />
// //                       <XAxis dataKey="name" />
// //                       <YAxis />
// //                       <Tooltip />
// //                       <Line type="monotone" dataKey="minutes" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
// //                     </LineChart>
// //                   </ResponsiveContainer>
// //                 </div>
// //               </TabsContent>

// //               <TabsContent value="health" className="mt-3">
// //                 <div className="h-[260px] w-full">
// //                   <ResponsiveContainer width="100%" height="100%">
// //                     <PieChart>
// //                       <Pie data={healthDistribution} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={4}>
// //                         {healthDistribution.map((_, idx) => (
// //                           <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
// //                         ))}
// //                       </Pie>
// //                       <Tooltip />
// //                       <Legend />
// //                     </PieChart>
// //                   </ResponsiveContainer>
// //                 </div>
// //               </TabsContent>
// //             </Tabs>
// //           </CardHeader>
// //         </Card>

// //         <Card className="rounded-2xl">
// //           <CardHeader>
// //             <CardTitle className="flex items-center justify-between">
// //               Recent Alerts
// //               <Button variant="ghost" size="sm" className="gap-1">
// //                 View all <ArrowUpRight className="h-4 w-4" />
// //               </Button>
// //             </CardTitle>
// //             <p className="text-sm text-muted-foreground">
// //               Latest detected events from asset monitoring.
// //             </p>
// //           </CardHeader>

// //           <CardContent className="space-y-3">
// //             {recentAlerts.map((a) => (
// //               <div key={a.id} className="rounded-xl border p-3">
// //                 <div className="flex items-center justify-between gap-2">
// //                   <SeverityBadge severity={a.severity} />
// //                   <span className="text-xs text-muted-foreground">{a.time}</span>
// //                 </div>
// //                 <div className="mt-2">
// //                   <p className="text-sm font-medium">{a.asset}</p>
// //                   <p className="mt-1 text-xs text-muted-foreground">{a.message}</p>
// //                 </div>
// //               </div>
// //             ))}
// //           </CardContent>
// //         </Card>
// //       </div>

// //       <Card className="rounded-2xl">
// //         <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
// //           <div>
// //             <CardTitle>Latest Tickets</CardTitle>
// //             <p className="text-sm text-muted-foreground">Monitor current issues and progress.</p>
// //           </div>
// //           <div className="flex gap-2">
// //             <Button variant="outline">Manage Tickets</Button>
// //             <Button>
// //               <Plus className="mr-2 h-4 w-4" />
// //               New Ticket
// //             </Button>
// //           </div>
// //         </CardHeader>

// //         <CardContent>
// //           <div className="overflow-x-auto rounded-xl border">
// //             <Table>
// //               <TableHeader>
// //                 <TableRow>
// //                   <TableHead className="w-[120px]">Ticket ID</TableHead>
// //                   <TableHead>Title</TableHead>
// //                   <TableHead className="w-[140px]">Category</TableHead>
// //                   <TableHead className="w-[120px]">Priority</TableHead>
// //                   <TableHead className="w-[140px]">Status</TableHead>
// //                   <TableHead className="w-[130px]">Created</TableHead>
// //                 </TableRow>
// //               </TableHeader>

// //               <TableBody>
// //                 {latestTickets.map((t) => (
// //                   <TableRow key={t.id}>
// //                     <TableCell className="font-medium">{t.id}</TableCell>
// //                     <TableCell className="min-w-[320px]">{t.title}</TableCell>
// //                     <TableCell>{t.category}</TableCell>
// //                     <TableCell><PriorityBadge priority={t.priority} /></TableCell>
// //                     <TableCell><StatusBadge status={t.status} /></TableCell>
// //                     <TableCell className="text-muted-foreground">{t.createdAt}</TableCell>
// //                   </TableRow>
// //                 ))}
// //               </TableBody>
// //             </Table>
// //           </div>
// //         </CardContent>
// //       </Card>

// //       {/* Add some height to test scroll navbar behavior */}
// //       <div className="h-20" />
// //     </div>
// //   );
// // }



// // VERSION T1

// "use client";

// import * as React from "react";

// import { Button } from "@/components/ui/button";
// import { Separator } from "@/components/ui/separator";
// import { Badge } from "@/components/ui/badge";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";

// import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// import {
//   ResponsiveContainer,
//   LineChart,
//   CartesianGrid,
//   XAxis,
//   YAxis,
//   Tooltip,
//   Line,
//   PieChart,
//   Pie,
//   Cell,
//   Legend,
// } from "recharts";

// import {
//   Activity,
//   AlertTriangle,
//   Wrench,
//   Cpu,
//   Plus,
//   FileText,
//   RefreshCw,
//   ArrowUpRight,
// } from "lucide-react";

// type AlertItem = {
//   id: string;
//   severity: "Critical" | "Warning" | "Info";
//   asset: string;
//   message: string;
//   time: string;
// };

// type TicketItem = {
//   id: string;
//   title: string;
//   category: string;
//   priority: "High" | "Medium" | "Low";
//   status: "Open" | "In Progress" | "Resolved";
//   createdAt: string;
// };

// const kpis = [
//   { label: "Total Assets", value: "128", sub: "+4 this month", icon: Activity },
//   {
//     label: "Critical Alerts",
//     value: "7",
//     sub: "Needs immediate action",
//     icon: AlertTriangle,
//   },
//   { label: "Open Tickets", value: "23", sub: "6 high priority", icon: Wrench },
//   { label: "Model Health", value: "92%", sub: "Avg. confidence", icon: Cpu },
// ] as const;

// const downtimeTrend = [
//   { name: "Mon", minutes: 18 },
//   { name: "Tue", minutes: 10 },
//   { name: "Wed", minutes: 25 },
//   { name: "Thu", minutes: 14 },
//   { name: "Fri", minutes: 9 },
//   { name: "Sat", minutes: 6 },
//   { name: "Sun", minutes: 12 },
// ];

// const healthDistribution = [
//   { name: "Healthy", value: 86 },
//   { name: "Warning", value: 30 },
//   { name: "Critical", value: 12 },
// ];

// const PIE_COLORS = ["#6366f1", "#8b8fa3", "#ef4444"];

// const recentAlerts: AlertItem[] = [
//   {
//     id: "AL-1007",
//     severity: "Critical",
//     asset: "Compressor A-14",
//     message: "Vibration exceeded threshold (RMS 12.3 mm/s).",
//     time: "10 mins ago",
//   },
//   {
//     id: "AL-1006",
//     severity: "Warning",
//     asset: "Pump P-09",
//     message: "Temperature rising trend detected (last 3 hours).",
//     time: "34 mins ago",
//   },
//   {
//     id: "AL-1005",
//     severity: "Info",
//     asset: "Motor M-02",
//     message: "Maintenance window scheduled for tomorrow.",
//     time: "2 hrs ago",
//   },
// ];

// const latestTickets: TicketItem[] = [
//   {
//     id: "TCK-2301",
//     title: "Abnormal vibration on Compressor A-14",
//     category: "Mechanical",
//     priority: "High",
//     status: "Open",
//     createdAt: "2026-01-05",
//   },
//   {
//     id: "TCK-2297",
//     title: "Oil leak suspected near Pump P-09",
//     category: "Maintenance",
//     priority: "Medium",
//     status: "In Progress",
//     createdAt: "2026-01-04",
//   },
//   {
//     id: "TCK-2293",
//     title: "Sensor drift on Motor M-02",
//     category: "Sensors",
//     priority: "Low",
//     status: "Resolved",
//     createdAt: "2026-01-03",
//   },
// ];

// function SeverityBadge({ severity }: { severity: AlertItem["severity"] }) {
//   if (severity === "Critical")
//     return <Badge variant="destructive">Critical</Badge>;
//   if (severity === "Warning")
//     return <Badge variant="secondary">Warning</Badge>;
//   return <Badge variant="outline">Info</Badge>;
// }

// function PriorityBadge({ priority }: { priority: TicketItem["priority"] }) {
//   if (priority === "High") return <Badge variant="destructive">High</Badge>;
//   if (priority === "Medium") return <Badge variant="secondary">Medium</Badge>;
//   return <Badge variant="outline">Low</Badge>;
// }

// function StatusBadge({ status }: { status: TicketItem["status"] }) {
//   if (status === "Resolved") return <Badge variant="outline">Resolved</Badge>;
//   if (status === "In Progress")
//     return <Badge variant="secondary">In Progress</Badge>;
//   return <Badge variant="destructive">Open</Badge>;
// }

// export default function AdminDashboardPage() {
//   const [refreshing, setRefreshing] = React.useState(false);

//   async function onRefresh() {
//     setRefreshing(true);
//     await new Promise((r) => setTimeout(r, 700));
//     setRefreshing(false);
//   }

//   return (
//     <div className="w-full space-y-6">
//       <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//         <div>
//           <h1 className="text-3xl font-semibold tracking-tight">
//             Admin Dashboard
//           </h1>
//           <p className="text-sm text-muted-foreground">
//             Overview of assets, alerts, tickets, and predictive signals.
//           </p>
//         </div>

//         <div className="flex flex-wrap items-center gap-2">
//           <Button variant="outline" onClick={onRefresh} disabled={refreshing}>
//             <RefreshCw
//               className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
//             />
//             Refresh
//           </Button>

//           <Button>
//             <Plus className="mr-2 h-4 w-4" />
//             Add Asset
//           </Button>

//           <Button variant="secondary">
//             <FileText className="mr-2 h-4 w-4" />
//             Generate Report
//           </Button>
//         </div>
//       </div>

//       <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
//         {kpis.map((k) => (
//           <Card key={k.label} className="rounded-2xl">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium text-muted-foreground">
//                 {k.label}
//               </CardTitle>
//               <k.icon className="h-6 w-6 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-semibold">{k.value}</div>
//               <p className="mt-1 text-xs text-muted-foreground">{k.sub}</p>
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       <div className="grid gap-4 lg:grid-cols-3">
//         <Card className="rounded-2xl lg:col-span-2">
//           <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
//             <div>
//               <CardTitle>Operational Trend</CardTitle>
//               <p className="text-sm text-muted-foreground">
//                 Weekly downtime minutes (sample)
//               </p>
//             </div>

//             <Tabs defaultValue="downtime" className="w-full sm:w-auto">
//               <TabsList className="grid w-full grid-cols-2 sm:w-[240px]">
//                 <TabsTrigger value="downtime">Downtime</TabsTrigger>
//                 <TabsTrigger value="health">Health Split</TabsTrigger>
//               </TabsList>

//               <TabsContent value="downtime" className="mt-3">
//                 <div className="h-[260px] w-full">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <LineChart
//                       data={downtimeTrend}
//                       margin={{ top: 10, right: 16, left: -8, bottom: 0 }}
//                     >
//                       <CartesianGrid strokeDasharray="3 3" />
//                       <XAxis dataKey="name" />
//                       <YAxis />
//                       <Tooltip />
//                       <Line
//                         type="monotone"
//                         dataKey="minutes"
//                         stroke="hsl(var(--primary))"
//                         strokeWidth={2}
//                         dot={false}
//                       />
//                     </LineChart>
//                   </ResponsiveContainer>
//                 </div>
//               </TabsContent>

//               <TabsContent value="health" className="mt-3">
//                 <div className="h-[260px] w-full">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <PieChart>
//                       <Pie
//                         data={healthDistribution}
//                         dataKey="value"
//                         nameKey="name"
//                         innerRadius={55}
//                         outerRadius={90}
//                         paddingAngle={4}
//                       >
//                         {healthDistribution.map((_, idx) => (
//                           <Cell
//                             key={idx}
//                             fill={PIE_COLORS[idx % PIE_COLORS.length]}
//                           />
//                         ))}
//                       </Pie>
//                       <Tooltip />
//                       <Legend />
//                     </PieChart>
//                   </ResponsiveContainer>
//                 </div>
//               </TabsContent>
//             </Tabs>
//           </CardHeader>
//         </Card>

//         <Card className="rounded-2xl">
//           <CardHeader>
//             <CardTitle className="flex items-center justify-between">
//               Recent Alerts
//               <Button variant="ghost" size="sm" className="gap-1">
//                 View all <ArrowUpRight className="h-4 w-4" />
//               </Button>
//             </CardTitle>
//             <p className="text-sm text-muted-foreground">
//               Latest detected events from asset monitoring.
//             </p>
//           </CardHeader>

//           <CardContent className="space-y-3">
//             {recentAlerts.map((a) => (
//               <div key={a.id} className="rounded-xl border p-3">
//                 <div className="flex items-center justify-between gap-2">
//                   <SeverityBadge severity={a.severity} />
//                   <span className="text-xs text-muted-foreground">{a.time}</span>
//                 </div>
//                 <div className="mt-2">
//                   <p className="text-sm font-medium">{a.asset}</p>
//                   <p className="mt-1 text-xs text-muted-foreground">
//                     {a.message}
//                   </p>
//                 </div>
//               </div>
//             ))}
//           </CardContent>
//         </Card>
//       </div>

//       <Card className="rounded-2xl">
//         <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
//           <div>
//             <CardTitle>Latest Tickets</CardTitle>
//             <p className="text-sm text-muted-foreground">
//               Monitor current issues and progress.
//             </p>
//           </div>
//           <div className="flex gap-2">
//             <Button variant="outline">Manage Tickets</Button>
//             <Button>
//               <Plus className="mr-2 h-4 w-4" />
//               New Ticket
//             </Button>
//           </div>
//         </CardHeader>

//         <CardContent>
//           <div className="overflow-x-auto rounded-xl border">
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead className="w-[120px]">Ticket ID</TableHead>
//                   <TableHead>Title</TableHead>
//                   <TableHead className="w-[140px]">Category</TableHead>
//                   <TableHead className="w-[120px]">Priority</TableHead>
//                   <TableHead className="w-[140px]">Status</TableHead>
//                   <TableHead className="w-[130px]">Created</TableHead>
//                 </TableRow>
//               </TableHeader>

//               <TableBody>
//                 {latestTickets.map((t) => (
//                   <TableRow key={t.id}>
//                     <TableCell className="font-medium">{t.id}</TableCell>
//                     <TableCell className="min-w-[320px]">
//                       {t.title}
//                     </TableCell>
//                     <TableCell>{t.category}</TableCell>
//                     <TableCell>
//                       <PriorityBadge priority={t.priority} />
//                     </TableCell>
//                     <TableCell>
//                       <StatusBadge status={t.status} />
//                     </TableCell>
//                     <TableCell className="text-muted-foreground">
//                       {t.createdAt}
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </div>
//         </CardContent>
//       </Card>

//       <div className="h-20" />
//     </div>
//   );
// }


// VERSION T2

"use client";

import StatCard from "@/components/admin/common/StatCard";
import SectionCard from "@/components/admin/common/SectionCard";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  AlertTriangle,
  Boxes,
  Ticket,
  TrendingUp,
  Warehouse,
} from "lucide-react";

const kpis = [
  { label: "Total Assets", value: "1,284", hint: "Across all warehouses", icon: <Boxes className="h-4 w-4" /> },
  { label: "High-Risk Assets", value: "37", hint: "Risk > 0.75", icon: <AlertTriangle className="h-4 w-4" /> },
  { label: "Predicted Failures (30d)", value: "12", hint: "Model forecast", icon: <TrendingUp className="h-4 w-4" /> },
  { label: "Active Tickets", value: "94", hint: "Open + In progress", icon: <Ticket className="h-4 w-4" /> },
  { label: "Critical Tickets", value: "9", hint: "Priority: Critical", icon: <AlertTriangle className="h-4 w-4" /> },
  { label: "Avg Health Score", value: "82%", hint: "Weighted average", icon: <Warehouse className="h-4 w-4" /> },
];

const alerts = [
  { title: "Forklift FL-22 risk increased", level: "High", meta: "Vibration spike • WH-A" },
  { title: "Overdue maintenance: Conveyor C-09", level: "Medium", meta: "5 days overdue • WH-B" },
  { title: "Critical ticket pending approval", level: "Critical", meta: "Hydraulic leak • WH-A" },
  { title: "Sensor missing readings detected", level: "Low", meta: "Temp sensor • WH-C" },
];

const highRiskAssets = [
  { name: "Forklift FL-22", wh: "Warehouse A", risk: "0.91", due: "2026-02-20" },
  { name: "Conveyor C-09", wh: "Warehouse B", risk: "0.86", due: "2026-02-16" },
  { name: "Palletizer P-03", wh: "Warehouse A", risk: "0.84", due: "2026-02-28" },
  { name: "Generator G-11", wh: "Warehouse C", risk: "0.81", due: "2026-03-03" },
  { name: "Cooling Unit CU-06", wh: "Warehouse B", risk: "0.78", due: "2026-02-25" },
];

const warehouseCompare = [
  { wh: "Warehouse A", avgHealth: "79%", riskAssets: 18, tickets: 41, estCost: "$6,250" },
  { wh: "Warehouse B", avgHealth: "83%", riskAssets: 12, tickets: 33, estCost: "$4,120" },
  { wh: "Warehouse C", avgHealth: "87%", riskAssets: 7, tickets: 20, estCost: "$2,980" },
];

function SeverityBadge({ level }: { level: string }) {
  const variant =
    level === "Critical" ? "destructive" : level === "High" ? "default" : "secondary";
  return <Badge variant={variant as any}>{level}</Badge>;
}

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Title row (optional, only if your topbar doesn't already show it) */}
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            System overview of assets, risks, tickets, and AI insights.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl">
            Export
          </Button>
          <Button className="rounded-xl">Generate Report</Button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-12 gap-6">
        {kpis.map((k) => (
          <div key={k.label} className="col-span-12 sm:col-span-6 lg:col-span-2">
            <StatCard label={k.label} value={k.value} hint={k.hint} icon={k.icon} />
          </div>
        ))}
      </div>

      {/* Trend + Alerts */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8">
          <SectionCard
            title="Asset Health Trend"
            right={
              <div className="flex items-center gap-2">
                <Button variant="outline" className="h-8 rounded-xl px-3 text-xs">7d</Button>
                <Button variant="outline" className="h-8 rounded-xl px-3 text-xs">30d</Button>
                <Button variant="outline" className="h-8 rounded-xl px-3 text-xs">90d</Button>
              </div>
            }
          >
            <Tabs defaultValue="health">
              <TabsList className="rounded-xl">
                <TabsTrigger value="health">Health Score</TabsTrigger>
                <TabsTrigger value="risk">Failure Probability</TabsTrigger>
                <TabsTrigger value="due">Maintenance Due</TabsTrigger>
              </TabsList>

              <TabsContent value="health" className="mt-4">
                <div className="h-65 rounded-2xl border bg-muted/20 p-4 text-sm text-muted-foreground">
                  Chart placeholder (Health trend)
                </div>
              </TabsContent>
              <TabsContent value="risk" className="mt-4">
                <div className="h-65 rounded-2xl border bg-muted/20 p-4 text-sm text-muted-foreground">
                  Chart placeholder (Risk trend)
                </div>
              </TabsContent>
              <TabsContent value="due" className="mt-4">
                <div className="h-65 rounded-2xl border bg-muted/20 p-4 text-sm text-muted-foreground">
                  Chart placeholder (Maintenance timeline)
                </div>
              </TabsContent>
            </Tabs>
          </SectionCard>
        </div>

        <div className="col-span-12 lg:col-span-4">
          <SectionCard
            title="Alerts & Attention"
            right={<Button variant="outline" className="h-8 rounded-xl px-3 text-xs">View all</Button>}
          >
            <div className="space-y-3">
              {alerts.map((a) => (
                <div key={a.title} className="rounded-2xl border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-sm font-medium">{a.title}</div>
                    <SeverityBadge level={a.level} />
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{a.meta}</div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Risk assets + Ticket overview */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-6">
          <SectionCard
            title="Top High-Risk Assets"
            right={<Button variant="outline" className="h-8 rounded-xl px-3 text-xs">Open Assets</Button>}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead className="text-right">Risk</TableHead>
                  <TableHead className="text-right">Next Maint.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {highRiskAssets.map((r) => (
                  <TableRow key={r.name}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell className="text-muted-foreground">{r.wh}</TableCell>
                    <TableCell className="text-right">
                      <Badge>{r.risk}</Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">{r.due}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </SectionCard>
        </div>

        <div className="col-span-12 lg:col-span-6">
          <SectionCard
            title="Ticket Overview"
            right={<Button variant="outline" className="h-8 rounded-xl px-3 text-xs">Open Tickets</Button>}
          >
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-5">
                <div className="h-55 rounded-2xl border bg-muted/20 p-4 text-sm text-muted-foreground">
                  Donut placeholder (Status)
                </div>
              </div>
              <div className="col-span-12 md:col-span-7">
                <div className="h-55 rounded-2xl border bg-muted/20 p-4 text-sm text-muted-foreground">
                  Bar placeholder (Category)
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Warehouse compare + AI */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8">
          <SectionCard
            title="Warehouse Comparison"
            right={<Button variant="outline" className="h-8 rounded-xl px-3 text-xs">Export</Button>}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Warehouse</TableHead>
                  <TableHead className="text-right">Avg Health</TableHead>
                  <TableHead className="text-right">Risk Assets</TableHead>
                  <TableHead className="text-right">Tickets</TableHead>
                  <TableHead className="text-right">Est. Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {warehouseCompare.map((w) => (
                  <TableRow key={w.wh}>
                    <TableCell className="font-medium">{w.wh}</TableCell>
                    <TableCell className="text-right">{w.avgHealth}</TableCell>
                    <TableCell className="text-right">{w.riskAssets}</TableCell>
                    <TableCell className="text-right">{w.tickets}</TableCell>
                    <TableCell className="text-right">{w.estCost}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </SectionCard>
        </div>

        <div className="col-span-12 lg:col-span-4">
          <SectionCard title="AI Insights">
            <div className="space-y-3">
              <div className="rounded-2xl border p-3">
                <div className="text-sm font-medium">Quick Reports</div>
                <div className="mt-3 flex flex-col gap-2">
                  <Button className="rounded-xl">Generate Warehouse Report</Button>
                  <Button variant="outline" className="rounded-xl">
                    Generate Asset Report
                  </Button>
                </div>
              </div>

              <div className="rounded-2xl border p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Latest Summary</div>
                  <Badge variant="secondary">Grounded: High</Badge>
                </div>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                  <li>Warehouse A risk rising due to forklift vibration anomalies.</li>
                  <li>Overdue maintenance increasing ticket backlog in Warehouse B.</li>
                  <li>7 assets missing sensor readings; predictions rely on logs only.</li>
                </ul>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
