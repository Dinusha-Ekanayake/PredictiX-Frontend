import type { Asset } from "./types";

export const ASSETS: Asset[] = [
  {
    id: "A-001",
    name: "Forklift FL-22",
    description: "Electric forklift used for pallet movement in Zone A.",
    images: [],
    status: "CRITICAL",

    healthScore: 68,
    failureProbability8w: 0.62,
    predictionConfidence: 0.84,

    warehouse: { id: "WH-A", name: "Warehouse A" },
    location: "Zone A • Aisle 2 • Bay 4",
    assignedPerson: { id: "U-14", name: "Sahan Silva" },

    lastMaintenanceDate: "2026-01-18",
    nextMaintenanceDate: "2026-02-20",

    scheduledMaintenanceDate: "2026-02-18",
    predictedMaintenanceDate: "2026-02-16",

    estimatedCost: 1250,
    costVariance30d: 0.18,

    maintenanceLogs: [
      {
        id: "ML-1",
        date: "2026-01-18",
        type: "CORRECTIVE",
        notes: "Replaced hydraulic seal, checked pressure.",
        performedBy: { id: "U-07", name: "Dinithi Jay" },
        cost: 980,
      },
      {
        id: "ML-2",
        date: "2025-12-05",
        type: "PREVENTIVE",
        notes: "Battery health check and lubrication.",
        performedBy: { id: "U-09", name: "Nimal Perera" },
        cost: 220,
      },
    ],
    assignmentHistory: [
      {
        id: "AH-1",
        date: "2025-11-20",
        action: "ASSIGNED",
        user: { id: "U-14", name: "Sahan Silva" },
        byAdmin: { id: "U-01", name: "Admin" },
      },
    ],
    auditTrail: [
      {
        id: "AT-1",
        date: "2026-02-10",
        field: "status",
        oldValue: "MAINTENANCE",
        newValue: "CRITICAL",
        by: { id: "U-01", name: "Admin" },
      },
    ],
  },

  {
    id: "A-002",
    name: "Conveyor C-09",
    description: "Main conveyor belt line for outbound sorting.",
    images: [],
    status: "MAINTENANCE",

    healthScore: 74,
    failureProbability8w: 0.41,
    predictionConfidence: 0.79,

    warehouse: { id: "WH-B", name: "Warehouse B" },
    location: "Outbound Line • Section 3",
    assignedPerson: null,

    lastMaintenanceDate: "2026-01-28",
    nextMaintenanceDate: "2026-02-22",

    scheduledMaintenanceDate: "2026-02-22",
    predictedMaintenanceDate: "2026-02-24",

    estimatedCost: 760,
    costVariance30d: -0.06,

    maintenanceLogs: [
      {
        id: "ML-3",
        date: "2026-01-28",
        type: "INSPECTION",
        notes: "Checked belt tension; minor wear detected.",
        performedBy: { id: "U-07", name: "Dinithi Jay" },
        cost: 120,
      },
    ],
    assignmentHistory: [],
    auditTrail: [],
  },

  {
    id: "A-003",
    name: "Generator G-11",
    description: "Backup generator for cold-storage power continuity.",
    images: [],
    status: "OPERATIONAL",

    healthScore: 88,
    failureProbability8w: 0.12,
    predictionConfidence: 0.86,

    warehouse: { id: "WH-C", name: "Warehouse C" },
    location: "Utility Room • North Wing",
    assignedPerson: { id: "U-22", name: "Kavindu Perera" },

    lastMaintenanceDate: "2026-01-12",
    nextMaintenanceDate: "2026-03-01",

    scheduledMaintenanceDate: "2026-03-01",
    predictedMaintenanceDate: "2026-03-04",

    estimatedCost: 540,
    costVariance30d: 0.03,

    maintenanceLogs: [],
    assignmentHistory: [],
    auditTrail: [],
  },
];
