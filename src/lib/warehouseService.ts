/**
 * Warehouse Service
 * Handles all API calls to backend warehouse endpoints connected to PostgreSQL
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export interface MaintenanceScheduleItem {
  asset: string;
  predicted: number;
  scheduled: number;
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
  maintenanceSchedule?: MaintenanceScheduleItem[];
}

/**
 * Fetch predictive maintenance schedule from PostgreSQL
 */
export async function getMaintenanceSchedule(): Promise<MaintenanceScheduleItem[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/warehouse-dashboard/maintenance-schedule`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      console.warn(`Maintenance schedule API error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching maintenance schedule:', error);
    return [];
  }
}

/**
 * Fetch warehouse dashboard summary from PostgreSQL backend
 */
export async function getWarehouseSummary(): Promise<WarehouseSummaryData> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/warehouse-dashboard/summary`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // Disable caching for fresh data
      }
    );

    if (!response.ok) {
      console.error(`Warehouse API error: ${response.status}`);
      throw new Error(`Failed to fetch warehouse summary: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Fetch maintenance schedule separately
    const maintenanceSchedule = await getMaintenanceSchedule();
    
    return {
      ...data,
      maintenanceSchedule,
    };
  } catch (error) {
    console.error('Error fetching warehouse summary:', error);
    throw error;
  }
}

/**
 * Fetch critical assets for warehouse table
 */
export async function getCriticalAssets() {
  try {
    const response = await fetch(
      `${API_BASE_URL}/assets/?status=at_risk`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch critical assets: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching critical assets:', error);
    return [];
  }
}
