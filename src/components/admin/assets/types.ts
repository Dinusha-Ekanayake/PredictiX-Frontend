// ─── Asset (from models.py Asset + AssetOut schema) ───────────────────────────
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
  status: string;                  // "active" | "inactive" | "retired" | "maintenance"
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
  // Custom metadata
  meta?: {
    image_url?: string; // Legacy
    images?: string[];
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
};

// ─── Failure Prediction (from AssetFailurePredictionOut) ───────────────────────
export type FailurePrediction = {
  id: string;
  run_id: string;
  asset_id: string;
  health_score: number | null;
  failure_probability: number | null;
  confidence: number | null;
  risk_level: string | null;
  predicted_maintenance_date: string | null;
  days_until_maintenance: number | null;
  top_explanations: Record<string, unknown> | null;
};

// ─── Cost Prediction (from AssetCostPredictionOut) ─────────────────────────────
export type CostPrediction = {
  id: string;
  run_id: string;
  asset_id: string;
  estimated_cost: number | null;
  min_cost: number | null;
  max_cost: number | null;
  currency: string | null;
  confidence_score: number | null;
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

// ─── Vehicle Prediction (full stored result) ───────────────────────────────────
export type VehiclePredictionResult = {
  run_id: string;
  asset_id: string;
  predicted_class: number;
  predicted_label: string;
  failure_probability: number;
  confidence: number;
  predicted_days_until_maintenance: number;
  predicted_maintenance_date: string;
  health_score: number;
  health_band: string;
  risk_level: string;
  estimated_cost_lkr: number;
  min_cost_lkr: number;
  max_cost_lkr: number;
  features_used: Record<string, unknown>;
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

// ─── Combined asset detail view (assembled in the service layer) ───────────────
export type AssetDetail = {
  asset: Asset;
  prediction: FailurePrediction | null;
  costPrediction: CostPrediction | null;
  survivalPrediction: AssetSurvivalResponse | null;
  maintenanceEvents: MaintenanceEvent[];
  tickets: Ticket[];
  assignments: AssetAssignment[];
};

// ─── Filter state used by the toolbar ─────────────────────────────────────────
export type AssetFilters = {
  query: string;
  status: string;        // "all" | actual status values
  health_band: string;   // "all" | "excellent" | "good" | "moderate" | "poor" | "critical"
  warehouse_id: string;  // "all" | warehouse UUID
};