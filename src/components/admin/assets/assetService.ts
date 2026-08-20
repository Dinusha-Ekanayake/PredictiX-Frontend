/**
 * API calls for the admin assets section.
 *
 * Every request goes through apiClient, which attaches the JWT and throws
 * {@link ApiError} on a non-2xx response.
 */

import { apiGet, apiFetch, apiPost, apiPut, ApiError } from "@/lib/apiClient";
import type {
  Asset,
  AssetListItem,
  AssetStats,
  AssetAnalytics,
  AssetDetail,
  AssetFilters,
  BatchPrediction,
  MaintenanceEvent,
  Ticket,
  AssetAssignment,
  AssetSurvivalResponse,
  AssetUsageHistory,
} from "./types";

/** Fields accepted when creating or editing an asset. */
export interface AssetWritePayload {
  asset_code: string;
  asset_name: string;
  warehouse_id: string;
  department_id?: string | null;
  asset_type?: string;
  category?: string | null;
  vehicle_type?: string | null;
  make?: string | null;
  model?: string | null;
  manufacture_year?: number | null;
  registration_number?: string | null;
  vin?: string | null;
  status?: string;
  health_band?: string | null;
  description?: string | null;
}

/** Lightweight {id,name} options for warehouse/department selects. */
export interface IdNameOption {
  id: string;
  name: string;
}

/** Body for logging a completed service against an asset. */
export interface LogMaintenancePayload {
  title: string;
  description?: string;
  cost_amount: number;
  odometer_reading: number;
  next_service_date?: string;
  performed_at?: string;
  notes?: string;
}

export const ASSETS_PAGE_SIZE = 50;

/** Turn toolbar filters into query params, skipping any set to "all". */
function buildAssetListParams(filters: AssetFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.query) params.set("search", filters.query);
  if (filters.status && filters.status !== "all") params.set("status", filters.status);
  if (filters.health_band && filters.health_band !== "all")
    params.set("health_band", filters.health_band);
  if (filters.warehouse_id && filters.warehouse_id !== "all")
    params.set("warehouse_id", filters.warehouse_id);
  params.set("sort_by", filters.sort_by);
  params.set("sort_order", filters.sort_order);
  return params;
}

// Short-lived cache keyed by query string, so paging back and forth (or the
// filter effect re-firing after a save) reuses a response instead of refetching.
const LIST_CACHE_TTL_MS = 15_000;
const listCache = new Map<string, { data: AssetListItem[]; expires: number }>();
const countCache = new Map<string, { count: number; expires: number }>();

/** Invalidate cached list/count results (call after any create/update/delete). */
export function invalidateAssetListCache(): void {
  listCache.clear();
  countCache.clear();
}

/** Fetch one page of the trimmed asset list (AssetListOut on the backend). */
export async function listAssets(
  filters: AssetFilters,
  page = 1,
  pageSize = ASSETS_PAGE_SIZE,
): Promise<AssetListItem[]> {
  const params = buildAssetListParams(filters);
  params.set("limit", String(pageSize));
  params.set("offset", String((page - 1) * pageSize));
  const key = params.toString();

  const cached = listCache.get(key);
  if (cached && cached.expires > Date.now()) return cached.data;

  const data = await apiGet<AssetListItem[]>(`/assets/?${key}`);
  listCache.set(key, { data, expires: Date.now() + LIST_CACHE_TTL_MS });
  return data;
}

/** Total count of assets matching the current filters (for pagination controls). */
export async function countAssets(filters: AssetFilters): Promise<number> {
  const params = buildAssetListParams(filters);
  const key = params.toString();

  const cached = countCache.get(key);
  if (cached && cached.expires > Date.now()) return cached.count;

  const result = await apiGet<{ count: number }>(`/assets/count?${key}`);
  countCache.set(key, { count: result.count, expires: Date.now() + LIST_CACHE_TTL_MS });
  return result.count;
}

