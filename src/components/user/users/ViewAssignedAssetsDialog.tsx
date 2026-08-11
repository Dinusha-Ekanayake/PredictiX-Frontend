"use client";

import * as React from "react";
import { toast } from "@/lib/customToast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Box, MapPin, X, Loader2 } from "lucide-react";

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

// Mock data removed. Assets are now fetched from PostgreSQL via parent.

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

type Props = {
  userName: string;
  assets: AssetItem[];
  isLoading?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When provided, shows a "Back to User Details" button. */
  onBackToDetails?: () => void;
};

export default function ViewAssignedAssetsDialog({
  userName,
  assets: initialAssets,
  isLoading,
  open,
  onOpenChange,
  onBackToDetails,
}: Props) {
  const [assets, setAssets] = React.useState<AssetItem[]>(initialAssets);

  // Sync when dialog opens with new data
  React.useEffect(() => {
    if (open) setAssets(initialAssets);
  }, [open, initialAssets]);

  async function handleRemove(assetId: string) {
    try {
      const { apiFetch } = await import("@/lib/apiClient");
      const response = await apiFetch(`/assets/${assetId}/assign`, { method: "PATCH" });
      
      if (!response.ok) {
        throw new Error("Failed to unassign asset");
      }

      const removed = assets.find((a) => a.id === assetId);
      setAssets((prev) => prev.filter((a) => a.id !== assetId));
      toast.success(`Removed ${removed?.name ?? "asset"}`, {
        description: "Asset successfully unassigned.",
      });
    } catch (error) {
      toast.error("Failed to unassign asset", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
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
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p>Fetching assigned assets from PostgreSQL...</p>
          </div>
        ) : assets.length === 0 ? (
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
