"use client";

import * as React from "react";
import AssetsSummary from "@/components/admin/assets/AssetsSummary";
import AssetsToolbar, { AssetFilters } from "@/components/admin/assets/AssetsToolbar";
import AssetsTable from "@/components/admin/assets/AssetsTable";
import AssetDetailsPanel from "@/components/admin/assets/AssetDetailsPanel";
import { Box, Loader2 } from "lucide-react";

// ── Map backend status → frontend status ──────────────────────────
function mapStatus(status: string): string {
  switch (status?.toLowerCase()) {
    case "active": return "OPERATIONAL";
    case "critical": return "CRITICAL";
    case "under_maintenance": return "MAINTENANCE";
    case "offline": return "OFFLINE";
    default: return (status ?? "OPERATIONAL").toUpperCase();
  }
}

// ── Map backend asset → frontend Asset shape ──────────────────────
function mapAsset(raw: any) {
  return {
    // Core identity
    id: raw.id,
    name: raw.asset_name ?? raw.asset_code ?? "—",
    code: raw.asset_code ?? "—",
    status: mapStatus(raw.status),
    description: raw.description ?? "—",

    // Type info
    assetType: raw.asset_type ?? "—",
    vehicleType: raw.vehicle_type ?? "—",
    category: raw.category ?? "—",
    make: raw.make ?? "—",
    model: raw.model ?? "—",
    makeModel: raw.make_model ?? "—",
    fuelType: raw.fuel_type ?? "—",
    transmission: raw.transmission ?? "—",

    // Location
    location: raw.location ?? "—",
    warehouse: {
      id: raw.warehouse_id ?? "unknown",
      name: raw.warehouse_name ?? "—",
    },
    department: {
      id: raw.department_id ?? "unknown",
      name: raw.department_name ?? "—",
    },

    // Person
    assignedPerson: raw.assigned_to
      ? { id: raw.assigned_to, name: raw.assigned_to }
      : null,

    // Health & predictions
    healthScore: raw.criticality_score ?? 0,
    healthBand: raw.health_band ?? "good",
    failureProbability8w: raw.failure_probability ?? 0,   // AssetDetailsPanel uses failureProbability8w
    predictionConfidence: raw.prediction_confidence ?? 0,

    // Dates
    lastMaintenanceDate: raw.last_service_date ?? "—",
    nextMaintenanceDate: raw.next_service_date ?? "—",
    scheduledMaintenanceDate: raw.scheduled_maintenance ?? "—",
    predictedMaintenanceDate: raw.predicted_maintenance_date ?? "—",
    purchaseDate: raw.purchase_date ?? null,
    warrantyExpiryDate: raw.warranty_expiry_date ?? null,

    // Cost
    estimatedCost: raw.estimated_cost ?? 0,
    costVariance30d: raw.cost_variance_30d ?? 0,

    // Stats
    currentMileage: raw.current_mileage ?? null,
    vehicleAgeYears: raw.vehicle_age_years ?? null,
    payloadCapacityKg: raw.payload_capacity_kg ?? null,
    lifetimeServiceCount: raw.lifetime_service_count ?? null,
    lifetimeBreakdownCount: raw.lifetime_breakdown_count ?? null,
    maintenancePriority: raw.maintenance_priority ?? null,

    // Arrays expected by AssetDetailsPanel tabs
    maintenanceLogs: [],   // fetched separately if needed
    assignmentHistory: [],
    auditTrail: [],
  };
}

function getHealthBand(score: number) {
  if (score >= 80) return "excellent";
  if (score >= 60) return "good";
  if (score >= 40) return "moderate";
  if (score >= 20) return "poor";
  return "critical";
}

function matchesQuery(asset: any, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [asset.id, asset.name, asset.code, asset.warehouse?.name, asset.category]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(q);
}

function applyFilters(assets: any[], filters: AssetFilters) {
  return assets.filter((asset) => {
    const queryMatch = matchesQuery(asset, filters.query);
    const statusMatch = filters.status === "all" || asset.status === filters.status;
    const healthMatch = filters.healthBand === "all" || getHealthBand(asset.healthScore ?? 0) === filters.healthBand;
    const warehouseMatch = filters.warehouse === "all" || asset.warehouse?.id === filters.warehouse;
    return queryMatch && statusMatch && healthMatch && warehouseMatch;
  });
}

export default function AdminAssetsPage() {
  const [assets, setAssets] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const [filters, setFilters] = React.useState<AssetFilters>({
    query: "",
    status: "all",
    healthBand: "all",
    warehouse: "all",
  });

  // ── Fetch real assets from backend ─────────────────────────────
  React.useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(true);
        const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
        const response = await fetch(`${API_URL}/assets/?limit=500`);
        if (!response.ok) throw new Error(`Failed to fetch assets: ${response.status}`);
        const data = await response.json();
        const raw = Array.isArray(data) ? data : (data.assets ?? data.data ?? []);
        const mapped = raw.map(mapAsset);
        setAssets(mapped);
        setSelectedId(mapped[0]?.id ?? null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAssets();
  }, []);

  const warehouseOptions = React.useMemo(() => {
    const seen = new Map<string, string>();
    assets.forEach((asset) => {
      if (asset.warehouse?.id && asset.warehouse?.name !== "—") {
        seen.set(asset.warehouse.id, asset.warehouse.name);
      }
    });
    return Array.from(seen.entries()).map(([value, label]) => ({ value, label }));
  }, [assets]);

  const filteredAssets = React.useMemo(
    () => applyFilters(assets, filters),
    [assets, filters]
  );

  React.useEffect(() => {
    if (!filteredAssets.length) { setSelectedId(null); return; }
    if (selectedId && filteredAssets.some((a) => a.id === selectedId)) return;
    setSelectedId(filteredAssets[0].id);
  }, [filteredAssets, selectedId]);

  const selectedAsset = React.useMemo(
    () => filteredAssets.find((a) => a.id === selectedId) ?? null,
    [filteredAssets, selectedId]
  );

  const handleAssetAdded = (newAsset: any) => {
    setAssets((prev) => [mapAsset(newAsset), ...prev]);
  };

  // ── Loading ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Loading assets...</span>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-center">
        <p className="text-sm font-medium text-destructive">Failed to load assets</p>
        <p className="mt-1 text-xs text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1.5 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Assets</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Monitor fleet health, maintenance state, and predictive insights
            across all warehouses.
          </p>
        </div>
      </div>

      <AssetsSummary assets={filteredAssets} />

      <AssetsToolbar
        filters={filters}
        setFilters={setFilters}
        resultsCount={filteredAssets.length}
        warehouseOptions={warehouseOptions}
        onAssetAdded={handleAssetAdded}
        selectedAssetId={selectedId}
      />

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 xl:col-span-5">
          <AssetsTable
            assets={filteredAssets}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>

        <div className="col-span-12 xl:col-span-7">
          {selectedAsset ? (
            <AssetDetailsPanel asset={selectedAsset} />
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-border/40 bg-card/80 px-6 py-20 text-center backdrop-blur-xl">
              <Box className="mb-4 h-12 w-12 text-muted-foreground/20" />
              <p className="text-sm font-medium text-muted-foreground">
                No asset selected
              </p>
              <p className="mt-1 text-[12px] text-muted-foreground/60">
                Select an asset from the list to view its details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}