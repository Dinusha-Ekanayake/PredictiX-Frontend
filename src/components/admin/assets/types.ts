// ─── AssetListItem (from AssetListOut — trimmed projection for the list view) ──
// GET /assets/ returns only these fields (not the full Asset below) so the
// list page doesn't transfer/parse 34 columns per row for ~1000+ rows.
export type AssetListItem = {
  id: string;
  asset_code: string;
  asset_name: string;
  asset_type: string;
  vehicle_type: string | null;
  make: string | null;
  model: string | null;
  manufacture_year: number | null;
  status: string;
  health_band: string | null;
  warehouse_id: string;
  meta?: {
    image_url?: string;
    images?: string[];
    [key: string]: any;
  };
};

export type AssetStats = {
  total: number;
  operational: number;
  maintenance: number;
  critical: number;
  offline: number;
  // null when no asset in scope has a completed PdM prediction yet — real
  // "no data" state, not a fabricated 0%/estimate.
  avgHealth: number | null;
  // How many of `total` assets avgHealth is actually averaged over.
  avgHealthScoredCount: number;
};

export type AssetAnalytics = {
  statusDistribution: { name: string; value: number }[];
  healthDistribution: { name: string; value: number }[];
  vehicleTypeDistribution: { name: string; value: number }[];
  topAtRisk: {
    id: string;
    asset_name: string;
    asset_code: string;
    health_band: string | null;
  }[];
};

// ─── Asset (from models.py Asset + AssetOut schema) ───────────────────────────
// Full shape — only returned by GET /assets/{id} (single-asset detail).
export type Asset = {
  id: string;
  asset_code: string;
  warehouse_id: string;
  department_id: string | null;
  asset_name: string;
  asset_type: string;
  category: string | null;
  vehicle_type: string | null;
  make: string | null;
  model: string | null;
  manufacture_year: number | null;
  registration_number: string | null;
  vin: string | null;
  status: string;                  // "active" | "inactive" | "under_maintenance" | "critical" | "decommissioned"
  health_band: string | null;      // "excellent" | "good" | "moderate" | "poor" | "critical"
  criticality_score: number | null;
  purchase_date: string | null;
  warranty_expiry_date: string | null;
  assigned_to: string | null;      // profile UUID
  current_mileage: number | null;
  last_service_date: string | null;
  next_service_date: string | null;
  description: string | null;
  vehicle_role: string | null;
  payload_capacity_kg: number | null;
  vehicle_age_years: number | null;
  lifetime_service_count: number | null;
  lifetime_breakdown_count: number | null;
  fuel_type: string | null;
  transmission: string | null;
  make_model: string | null;
  maintenance_priority: string | null;
  service_provider_type: string | null;
  // Custom metadata
  meta?: {
    image_url?: string; // Legacy
    images?: string[];
    [key: string]: any;
  };
  // NOTE: AssetOut (app/schemas/asset.py) does not return created_at/
  // updated_at — this type previously claimed both as always-present
  // strings, which nothing actually reads today, but which would have
  // been `undefined` at runtime for any code that started trusting them.
};

// ─── PDM Batch Prediction (from GET /batch-predictions/{asset_id}) ─────────────
// Single source of truth for an asset's PdM state: classifier + regressor +
// health score + cost estimate + the decision layer that reconciles them
// into one tier. Populated by the daily scheduler and by "Refresh now"
// (POST /batch-predictions/run/{asset_id}) — both write the same row, so
// there is exactly one place the UI reads predictions from.
export type PredictionTier = "urgent" | "watch" | "healthy" | "conflict";
export type PredictionDisplayMode = "date" | "soft_estimate" | "horizon";

export type BatchPrediction = {
  id: string;
  asset_id: string;
  failure_probability: number | null;
  maintenance_required: boolean | null;
  risk_level: string | null;
  predicted_days_until_maintenance: number | null;
  predicted_maintenance_date: string | null;
  health_score: number | null;
  health_status: string | null;
  contributing_factors: { feature: string; impact: number }[];
  estimated_cost_lkr: number | null;
  min_cost_lkr: number | null;
  max_cost_lkr: number | null;
  top_explanations: { feature: string; impact: number }[];
  predicted_at: string | null;
  run_duration_ms: number | null;
  status: string;
  error_message: string | null;
  // Decision layer (app.ai.services.pdm_decision_service.build_decision)
  model_version: string | null;
  tier: PredictionTier | null;
  agreement: boolean | null;
  display_mode: PredictionDisplayMode | null;
  horizon_text: string | null;
  recommended_action: string | null;
  horizon_saturated: boolean | null;
};

