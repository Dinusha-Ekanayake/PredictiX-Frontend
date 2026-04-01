export type AssetStatus =
  | "active"
  | "inactive"
  | "under_maintenance"
  | "critical"
  | "decommissioned";

export type AssetHealthBand =
  | "excellent"
  | "good"
  | "moderate"
  | "poor"
  | "critical";

export type MaintenanceEventType =
  | "inspection"
  | "scheduled_service"
  | "preventive"
  | "corrective"
  | "repair"
  | "replacement"
  | "breakdown"
  | "other";

export type WarehouseRef = {
  id: string;
  code: string;
  name: string;
};

export type UserRef = {
  id: string;
  name: string;
  email?: string | null;
};

export type MaintenanceEvent = {
  id: string;
  eventType: MaintenanceEventType;
  title: string;
  description?: string | null;
  scheduledDate?: string | null;
  performedAt?: string | null;
  performedBy?: UserRef | null;
  odometerReading?: number | null;
  downtimeHours?: number | null;
  costAmount?: number | null;
  currency?: string;
  vendorName?: string | null;
  notes?: string | null;
};

export type AssetAuditEvent = {
  id: string;
  field: string;
  oldValue: string | null;
  newValue: string | null;
  changedBy?: UserRef | null;
  createdAt: string;
  reason?: string | null;
};

export type AssignmentEvent = {
  id: string;
  user?: UserRef | null;
  assignedBy?: UserRef | null;
  assignedAt: string;
  unassignedAt?: string | null;
  isActive: boolean;
  notes?: string | null;
};

export type AssetPrediction = {
  healthScore?: number | null;
  failureProbability?: number | null;
  confidence?: number | null;
  predictedMaintenanceDate?: string | null;
  daysUntilMaintenance?: number | null;
  estimatedCost?: number | null;
  minCost?: number | null;
  maxCost?: number | null;
  currency?: string;
  topExplanations?: string[];
};

export type AssetRecord = {
  id: string;
  assetCode: string;
  assetName: string;
  assetType: string;
  category?: string | null;
  vehicleType?: string | null;
  make?: string | null;
  model?: string | null;
  manufactureYear?: number | null;
  registrationNumber?: string | null;
  vin?: string | null;

  status: AssetStatus;
  healthBand?: AssetHealthBand | null;
  criticalityScore?: number | null;

  warehouse: WarehouseRef;
  assignedTo?: UserRef | null;

  currentMileage?: number | null;
  purchaseDate?: string | null;
  warrantyExpiryDate?: string | null;
  lastServiceDate?: string | null;
  nextServiceDate?: string | null;
  description?: string | null;

  vehicleRole?: string | null;
  makeModel?: string | null;
  fuelType?: string | null;
  transmission?: string | null;
  serviceProviderType?: string | null;
  payloadCapacityKg?: number | null;
  maintenancePriority?: string | null;
  vehicleAgeYears?: number | null;
  lifetimeServiceCount?: number | null;
  lifetimeBreakdownCount?: number | null;

  prediction?: AssetPrediction | null;

  maintenanceEvents: MaintenanceEvent[];
  assignmentHistory: AssignmentEvent[];
  auditTrail: AssetAuditEvent[];
};

export type AssetFilters = {
  query: string;
  status: AssetStatus | "all";
  healthBand: AssetHealthBand | "all";
  warehouse: string | "all";
};