/** Fleet-wide summary counts, independent of which page is currently shown. */
export async function getAssetStats(): Promise<AssetStats> {
  return apiGet<AssetStats>(`/assets/stats`);
}

/** Fleet-wide descriptive analytics (status/health/type distributions + top
 * at-risk assets), independent of which page is currently shown. */
export async function getAssetAnalytics(): Promise<AssetAnalytics> {
  return apiGet<AssetAnalytics>(`/assets/analytics`);
}

/** Fetch one asset in full. */
export async function getAsset(assetId: string): Promise<Asset> {
  return apiGet<Asset>(`/assets/${assetId}`);
}

/** Fetch an asset's maintenance history. */
export async function getMaintenanceEvents(assetId: string): Promise<MaintenanceEvent[]> {
  return apiGet<MaintenanceEvent[]>(`/maintenance/?asset_id=${assetId}`);
}

/** Fetch tickets raised against an asset (capped at 100). */
export async function getAssetTickets(assetId: string): Promise<Ticket[]> {
  return apiGet<Ticket[]>(`/tickets/?asset_id=${assetId}&limit=100`);
}

/** Fetch the assignment history for an asset. */
export async function getAssetAssignments(assetId: string): Promise<AssetAssignment[]> {
  return apiGet<AssetAssignment[]>(`/asset-assignments/?asset_id=${assetId}`);
}

/**
 * Fetch an asset's latest PdM prediction, or null if it has none.
 *
 * Returns null if it fails, so one bad fetch cannot blank the detail panel.
 * A 404 just means the asset has not been scored yet; anything else is logged.
 */
export async function getBatchPrediction(assetId: string): Promise<BatchPrediction | null> {
  try {
    return await apiGet<BatchPrediction>(`/batch-predictions/${assetId}`);
  } catch (e) {
    if (!(e instanceof ApiError) || e.status !== 404) {
      console.error(`Failed to load batch prediction for asset ${assetId}:`, e);
    }
    return null;
  }
}

/**
 * Fetch per-component remaining-life forecasts over a 180-day horizon.
 *
 * Returns null on failure, same as {@link getBatchPrediction}.
 */
export async function getComponentRul(assetId: string): Promise<AssetSurvivalResponse | null> {
  try {
    return await apiGet<AssetSurvivalResponse>(`/survival/${assetId}?horizon_days=180&step_days=30`);
  } catch (e) {
    if (!(e instanceof ApiError) || e.status !== 404) {
      console.error(`Failed to load component survival for asset ${assetId}:`, e);
    }
    return null;
  }
}

/**
 * Fetch the asset's recorded monthly operating history.
 *
 * Returns null on failure, same as {@link getBatchPrediction}, so a missing
 * history hides the charts rather than failing the whole panel.
 */
export async function getUsageHistory(assetId: string): Promise<AssetUsageHistory | null> {
  try {
    return await apiGet<AssetUsageHistory>(`/assets/${assetId}/usage-history?months=24`);
  } catch (e) {
    if (!(e instanceof ApiError) || e.status !== 404) {
      console.error(`Failed to load usage history for asset ${assetId}:`, e);
    }
    return null;
  }
}

/**
 * Re-run the prediction pipeline for one asset and return the fresh result.
 *
 * Runs the same models as the nightly job and saves the result, so later reads
 * see the new values.
 */
export async function runVehiclePrediction(assetId: string): Promise<BatchPrediction> {
  const response = await apiFetch(`/batch-predictions/run/${assetId}`, {
    method: "POST",
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: "Prediction failed" }));
    throw new Error(err.detail || "Prediction failed");
  }
  return response.json() as Promise<BatchPrediction>;
}

/**
 * Load everything the detail panel needs, in parallel.
 *
 * The history calls fall back to empty arrays, so a missing ticket list still
 * lets the asset render. If the asset itself fails to load this throws, since
 * there is nothing to show without it.
 */
