/**
 * Warehouse Service
 * Handles all API calls to backend warehouse endpoints
 */

import { getAccessToken } from './authService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

/**
 * Build request headers with the auth token attached. The warehouse-dashboard
 * and survival endpoints require a valid JWT, so every call here must send it.
 */
function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getAccessToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export interface WarehouseSummaryData {
  kpiGrid?: any[];
  assetStatus?: any[];
  ticketPriority?: any[];
  ticketsByCategory?: any[];
  healthMaintenanceTrends?: any[];
  healthScoreDist?: any[];
  assetsByType?: any[];
  monthlyTicketVolume?: any[];
  criticalAssets?: any[];
  maintenanceSchedule?: any[];
}

/** FRSO survival analysis (Weibull AFT) for the warehouse dashboard. */
export interface SurvivalComponentSummary {
  component: string;
  avg_rul_days: number | null;
  /** mean P(component fails within 7 / 30 days) over the scored assets */
  avg_fail_prob_7d?: number;
  avg_fail_prob_30d?: number;
  /** sum of those probabilities — an expected failure count, not a headcount */
  expected_failures_7d: number;
  expected_failures_30d: number;
  /** count of scored assets whose component fails within 7 / 30 days */
  at_risk_7d: number;
  at_risk_30d: number;
  assets_scored: number;
}

export interface SurvivalWatchlistItem {
  asset: string;
  component: string;
  rul_days: number | null;
  risk: string;
}

/** Per-component failure risk for one asset (v3 warehouse report). */
export interface SurvivalAssetComponentRisk {
  fail_prob_7d: number;
  fail_prob_30d: number;
  median_days: number;
  health_pct: number | null;
}

/** One critical asset's 5-component breakdown + cost (v3 warehouse report). */
export interface SurvivalAssetBreakdown {
  asset: string;
  components: Record<string, SurvivalAssetComponentRisk>;
  soonest_component: string;
  soonest_median_days: number | null;
  p_service_7d: number;
  p_service_30d: number;
  est_cost_lkr: number | null;
  exp_cost_7d_lkr: number | null;
  exp_cost_30d_lkr: number | null;
}

export interface SurvivalSummary {
  assets_analyzed: number;
  horizon_days: number;
  currency?: string;
  /** expected fleet replacement spend within 7 / 30 days (cost-estimation model) */
  expected_spend_7d?: number;
  expected_spend_30d?: number;
  component_summary: SurvivalComponentSummary[];
  /** per-critical-asset 5-component risk + cost (drives the risk heatmap) */
  assets?: SurvivalAssetBreakdown[];
  watchlist: SurvivalWatchlistItem[];
  /** ISO-8601 UTC timestamp of when the analysis was scored (from the backend). */
  generated_at?: string;
}

/**
 * Fetch FRSO component survival analysis (Weibull AFT) from the backend.
 * Pure model inference — fast and not rate-limited (no LLM). Returns null if
 * the backend is unreachable or no survival data is available.
 */
export async function getSurvivalAnalysis(): Promise<SurvivalSummary | null> {
  try {
    const url = `${API_BASE_URL}/warehouse-dashboard/survival`;
    const response = await fetch(url, {
      method: 'GET',
      headers: authHeaders(),
      cache: 'no-store',
    });

    if (!response.ok) {
      console.warn(`[warehouseService] Survival API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const summary = data?.survival_summary;
    if (!summary) return null;
    // Carry the backend timestamp onto the summary for display.
    return { ...summary, generated_at: data.generated_at };
  } catch (error) {
    console.warn('[warehouseService] Survival analysis unavailable:', (error as Error).message);
    return null;
  }
}

/**
 * Fetch predictive maintenance schedule from PostgreSQL backend
 */
export async function getMaintenanceSchedule() {
  try {
    const url = `${API_BASE_URL}/warehouse-dashboard/maintenance-schedule`;

    const response = await fetch(url, {
      method: 'GET',
      headers: authHeaders(),
      cache: 'no-store',
    });

    if (!response.ok) {
      console.warn(`[DEBUG] Maintenance schedule API error: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // Backend unreachable — expected when server is not running
    console.warn('[warehouseService] Maintenance schedule unavailable:', (error as Error).message);
    return [];
  }
}

/**
 * Fetch warehouse dashboard summary from PostgreSQL backend
 */
export async function getWarehouseSummary(): Promise<WarehouseSummaryData> {
  try {
    const url = `${API_BASE_URL}/warehouse-dashboard/summary`;

    const response = await fetch(url, {
      method: 'GET',
      headers: authHeaders(),
      cache: 'no-store', // Disable caching for fresh data
    });

    if (!response.ok) {
      console.error(`[ERROR] Warehouse API error: ${response.status}`);
      throw new Error(`Failed to fetch warehouse summary: ${response.statusText}`);
    }

    const data = await response.json();

    // Fetch maintenance schedule separately and include it
    const maintenanceSchedule = await getMaintenanceSchedule();

    const result = {
      ...data,
      maintenanceSchedule,
    };

    return result;
  } catch (error) {
    console.error('[ERROR] Failed to fetch warehouse summary:', error);
    throw error;
  }
}

/**
 * Fetch fleet-level FRSO survival summary (per-component RUL + watchlist)
 * from the backend GET /survival/warehouse/summary endpoint.
 */
export async function getFleetSurvival(maxAssets = 12, horizonDays = 180) {
  try {
    const url = `${API_BASE_URL}/survival/warehouse/summary?max_assets=${maxAssets}&horizon_days=${horizonDays}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: authHeaders(),
      cache: 'no-store',
    });

    if (!response.ok) {
      console.warn(`[warehouseService] Fleet survival error: ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.warn('[warehouseService] Fleet survival unavailable:', (error as Error).message);
    return null;
  }
}
