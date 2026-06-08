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
import { Box, MapPin, Loader2, AlertCircle } from "lucide-react";

import { fetchUserAssets } from "@/lib/api/userProfileApi";
import type { UserAssetData } from "@/lib/api/userProfileApi";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Props = {
  userId: string;
  userName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBackToDetails?: () => void;
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

function StatusBadge({ status }: { status: string }) {
  const color =
    status === "active"
      ? "border-transparent bg-emerald-600 text-white"
      : "border-transparent bg-zinc-600 text-white";
  return <Badge className={`text-xs ${color}`}>{status}</Badge>;
}

function AssetCard({ asset }: { asset: UserAssetData }) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-border p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15">
        <Box className="h-5 w-5 text-indigo-400" />
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-base font-semibold">{asset.name}</p>
          <StatusBadge status={asset.status} />
        </div>

        <p className="text-sm text-muted-foreground">
          {asset.asset_type}
          {asset.category ? ` · ${asset.category}` : ""}
        </p>

        <p className="text-xs font-mono text-muted-foreground">
          {asset.asset_code}
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-red-400" />
            {asset.location}
          </span>
          <HealthBadge percent={Math.round(asset.healthPercent)} />
        </div>

        {asset.nextServiceDate && (
          <p className="text-xs text-muted-foreground">
            Next service:{" "}
            <span className="font-medium text-amber-400">
              {new Date(asset.nextServiceDate).toLocaleDateString()}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main dialog
// ---------------------------------------------------------------------------

export default function ViewAssignedAssetsDialog({
  userId,
  userName,
  open,
  onOpenChange,
  onBackToDetails,
}: Props) {
  const [assets, setAssets] = React.useState<UserAssetData[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch real assets whenever dialog opens
  React.useEffect(() => {
    if (!open || !userId) return;

    async function load() {
      setIsLoading(true);
      setError(null);
      setAssets([]);
      try {
        const data = await fetchUserAssets(userId);
        setAssets(Array.isArray(data) ? data : []);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to load assets.";
        setError(message);
        toast.error("Failed to load assets.", { description: message });
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [open, userId]);

  const assetCount = assets?.length ?? 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Assigned Assets</DialogTitle>
          <DialogDescription>
            {userName}
            {!isLoading && !error && (
              <> — {assetCount} asset{assetCount !== 1 ? "s" : ""}</>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-3 text-muted-foreground">Loading assets…</span>
          </div>
        )}

        {/* Error state */}
        {!isLoading && error && (
          <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && assetCount === 0 && (
          <p className="py-8 text-center text-muted-foreground">
            No assets currently assigned to this user.
          </p>
        )}

        {/* Asset list */}
        {!isLoading && !error && assetCount > 0 && (
          <div className="grid gap-3 pt-1">
            {assets.map((asset) => (
              <AssetCard key={asset.asset_id} asset={asset} />
            ))}
          </div>
        )}

        {/* Back button */}
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