export async function getAssetDetail(assetId: string): Promise<AssetDetail> {
  const [asset, prediction, componentRul, usageHistory, maintenanceEvents, tickets, assignments] =
    await Promise.all([
      getAsset(assetId),
      getBatchPrediction(assetId),
      getComponentRul(assetId),
      getUsageHistory(assetId),
      getMaintenanceEvents(assetId).catch(() => [] as MaintenanceEvent[]),
      getAssetTickets(assetId).catch(() => [] as Ticket[]),
      getAssetAssignments(assetId).catch(() => [] as AssetAssignment[]),
    ]);

  return { asset, prediction, componentRul, usageHistory, maintenanceEvents, tickets, assignments };
}

/** Create an asset. Caller should invalidate the list cache afterwards. */
export async function createAsset(payload: AssetWritePayload): Promise<Asset> {
  return apiPost<Asset>("/assets/", payload);
}

/** Record a completed service; also advances the asset's service dates. */
export async function logMaintenance(assetId: string, payload: LogMaintenancePayload): Promise<MaintenanceEvent> {
  return apiPost<MaintenanceEvent>(`/maintenance/log-maintenance/${assetId}`, payload);
}

/** Upload a photo for an asset and return the updated asset. */
export async function uploadAssetImage(assetId: string, file: File): Promise<Asset> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiFetch(`/assets/${assetId}/image`, {
    method: "POST",
    body: formData,
    // Content-Type is left unset on purpose. The browser adds it along with
    // the multipart boundary, which we cannot write by hand.
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: "Upload failed" }));
    throw new Error(err.detail || "Image upload failed");
  }

  return response.json();
}

/** Update an asset. Omitted fields are left unchanged. */
export async function updateAsset(
  assetId: string,
  payload: Partial<AssetWritePayload>,
): Promise<Asset> {
  return apiPut<Asset>(`/assets/${assetId}`, payload);
}

/** Warehouse options for select inputs. */
export async function getWarehouseOptions(): Promise<IdNameOption[]> {
  const rows = await apiGet<Array<{ id: string; name: string }>>("/warehouses/");
  return rows.map((w) => ({ id: w.id, name: w.name }));
}

/** Department options for select inputs. */
export async function getDepartmentOptions(): Promise<IdNameOption[]> {
  const rows = await apiGet<Array<{ id: string; name: string }>>("/departments/");
  return rows.map((d) => ({ id: d.id, name: d.name }));
}

/** Change an asset's status (active, under_maintenance, decommissioned, ...). */
export async function updateAssetStatus(assetId: string, status: string): Promise<Asset> {
  const response = await apiFetch(`/assets/${assetId}/status?status=${status}`, {
    method: "PATCH",
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: "Update failed" }));
    throw new Error(err.detail || "Update failed");
  }
  return response.json();
}

// Asset PDFs are built client-side (src/lib/assetPdfExport.ts) rather than by
// the deprecated server-render endpoint, so there is no report call here.

/** Delete an asset. Caller should invalidate the list cache afterwards. */
export async function deleteAsset(assetId: string): Promise<void> {
  const response = await apiFetch(`/assets/${assetId}`, { method: "DELETE" });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: "Delete failed" }));
    throw new Error(err.detail || "Delete failed");
  }
}

/**
 * Health score (0 to 100) from an asset's prediction, or null if it has none.
 *
 * Null means the asset has not been scored yet. Callers should show a missing
 * state rather than substituting a number.
 */
export function deriveHealthScore(prediction: BatchPrediction | null): number | null {
  if (prediction?.health_score == null) return null;
  return Math.round(Number(prediction.health_score));
}

/** Failure probability (0 to 1), or 0 when the asset has no prediction. */
export function deriveFailureProbability(prediction: BatchPrediction | null): number {
  if (prediction?.failure_probability != null) return Number(prediction.failure_probability);
  return 0;
}