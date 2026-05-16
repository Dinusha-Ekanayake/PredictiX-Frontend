// export type AssetStatus = "OPERATIONAL" | "MAINTENANCE" | "CRITICAL" | "OFFLINE";

// export type MaintenanceLog = {
//   id: string;
//   date: string; // ISO
//   type: "PREVENTIVE" | "CORRECTIVE" | "INSPECTION";
//   notes: string;
//   performedBy: { id: string; name: string } | null;
//   cost: number;
// };

// export type AssignmentEvent = {
//   id: string;
//   date: string;
//   action: "ASSIGNED" | "UNASSIGNED" | "REASSIGNED";
//   user: { id: string; name: string } | null;
//   byAdmin: { id: string; name: string } | null;
// };

// export type AssetAuditEvent = {
//   id: string;
//   date: string;
//   field: string;
//   oldValue: string;
//   newValue: string;
//   by: { id: string; name: string } | null;
// };

// export type Asset = {
//   id: string; // asset id
//   name: string;
//   description: string;
//   images: string[]; // urls (can be empty)
//   status: AssetStatus;

//   healthScore: number; // 0-100
//   failureProbability8w: number; // 0-1
//   predictionConfidence: number; // 0-1

//   warehouse: { id: string; name: string };
//   location: string; // e.g. "Aisle 2 / Rack 4"
//   assignedPerson: { id: string; name: string } | null;

//   lastMaintenanceDate: string | null;
//   nextMaintenanceDate: string | null;

//   scheduledMaintenanceDate: string | null;
//   predictedMaintenanceDate: string | null;

//   estimatedCost: number;
//   costVariance30d: number; // +/- percentage (e.g. 0.12 = +12%)

//   maintenanceLogs: MaintenanceLog[];
//   assignmentHistory: AssignmentEvent[];
//   auditTrail: AssetAuditEvent[];
// };


export type AssetStatus = "OPERATIONAL" | "MAINTENANCE" | "CRITICAL" | "OFFLINE";

export type MaintenanceLog = {
  id: string;
  date: string;
  type: "PREVENTIVE" | "CORRECTIVE" | "INSPECTION";
  notes: string;
  performedBy: { id: string; name: string } | null;
  cost: number;
};

export type AssignmentEvent = {
  id: string;
  date: string;
  action: "ASSIGNED" | "UNASSIGNED" | "REASSIGNED";
  user: { id: string; name: string } | null;
  byAdmin: { id: string; name: string } | null;
};

export type AssetAuditEvent = {
  id: string;
  date: string;
  field: string;
  oldValue: string;
  newValue: string;
  by: { id: string; name: string } | null;
};

export type Asset = {
  id: string;
  name: string;
  description: string;
  images: string[];
  status: AssetStatus;

  healthScore: number;          // 0–100
  failureProbability8w: number; // 0–1
  predictionConfidence: number; // 0–1

  warehouse: { id: string; name: string };
  location: string;
  assignedPerson: { id: string; name: string } | null;

  lastMaintenanceDate: string | null;
  nextMaintenanceDate: string | null;

  scheduledMaintenanceDate: string | null;
  predictedMaintenanceDate: string | null;

  estimatedCost: number;
  costVariance30d: number;

  maintenanceLogs: MaintenanceLog[];
  assignmentHistory: AssignmentEvent[];
  auditTrail: AssetAuditEvent[];
};