"use client";

import * as React from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Box, MapPin, ExternalLink, Loader2, UserMinus, Plus } from "lucide-react";
import { toast } from "@/lib/customToast";
import { unassignAsset } from "@/lib/userService";
import { healthBadgeClass, formatHealth } from "@/lib/healthBands";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AssetItem = {
  id: string;
  asset_id?: string;
  name: string;
  category: string;
  location: string;
  /** Real health score; null when the asset has no completed prediction. */
  healthPercent: number | null;
};

type Props = {
  userName: string;
  assets: AssetItem[];
  loading?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBackToDetails?: () => void;
  onNavigateToAsset?: (assetId: string) => void;
  /**
   * Called after an asset is successfully unassigned, so the caller can keep
   * its own state (the per-user assignment count in the users table) in step.
   * Omit it to render the dialog read-only — the Remove action only appears
   * when a handler is supplied.
   */
  onUnassigned?: (assetId: string) => void;
  /**
   * Opens the asset picker. Omit it to hide the assign action, which is how
   * a read-only view of someone's assets is rendered.
   */
  onAssignAnother?: () => void;
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function HealthBadge({ percent }: { percent: number | null }) {
  // Bands and colours come from @/lib/healthBands. A null score renders as a
  // dash rather than a number.
  return (
    <Badge
      variant="outline"
      className={`text-xs font-semibold ${healthBadgeClass(percent)}`}
      title={percent == null ? "No completed prediction for this asset yet" : undefined}
    >
      Health: {formatHealth(percent)}
    </Badge>
  );
}

function AssetCard({
  asset,
  onNavigate,
  onRemove,
  removing,
}: {
  asset: AssetItem;
  onNavigate?: (assetId: string) => void;
  onRemove?: (assetId: string) => void;
  removing?: boolean;
}) {
  const assetId = asset.asset_id ?? asset.id;
  // Two-step: a destructive action that cannot be undone from this screen
  // should not fire on a single click of a row-level button.
  const [confirming, setConfirming] = React.useState(false);

  return (
    <div className="rounded-xl border border-border p-4 transition-colors hover:bg-muted/30">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15">
          <Box className="h-5 w-5 text-indigo-400" />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="truncate text-base font-semibold">{asset.name}</p>
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

      {/* Navigate to Asset Details & Reports */}
      {onNavigate && (
        <button
          onClick={() => onNavigate(assetId)}
          className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20 hover:text-emerald-300"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          View Full Asset Details &amp; Reports
        </button>
      )}

      {onRemove && (
        confirming ? (
          <div className="mt-2 flex items-center gap-2">
            <Button
              size="sm"
              variant="destructive"
              className="flex-1"
              disabled={removing}
              onClick={() => onRemove(assetId)}
            >
              {removing && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              {removing ? "Unassigning…" : "Confirm unassign"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="flex-1"
              disabled={removing}
              onClick={() => setConfirming(false)}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20 hover:text-red-300"
          >
            <UserMinus className="h-3.5 w-3.5" />
            Unassign from this user
          </button>
        )
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main dialog
// ---------------------------------------------------------------------------

export default function ViewAssignedAssetsDialog({
  userName,
  assets: initialAssets,
  loading = false,
  open,
  onOpenChange,
  onBackToDetails,
  onNavigateToAsset,
  onUnassigned,
  onAssignAnother,
}: Props) {
  const [assets, setAssets] = React.useState<AssetItem[]>(initialAssets);
  const [removingId, setRemovingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) setAssets(initialAssets);
  }, [open, initialAssets]);

  /**
   * Unassign, then drop the row. The list is only updated after the server
   * confirms, so a failed call leaves the dialog showing the truth rather than
   * a row that has silently reappeared on the next open.
   */
  async function handleRemove(assetId: string) {
    setRemovingId(assetId);
    const removed = assets.find((a) => (a.asset_id ?? a.id) === assetId);
    try {
      await unassignAsset(assetId);
      setAssets((prev) => prev.filter((a) => (a.asset_id ?? a.id) !== assetId));
      onUnassigned?.(assetId);
      toast.success(`Unassigned ${removed?.name ?? "asset"}`, {
        description: `No longer assigned to ${userName}.`,
      });
    } catch (error) {
      toast.error("Could not unassign asset", {
        description: error instanceof Error ? error.message : "Unknown error.",
      });
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Assigned Assets</DialogTitle>
          <DialogDescription>
            {userName}
            {!loading && (
              <> — {assets.length} asset{assets.length !== 1 ? "s" : ""}</>
            )}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <p className="py-6 text-center text-muted-foreground">
            Loading assigned assets…
          </p>
        ) : assets.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-muted-foreground">No assets currently assigned.</p>
            {onAssignAnother && (
              <Button className="mt-3" size="sm" onClick={onAssignAnother}>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Assign an asset
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-3 pt-1">
            {assets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                onNavigate={onNavigateToAsset}
                onRemove={onUnassigned ? handleRemove : undefined}
                removing={removingId === (asset.asset_id ?? asset.id)}
              />
            ))}
          </div>
        )}

        {onAssignAnother && assets.length > 0 && (
          <Button variant="outline" className="mt-1 w-full" onClick={onAssignAnother}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Assign another asset
          </Button>
        )}

        {onBackToDetails && (
          <Button
            onClick={onBackToDetails}
            className="mt-2 w-full"
            variant="secondary"
          >
            Back to User Details
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}