// ─── Maintenance Event (from MaintenanceEventOut) ──────────────────────────────
export type MaintenanceEvent = {
  id: string;
  asset_id: string;
  event_type: string;
  title: string;
  description: string | null;
  performed_by: string | null;
  scheduled_date: string | null;
  performed_at: string | null;
  odometer_reading: number | null;
  downtime_hours: number | null;
  cost_amount: number | null;
  currency: string;
  vendor_name: string | null;
  notes: string | null;
};

// ─── Ticket (from models.py Ticket) ───────────────────────────────────────────
export type Ticket = {
  id: string;
  ticket_number: string;
  asset_id: string | null;
  warehouse_id: string | null;
  title: string;
  description: string;
  status: string;         // "open" | "in_progress" | "resolved" | "closed"
  priority: string | null;
  predicted_priority: string | null;
  final_priority: string | null;
  predicted_category: string | null;
  final_category: string | null;
  ticket_summary: string | null;
  created_by: string;
  assigned_to: string | null;
  opened_at: string;
  resolved_at: string | null;
};

// ─── Asset Assignment (from AssetAssignmentOut) ────────────────────────────────
export type AssetAssignment = {
  id: string;
  asset_id: string;
  user_id: string;
  assigned_by: string | null;
  assigned_at: string;
  unassigned_at: string | null;
  is_active: boolean;
  notes: string | null;
};

// ─── Survival Prediction (FRSO) ────────────────────────────────────────────────
export type SurvivalCurvePoint = {
  day: number;
  survival_prob: number;
};

export type ComponentSurvivalResponse = {
  asset_id: string;
  component: "brake" | "tire" | "battery" | "oil" | "hydraulic";
  median_days: number;
  p10_days: number;
  p90_days: number;
  curve: SurvivalCurvePoint[];
};

export type ComponentSurvivalError = {
  component: "brake" | "tire" | "battery" | "oil" | "hydraulic";
  error: string;
};

export type AssetSurvivalResponse = {
  asset_id: string;
  horizon_days: number;
  step_days: number;
  soonest_component: "brake" | "tire" | "battery" | "oil" | "hydraulic" | null;
  soonest_median_days: number | null;
  components: (ComponentSurvivalResponse | ComponentSurvivalError)[];
};

// ─── Component RUL (asset-section, independent of the FRSO report models) ─────
// Grounded against the v7 regressor's whole-asset prediction — see
// app.ai.services.asset_component_rul_service._apply_model_grounding.
export type ComponentRulOut = {
  component: string;
  current_health_pct: number | null;
  degradation_pct_per_day: number | null;
  rul_days: number | null;
  rul_days_low: number | null;
  rul_days_high: number | null;
  estimated_failure_date: string | null;
  confidence: "trend" | "insufficient_trend" | "single_point" | "no_data" | "recently_serviced";
  readings_used: number;
  horizon_capped: boolean;
  model_corroborated: boolean;
  model_days_ceiling: number | null;
  disagrees_with_model: boolean;
  // True when a service-event jump was detected and this trend/RUL was
  // refit on only the readings since that jump.
  post_service: boolean;
};

export type AssetComponentRulResponse = {
  asset_id: string;
  components: ComponentRulOut[];
};

// ─── Combined asset detail view (assembled in the service layer) ───────────────
export type AssetDetail = {
  asset: Asset;
  prediction: BatchPrediction | null;
  componentRul: AssetComponentRulResponse | null;
  maintenanceEvents: MaintenanceEvent[];
  tickets: Ticket[];
  assignments: AssetAssignment[];
};

// ─── Filter state used by the toolbar ─────────────────────────────────────────
// sort_by matches GET /assets/'s sort_column_map exactly (app/routers/assets.py).
export type AssetSortBy =
  | "created_at"
  | "updated_at"
  | "asset_name"
  | "asset_code"
  | "status"
  | "vehicle_type"
  | "make"
  | "model"
  | "manufacture_year"
  | "current_mileage"
  | "criticality_score"
  | "payload_capacity_kg";

export type AssetFilters = {
  query: string;
  status: string;        // "all" | actual status values
  health_band: string;   // "all" | "excellent" | "good" | "moderate" | "poor" | "critical"
  warehouse_id: string;  // "all" | warehouse UUID
  sort_by: AssetSortBy;
  sort_order: "asc" | "desc";
};