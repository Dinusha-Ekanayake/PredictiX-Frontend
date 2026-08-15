/**
 * One row in the assets list, as returned by `GET /assets/`.
 *
 * A smaller version of {@link Asset}. The list can show ~1000 rows, so the
 * endpoint sends only the columns the table and filters actually use.
 */
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

/** Headline counts for the assets summary cards, scoped to the caller's warehouse. */
export type AssetStats = {
  total: number;
  operational: number;
  maintenance: number;
  critical: number;
  offline: number;
  /** Mean health score, or null when no asset in scope has been scored yet. */
  avgHealth: number | null;
  /** How many of `total` assets `avgHealth` is averaged over. */
  avgHealthScoredCount: number;
};

/** Counts already grouped by the backend, ready for the analytics charts. */
export type AssetAnalytics = {
  statusDistribution: { name: string; value: number }[];
  healthDistribution: { name: string; value: number }[];
  vehicleTypeDistribution: { name: string; value: number }[];
  /** Lowest-health assets, for the "needs attention" list. */
  topAtRisk: {
    id: string;
    asset_name: string;
    asset_code: string;
    health_band: string | null;
  }[];
};

/**
 * A single asset in full, as returned by `GET /assets/{id}`.
 *
 * Mirrors the backend `AssetOut` schema. Note it carries no `created_at` /
 * `updated_at`, because the endpoint does not return them.
 */
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
  /** Parking bay as `"<zone>-<bay>"` (e.g. `"A-012"`), unique per warehouse. */
  parking_slot: string | null;
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
  /** Free-form metadata. `image_url` is the legacy single-image field. */
  meta?: {
    image_url?: string;
    images?: string[];
    [key: string]: any;
  };
};

/** Overall result for an asset. `conflict` means the models disagreed. */
export type PredictionTier = "urgent" | "watch" | "healthy" | "conflict";

/** How sure the due date is, which decides how the UI words it. */
export type PredictionDisplayMode = "date" | "soft_estimate" | "horizon";

/**
 * An asset's current PdM state, from `GET /batch-predictions/{asset_id}`.
 *
 * Holds the classifier, regressor, health score and cost estimate, plus the
 * decision layer that combines them into one {@link PredictionTier}. The daily
 * job and the "Refresh now" button both write this same row, so it is the only
 * place the UI reads predictions from.
 */
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

  // Decision layer: combines the model outputs into one recommendation.
  model_version: string | null;
  tier: PredictionTier | null;
  agreement: boolean | null;
  display_mode: PredictionDisplayMode | null;
  horizon_text: string | null;
  recommended_action: string | null;
  horizon_saturated: boolean | null;
};

/** One completed or scheduled service against an asset. */
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

/** A maintenance ticket, optionally linked to an asset. */
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

/** A record of an asset being assigned to a user. Inactive once unassigned. */
export type AssetAssignment = {
  id: string;
  asset_id: string;
  user_id: string;
  assigned_by: string | null;
  assigned_at: string;
  unassigned_at: string | null;
  is_active: boolean;
  notes: string | null;
  /** Resolved by the API. Null when the referenced profile no longer exists. */
  user_name: string | null;
  user_email: string | null;
  assigned_by_name: string | null;
};

/** One point on a component's survival curve: probability it lasts to `day`. */
export type SurvivalCurvePoint = {
  day: number;
  survival_prob: number;
};

/** Remaining-life forecast for one component, from the Weibull AFT model. */
export type ComponentSurvivalResponse = {
  asset_id: string;
  component: "brake" | "tire" | "battery" | "oil" | "hydraulic";
  health_pct: number | null;
  median_days: number;
  p10_days: number;
  p90_days: number;
  fail_prob_7d: number;
  fail_prob_30d: number;
  /**
   * True when the day counts hit the limit of what the model was trained on.
   * Read them as "further out than this", not as an exact number of days.
   */
  horizon_capped: boolean;
  curve: SurvivalCurvePoint[];
};

/** Sent instead of a forecast when one component could not be scored. */
export type ComponentSurvivalError = {
  component: "brake" | "tire" | "battery" | "oil" | "hydraulic";
  error: string;
};

/** Per-component remaining life for one asset, plus whichever fails soonest. */
export type AssetSurvivalResponse = {
  asset_id: string;
  horizon_days: number;
  step_days: number;
  soonest_component: "brake" | "tire" | "battery" | "oil" | "hydraulic" | null;
  soonest_median_days: number | null;
  components: (ComponentSurvivalResponse | ComponentSurvivalError)[];
};

/**
 * Everything the asset detail panel shows. The service layer fetches it from
 * several endpoints so the component only makes one call.
 */
export type AssetDetail = {
  asset: Asset;
  prediction: BatchPrediction | null;
  componentRul: AssetSurvivalResponse | null;
  maintenanceEvents: MaintenanceEvent[];
  tickets: Ticket[];
  assignments: AssetAssignment[];
};

/** Columns the list can be sorted by. Must match the keys the backend accepts. */
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

/** Current toolbar filter and sort state, sent as query params to `GET /assets/`. */
export type AssetFilters = {
  query: string;
  status: string;        // "all" | actual status values
  health_band: string;   // "all" | "excellent" | "good" | "moderate" | "poor" | "critical"
  warehouse_id: string;  // "all" | warehouse UUID
  sort_by: AssetSortBy;
  sort_order: "asc" | "desc";
};