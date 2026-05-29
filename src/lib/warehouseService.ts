/**
 * Warehouse Service
 * Handles all API calls to backend warehouse endpoints
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

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

/**
 * Fetch predictive maintenance schedule from PostgreSQL backend
 */
export async function getMaintenanceSchedule() {
  try {
    const url = `${API_BASE_URL}/warehouse-dashboard/maintenance-schedule`;
    console.log('[DEBUG] Fetching maintenance schedule from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.warn(`[DEBUG] Maintenance schedule API error: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    console.log('[DEBUG] Maintenance schedule data received:', data);
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
    console.log('[DEBUG] Fetching warehouse summary from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Disable caching for fresh data
    });

    if (!response.ok) {
      console.error(`[ERROR] Warehouse API error: ${response.status}`);
      throw new Error(`Failed to fetch warehouse summary: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('[DEBUG] Warehouse summary data received:', data);
    
    // Fetch maintenance schedule separately and include it
    const maintenanceSchedule = await getMaintenanceSchedule();
    console.log('[DEBUG] Merging maintenance schedule with summary data');
    
    const result = {
      ...data,
      maintenanceSchedule,
    };
    
    console.log('[DEBUG] Final warehouse summary with maintenance schedule:', result);
    return result;
  } catch (error) {
    console.error('[ERROR] Failed to fetch warehouse summary:', error);
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
