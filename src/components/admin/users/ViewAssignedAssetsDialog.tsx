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
import { Box, MapPin, ExternalLink } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AssetItem = {
  id: string;
  asset_id?: string;
  name: string;
  category: string;
  location: string;
  healthPercent: number;
};

type Props = {
  userName: string;
  assets: AssetItem[];
  loading?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBackToDetails?: () => void;
  onNavigateToAsset?: (assetId: string) => void;
};

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
    <Badge variant="outline" className={`text-xs font-semibold ${color}`}>
      Health: {percent}%
    </Badge>
  );
}

function AssetCard({
  asset,
  onNavigate,
}: {
  asset: AssetItem;
  onNavigate?: (assetId: string) => void;
}) {
  const assetId = asset.asset_id ?? asset.id;

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
}: Props) {
  const [assets, setAssets] = React.useState<AssetItem[]>(initialAssets);

  React.useEffect(() => {
    if (open) setAssets(initialAssets);
  }, [open, initialAssets]);

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
          <p className="py-6 text-center text-muted-foreground">
            No assets currently assigned.
          </p>
        ) : (
          <div className="grid gap-3 pt-1">
            {assets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                onNavigate={onNavigateToAsset}
              />
            ))}
          </div>
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