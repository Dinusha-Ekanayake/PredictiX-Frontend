"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, Box, Check } from "lucide-react";
import { toast } from "@/lib/customToast";
import { apiGet } from "@/lib/apiClient";
import { assignAsset } from "@/lib/userService";

type AssetOption = {
  id: string;
  asset_code: string;
  asset_name: string;
  asset_type: string;
  warehouse_id: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Person the chosen asset will be assigned to. */
  userId: string;
  userName: string;
  /** Asset ids already assigned to them, so they are not offered twice. */
  alreadyAssignedIds?: string[];
  /** Called after the server confirms. */
  onAssigned?: (assetId: string) => void;
};

/**
 * Pick an asset to assign to a person.
 *
 * The asset list comes from the dropdown endpoint, which is already scoped to
 * the caller's warehouse, so only assets they may assign are offered. The
 * server still enforces the same rule.
 */
export default function AssignAssetToUserDialog({
  open,
  onOpenChange,
  userId,
  userName,
  alreadyAssignedIds = [],
  onAssigned,
}: Props) {
  const [assets, setAssets] = React.useState<AssetOption[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const rows = await apiGet<AssetOption[]>("/assets/dropdown");
        if (!cancelled) setAssets(rows);
      } catch (err) {
        if (!cancelled) {
          toast.error("Could not load assets", {
            description: err instanceof Error ? err.message : undefined,
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open]);

  React.useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedId(null);
    }
  }, [open]);

  const assignedSet = React.useMemo(
    () => new Set(alreadyAssignedIds),
    [alreadyAssignedIds],
  );

  const candidates = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return assets
      .filter((a) => !assignedSet.has(a.id))
      .filter(
        (a) =>
          !q ||
          a.asset_name.toLowerCase().includes(q) ||
          a.asset_code.toLowerCase().includes(q) ||
          (a.asset_type ?? "").toLowerCase().includes(q),
      )
      .slice(0, 100);
  }, [assets, query, assignedSet]);

  async function handleAssign() {
    if (!selectedId) return;
    const asset = assets.find((a) => a.id === selectedId);
    setSaving(true);
    try {
      await assignAsset(selectedId, userId);
      toast.success(`Assigned to ${userName}`, {
        description: `${asset?.asset_name ?? "Asset"} is now their responsibility.`,
      });
      onAssigned?.(selectedId);
      onOpenChange(false);
    } catch (err) {
      toast.error("Could not assign asset", {
        description: err instanceof Error ? err.message : "Unknown error.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Assign an asset</DialogTitle>
          <DialogDescription>To {userName}</DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, code or type"
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="max-h-[42vh] space-y-1.5 overflow-y-auto pr-1">
          {loading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Loading assets…</p>
          ) : candidates.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {query ? "No assets match that search." : "No assets available to assign."}
            </p>
          ) : (
            candidates.map((a) => {
              const selected = a.id === selectedId;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setSelectedId(a.id)}
                  className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                    selected
                      ? "border-indigo-500 bg-indigo-500/10"
                      : "border-border hover:bg-muted/40"
                  }`}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15">
                    <Box className="h-4.5 w-4.5 text-indigo-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{a.asset_name}</p>
                    <p className="truncate font-mono text-xs text-muted-foreground">
                      {a.asset_code}
                    </p>
                  </div>
                  {a.asset_type && (
                    <Badge variant="outline" className="shrink-0 text-[10px] capitalize">
                      {a.asset_type.replace("_", " ")}
                    </Badge>
                  )}
                  {selected && <Check className="h-4 w-4 shrink-0 text-indigo-500" />}
                </button>
              );
            })
          )}
        </div>

        {!loading && candidates.length === 100 && (
          <p className="text-[11px] text-muted-foreground">
            Showing the first 100 matches. Search to narrow the list.
          </p>
        )}

        <div className="flex items-center gap-2 pt-1">
          <Button className="flex-1" disabled={!selectedId || saving} onClick={handleAssign}>
            {saving && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
            {saving ? "Assigning…" : "Assign asset"}
          </Button>
          <Button variant="ghost" disabled={saving} onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
