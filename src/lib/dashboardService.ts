/**
 * Admin Dashboard Service
 *
 * Fetches the aggregated operations-dashboard payload from the backend.
 * Backed by a single endpoint: GET /admin-dashboard/summary
 * (JWT auto-attached via apiClient).
 */

import { apiGet } from "@/lib/apiClient";

export interface DashboardKpis {
  totalAssets: number;
  criticalAlerts: number;
  openTickets: number;
  highPriorityTickets: number;
  fleetHealth: number; // 0–100
  predictedFailures: number;
  estMaintenanceCost: number; // raw amount (LKR)
  /**
   * How many assets estMaintenanceCost is summed from. Below totalAssets means
   * the figure is a partial total and the UI labels it as one. Optional, so an
   * older backend that omits it is treated as fully covered.
   */
  estMaintenanceCostAssetCount?: number;
  // False for a brand-new warehouse with zero PdM predictions run yet —
  // distinguishes "no data" from a genuine (alarming) 0% fleet health.
  hasPredictionData: boolean;
}

// Chart-data rows carry an index signature so recharts accepts them directly.
export interface HealthTrendPoint {
  month: string; // e.g. "Jan"
  // null when no predictions were recorded that month (real gap, not 0%) —
  // recharts breaks the line there instead of drawing a false zero.
  avgHealth: number | null; // 0–100
  [key: string]: string | number | null;
}

export interface TicketTrendPoint {
  period: string; // e.g. "W18" or "Jan"
  opened: number;
  inProgress: number;
  resolved: number;
  [key: string]: string | number;
}

export interface HealthDistBucket {
  name: string; // e.g. "Excellent" | "90–100%"
  count: number;
  [key: string]: string | number;
}

/**
 * Maintenance spend for a month, split by whether the work was planned.
 *
 * Both figures are money already spent. The planned/unplanned split matches
 * the downtime chart, so the two charts read the same way.
 */
export interface CostTrendPoint {
  month: string;
  planned: number;   // raw amount (LKR)
  unplanned: number; // raw amount (LKR)
  [key: string]: string | number | null;
}

export interface DowntimePoint {
  warehouse: string;
  planned: number; // hours
  unplanned: number; // hours
  [key: string]: string | number;
}

export interface RiskAsset {
  id: string; // real asset UUID — use for navigation, not display
  code: string | null; // human-readable asset code (e.g. "SLW1288")
  name: string;
  location: string;
  healthScore: number; // 0–100
  failureProbability: number; // 0–1
  daysToMaintenance: number | null;
}

export type AlertSeverity = "critical" | "warning" | "info";

export interface DashboardAlert {
  id: string;
  severity: AlertSeverity;
  asset: string;
  location: string;
  message: string;
  createdAt: string | null; // ISO timestamp
}

export type TicketPriority = "critical" | "high" | "medium" | "low";
export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

export interface DashboardTicket {
  id: string; // human-readable ticket_number (display label, not a real id)
  ticketId: string; // real ticket UUID — use this to navigate/fetch
  title: string;
  asset: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo: string; // display name or "—"
}

export interface DashboardFooterStats {
  avgHealthScore: number; // 0–100
  ticketsResolved: number;
  avgResolutionDays: number;
}

export type InsightTone = "critical" | "warning" | "info" | "positive";

export interface DashboardInsight {
  tone: InsightTone;
  title: string;
  body: string;
}

export interface AdminDashboardData {
  kpis: DashboardKpis;
  healthTrend: HealthTrendPoint[];
  ticketTrend: TicketTrendPoint[];
  healthDistribution: HealthDistBucket[];
  costTrend: CostTrendPoint[];
  downtimeByWarehouse: DowntimePoint[];
  downtimeScope?: "warehouse" | "month";
  topRiskAssets: RiskAsset[];
  recentAlerts: DashboardAlert[];
  latestTickets: DashboardTicket[];
  footerStats: DashboardFooterStats;
  aiSummary: string | null;
  // False when aiSummary is the deterministic KPI-derived fallback string
  // rather than real LLM output — lets the UI avoid claiming
  // "AI-Generated / High confidence" for plain templated text.
  aiSummaryIsGenerated: boolean;
  aiInsights: DashboardInsight[];
}

export async function getAdminDashboard(): Promise<AdminDashboardData> {
  return apiGet<AdminDashboardData>("/admin-dashboard/summary");
}
