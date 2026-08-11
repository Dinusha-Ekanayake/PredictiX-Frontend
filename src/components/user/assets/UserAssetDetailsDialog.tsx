"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import AssetDetailsPanel, { AssetDetailsSkeleton } from "@/components/admin/assets/AssetDetailsPanel";
import { getAssetDetail } from "@/components/admin/assets/assetService";
import type { AssetDetail } from "@/components/admin/assets/types";

export default function UserAssetDetailsDialog({
  assetId,
  open,
  onOpenChange,
}: {
  assetId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [detail, setDetail] = React.useState<AssetDetail | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open || !assetId) {
      setDetail(null);
      setError(null);
      return;
    }
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const d = await getAssetDetail(assetId!);
        if (!cancelled) setDetail(d);
      } catch (e: unknown) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Failed to load asset details");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [open, assetId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden bg-muted/20 border-slate-200 dark:border-slate-800 rounded-3xl" showCloseButton={false}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/80 dark:border-white/6 bg-white dark:bg-card">
          <DialogTitle className="text-lg font-bold">Asset Details</DialogTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => onOpenChange(false)} aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {loading ? (
            <AssetDetailsSkeleton />
          ) : error ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-500/10 px-6 py-16 text-center">
              <AlertCircle className="mb-3 h-8 w-8 text-red-400" />
              <p className="text-sm font-medium text-red-700 dark:text-red-400">{error}</p>
            </div>
          ) : detail ? (
            <div className="w-full">
              <AssetDetailsPanel
                detail={detail}
                onRefresh={() => {}}
                onDelete={undefined}
                onEdit={undefined}
                readOnly={true}
              />
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
