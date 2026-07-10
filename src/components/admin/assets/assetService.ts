/**
 * Asset Service
 * All API calls for the admin assets section.
 * Uses apiGet / apiPost / apiPut / apiDelete from apiClient so JWT is auto-attached.
 */

import { apiGet, apiFetch, apiPost, apiPut } from "@/lib/apiClient";
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
  AssetComponentRulResponse,
} from "./types";

// ─── Create / update payloads ────────────────────────────────────────────────
// Mirrors the backend AssetCreate/AssetUpdate schema (editable subset).
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

// ─── Log Maintenance Payload ───────────────────────────────────────────────────
export interface LogMaintenancePayload {
  title: string;
  description?: string;
  cost_amount: number;
  odometer_reading: number;
  next_service_date?: string;
  performed_at?: string;
  notes?: string;
}

// ─── List / filter assets (paginated) ──────────────────────────────────────────

export const ASSETS_PAGE_SIZE = 50;

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

// ─── Short-TTL client-side cache ───────────────────────────────────────────────
// Paging back and forth (or the filter-effect re-firing after a delete/save
// refetch) would otherwise re-hit the network for data that's still fresh.
// A short TTL keeps the list feeling instant for that back-and-forth while
// staying safe against showing stale data for long.
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

// ─── Single asset ──────────────────────────────────────────────────────────────

export async function getAsset(assetId: string): Promise<Asset> {
  return apiGet<Asset>(`/assets/${assetId}`);
}

// ─── Maintenance events for an asset ──────────────────────────────────────────

export async function getMaintenanceEvents(assetId: string): Promise<MaintenanceEvent[]> {
  // The maintenance router lists by asset_id query param
  return apiGet<MaintenanceEvent[]>(`/maintenance/?asset_id=${assetId}`);
}

// ─── Tickets for an asset ──────────────────────────────────────────────────────

export async function getAssetTickets(assetId: string): Promise<Ticket[]> {
  return apiGet<Ticket[]>(`/tickets/?asset_id=${assetId}&limit=100`);
}

// ─── Asset assignments ─────────────────────────────────────────────────────────

export async function getAssetAssignments(assetId: string): Promise<AssetAssignment[]> {
  return apiGet<AssetAssignment[]>(`/asset-assignments/?asset_id=${assetId}`);
}

// ─── Latest PDM batch prediction for an asset ──────────────────────────────────
// Single source of truth for classifier + regressor + health-score + cost
// estimate + the decision layer (tier/agreement/horizon). Populated by the
// daily scheduler and by the manual "Refresh now" trigger — both write the
// same row via app.ai.services.batch_prediction_service, so this always
// reflects whichever run happened most recently, scheduled or manual.

export async function getBatchPrediction(assetId: string): Promise<BatchPrediction | null> {
  try {
    return await apiGet<BatchPrediction>(`/batch-predictions/${assetId}`);
  } catch {
    return null; // 404 means no prediction yet — not an error
  }
}

// ─── Component RUL for an asset (independent of the FRSO report models) ───────

export async function getComponentRul(assetId: string): Promise<AssetComponentRulResponse | null> {
  try {
    return await apiGet<AssetComponentRulResponse>(`/assets/${assetId}/component-rul`);
  } catch {
    return null;
  }
}

// ─── Run a fresh prediction for an asset now ───────────────────────────────────
// Triggers the same pipeline the daily scheduler runs (v7 models + decision
// layer) for just this asset and upserts pdm_batch_predictions, so the
// result is immediately visible via getBatchPrediction() afterward.

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

// ─── Load full asset detail (asset + predictions + maintenance + tickets + assignments) ──

