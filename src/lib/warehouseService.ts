/**
 * Warehouse Service
 * Handles all API calls to backend warehouse endpoints
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

/** Generic chart data point — keys vary per chart (name/value/count/etc.). */
export type ChartDatum = Record<string, string | number | null | undefined>;

/** A single predictive-maintenance schedule row. */
export interface MaintenanceScheduleItem {
  asset?: string;
  predicted?: number;
  scheduled?: number;
  [key: string]: string | number | null | undefined;
}

export interface WarehouseSummaryData {
  kpis?: ChartDatum[];
  kpiGrid?: ChartDatum[];
  assetStatus?: ChartDatum[];
  ticketPriority?: ChartDatum[];
  ticketsByCategory?: ChartDatum[];
  healthMaintenanceTrends?: ChartDatum[];
  healthScoreDist?: ChartDatum[];
  assetsByType?: ChartDatum[];
  monthlyTicketVolume?: ChartDatum[];
  criticalAssets?: ChartDatum[];
  maintenanceSchedule?: MaintenanceScheduleItem[];
}

/**
 * Fetch predictive maintenance schedule from PostgreSQL backend
 */
export async function getMaintenanceSchedule(): Promise<MaintenanceScheduleItem[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/warehouse-dashboard/maintenance-schedule`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.warn(`Maintenance schedule API error: ${response.status} ${response.statusText}`);
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch maintenance schedule:', error);
    return [];
  }
}

/**
 * Fetch warehouse dashboard summary from PostgreSQL backend
 */
export async function getWarehouseSummary(): Promise<WarehouseSummaryData> {
  const response = await fetch(`${API_BASE_URL}/warehouse-dashboard/summary`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store', // Disable caching for fresh data
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch warehouse summary: ${response.statusText}`);
  }

  const data = await response.json();

  // Fetch maintenance schedule separately and include it
  const maintenanceSchedule = await getMaintenanceSchedule();

  return {
    ...data,
    maintenanceSchedule,
  };
}

/**
 * Fetch critical assets for warehouse table
 */
export async function getCriticalAssets(): Promise<ChartDatum[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/assets/?status=at_risk`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch critical assets: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching critical assets:', error);
    return [];
  }
}
