"use client";

import * as React from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Box, MapPin, X } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AssetItem = {
  id: string;
  name: string;
  category: string;
  location: string;
  healthPercent: number;
};

type Props = {
  userName: string;
  assets: AssetItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When provided, shows a "Back to User Details" button. */
  onBackToDetails?: () => void;
};

// ---------------------------------------------------------------------------
// Mock asset data keyed by user ID
// ---------------------------------------------------------------------------

const MOCK_ASSETS: Record<string, AssetItem[]> = {
  "USR-001": [
    { id: "A-001", name: "Forklift Alpha-01", category: "Material Handling", location: "Warehouse A - Bay 3", healthPercent: 92 },
    { id: "A-002", name: "Conveyor Belt B-12", category: "Automation", location: "Warehouse A - Line 2", healthPercent: 68 },
    { id: "A-003", name: "Pallet Jack PJ-05", category: "Material Handling", location: "Warehouse B - Zone 1", healthPercent: 88 },
  ],
  "USR-003": [
    { id: "A-004", name: "Hydraulic Press HP-02", category: "Manufacturing", location: "Plant C - Station 4", healthPercent: 75 },
    { id: "A-005", name: "CNC Router CR-07", category: "Machining", location: "Plant C - Bay 2", healthPercent: 94 },
  ],
  "USR-004": [
    { id: "A-006", name: "Robotic Arm RA-03", category: "Automation", location: "Plant A - Cell 1", healthPercent: 97 },
    { id: "A-007", name: "Laser Cutter LC-01", category: "Fabrication", location: "Plant A - Cell 3", healthPercent: 81 },
    { id: "A-008", name: "3D Printer 3P-02", category: "Prototyping", location: "Lab B - Bench 4", healthPercent: 90 },
    { id: "A-009", name: "Welding Station WS-05", category: "Fabrication", location: "Plant A - Bay 6", healthPercent: 73 },
    { id: "A-010", name: "Inspection Camera IC-11", category: "Quality", location: "Plant A - Line 2", healthPercent: 99 },
  ],
  "USR-005": [
    { id: "A-011", name: "HVAC Unit HV-04", category: "Facilities", location: "Building D - Roof", healthPercent: 56 },
  ],
};

/** Get mock assets for a user ID. */
export function getMockAssetsForUser(userId: string): AssetItem[] {
  return MOCK_ASSETS[userId] ?? [];
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function HealthBadge({ percent }: { percent: number }) {
  const color =
    percent >= 80
      ? "border-emerald-500/40 text-emerald-400"
      : percent >= 60
        ? "border-amber-500/40 text-amber-400"
        : "border-red-500/40 text-red-400";

  return (
    <Badge
      variant="outline"
      className={`text-xs font-semibold ${color}`}
    >
      Health: {percent}%
    </Badge>
  );
}

function AssetCard({
  asset,
  onRemove,
}: {
  asset: AssetItem;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-border p-4">
      {/* Left: icon + info */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15">
          <Box className="h-5 w-5 text-indigo-400" />
        </div>
        <div className="min-w-0 space-y-1">
          <p className="text-base font-semibold">{asset.name}</p>
          <p className="text-sm text-muted-foreground">{asset.category}</p>
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-red-400" />
              {asset.location}
            </span>
            <HealthBadge percent={asset.healthPercent} />
          </div>
        </div>
      </div>

      {/* Right: remove button */}
      <button
        type="button"
        onClick={() => onRemove(asset.id)}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-red-500/30 px-3 py-1.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
      >
        <X className="h-3.5 w-3.5" />
        Remove
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main dialog
// ---------------------------------------------------------------------------

export default function ViewAssignedAssetsDialog({
  userName,
  assets: initialAssets,
  open,
  onOpenChange,
  onBackToDetails,
}: Props) {
  const [assets, setAssets] = React.useState<AssetItem[]>(initialAssets);

  // Sync when dialog opens with new data
  React.useEffect(() => {
    if (open) setAssets(initialAssets);
  }, [open, initialAssets]);

  function handleRemove(assetId: string) {
    const removed = assets.find((a) => a.id === assetId);
    setAssets((prev) => prev.filter((a) => a.id !== assetId));
    toast.success(`Removed ${removed?.name ?? "asset"}`, {
      description: "Asset unassigned from user. (Mock — will sync with backend later.)",
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Assigned Assets</DialogTitle>
          <DialogDescription>
            {userName} – {assets.length} asset{assets.length !== 1 ? "s" : ""}
          </DialogDescription>
        </DialogHeader>

        {/* Asset cards list */}
        {assets.length === 0 ? (
          <p className="py-6 text-center text-muted-foreground">
            No assets currently assigned.
          </p>
        ) : (
          <div className="grid gap-3 pt-1">
            {assets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                onRemove={handleRemove}
              />
            ))}
          </div>
        )}

        {/* Back button */}
        {onBackToDetails && (
          <Button onClick={onBackToDetails} className="mt-1 w-full">
            Back to User Details
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