export async function getAssetDetail(assetId: string): Promise<AssetDetail> {
  // Run all fetches in parallel for speed
  const [asset, prediction, componentRul, maintenanceEvents, tickets, assignments] =
    await Promise.all([
      getAsset(assetId),
      getBatchPrediction(assetId),
      getComponentRul(assetId),
      getMaintenanceEvents(assetId).catch(() => [] as MaintenanceEvent[]),
      getAssetTickets(assetId).catch(() => [] as Ticket[]),
      getAssetAssignments(assetId).catch(() => [] as AssetAssignment[]),
    ]);

  return { asset, prediction, componentRul, maintenanceEvents, tickets, assignments };
}

// ─── Create asset ────────────────────────────────────────────────────────────

export async function createAsset(payload: AssetWritePayload): Promise<Asset> {
  return apiPost<Asset>("/assets/", payload);
}

// ─── Log Maintenance ───────────────────────────────────────────────────────────

export async function logMaintenance(assetId: string, payload: LogMaintenancePayload): Promise<MaintenanceEvent> {
  return apiPost<MaintenanceEvent>(`/maintenance/log-maintenance/${assetId}`, payload);
}

// ─── Upload Asset Image ────────────────────────────────────────────────────────

export async function uploadAssetImage(assetId: string, file: File): Promise<Asset> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiFetch(`/assets/${assetId}/image`, {
    method: "POST",
    body: formData,
    // Note: Do NOT set Content-Type header manually for FormData, 
    // the browser will automatically set it with the boundary.
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: "Upload failed" }));
    throw new Error(err.detail || "Image upload failed");
  }

  return response.json();
}

// ─── Update asset (full edit) ──────────────────────────────────────────────────

export async function updateAsset(
  assetId: string,
  payload: Partial<AssetWritePayload>,
): Promise<Asset> {
  return apiPut<Asset>(`/assets/${assetId}`, payload);
}

// ─── Warehouse / department options (for select dropdowns) ─────────────────────

export async function getWarehouseOptions(): Promise<IdNameOption[]> {
  const rows = await apiGet<Array<{ id: string; name: string }>>("/warehouses/");
  return rows.map((w) => ({ id: w.id, name: w.name }));
}

export async function getDepartmentOptions(): Promise<IdNameOption[]> {
  const rows = await apiGet<Array<{ id: string; name: string }>>("/departments/");
  return rows.map((d) => ({ id: d.id, name: d.name }));
}

// ─── Update asset status ───────────────────────────────────────────────────────

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

// ─── Generate asset PDF report ────────────────────────────────────────────────

export async function generateAssetReport(assetId: string): Promise<void> {
  const response = await apiFetch(`/asset-reports/${assetId}`, { method: "POST" });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: "Report generation failed" }));
    throw new Error(err.detail || "Report generation failed");
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `asset-report-${assetId}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ─── Delete asset ──────────────────────────────────────────────────────────────

export async function deleteAsset(assetId: string): Promise<void> {
  const response = await apiFetch(`/assets/${assetId}`, { method: "DELETE" });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: "Delete failed" }));
    throw new Error(err.detail || "Delete failed");
  }
}

// ─── Derive health score (0–100) from health_band or criticality_score ─────────
// The real health_score comes from the prediction; fall back to band mapping.

export function deriveHealthScore(asset: Asset, prediction: BatchPrediction | null): number {
  if (prediction?.health_score != null) return Math.round(Number(prediction.health_score));

  const bandMap: Record<string, number> = {
    excellent: 90,
    good: 72,
    moderate: 52,
    poor: 30,
    critical: 12,
  };
  if (asset.health_band) return bandMap[asset.health_band.toLowerCase()] ?? 50;
  if (asset.criticality_score != null) {
    // criticality_score is 0–100, higher = worse → invert for health
    return Math.max(0, Math.min(100, Math.round(100 - Number(asset.criticality_score))));
  }
  return 50;
}

// ─── Derive failure probability ────────────────────────────────────────────────

export function deriveFailureProbability(prediction: BatchPrediction | null): number {
  if (prediction?.failure_probability != null) return Number(prediction.failure_probability);
  return 0;
}