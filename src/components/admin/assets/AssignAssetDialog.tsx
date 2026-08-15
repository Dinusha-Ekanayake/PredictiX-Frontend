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
import { Search, Loader2, UserCheck, Box } from "lucide-react";
import { toast } from "@/lib/customToast";
import { assignAsset, listUsers, type UserItem } from "@/lib/userService";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Asset being assigned. */
  assetId: string;
  assetName: string;
  assetCode: string;
  /** Id of the person it is currently assigned to, if any. */
  currentAssigneeId?: string | null;
  /** Called after the server confirms, so the caller can refresh. */
  onAssigned?: (userId: string) => void;
};

/**
 * Pick a person to assign an asset to.
 *
 * Only staff in the asset's own warehouse can be chosen: the server rejects a
 * cross-warehouse assignment, so the list is filtered to match rather than
 * offering choices that would fail. Inactive accounts are excluded for the
 * same reason.
 */
export default function AssignAssetDialog({
  open,
  onOpenChange,
  assetId,
  assetName,
  assetCode,
  currentAssigneeId,
  onAssigned,
}: Props) {
  const [users, setUsers] = React.useState<UserItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  // Load the roster when the dialog opens, not on mount, so closing and
  // reopening picks up anyone added in between.
  React.useEffect(() => {
    if (!open) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const rows = await listUsers();
        if (!cancelled) setUsers(rows);
      } catch (err) {
        if (!cancelled) {
          toast.error("Could not load users", {
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

  // Reset the form each time it opens so a previous selection is not reused.
  React.useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedId(null);
    }
  }, [open]);

  const candidates = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return users
      .filter((u) => u.status === "active")
      .filter((u) => u.id !== currentAssigneeId)
      .filter(
        (u) =>
          !q ||
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.department ?? "").toLowerCase().includes(q),
      );
  }, [users, query, currentAssigneeId]);

  async function handleAssign() {
    if (!selectedId) return;
    const person = users.find((u) => u.id === selectedId);
    setSaving(true);
    try {
      await assignAsset(assetId, selectedId);
      toast.success(`Assigned to ${person?.name ?? "user"}`, {
        description: `${assetName} is now their responsibility.`,
      });
      onAssigned?.(selectedId);
      onOpenChange(false);
    } catch (err) {
      // The server explains cross-warehouse and inactive-account refusals, so
      // surface its message rather than a generic one.
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
          <DialogTitle className="text-xl">Assign asset</DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <Box className="h-3.5 w-3.5 shrink-0 text-indigo-400" />
            <span className="truncate">{assetName}</span>
            <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{assetCode}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email or department"
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="max-h-[42vh] space-y-1.5 overflow-y-auto pr-1">
          {loading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Loading users…</p>
          ) : candidates.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {query ? "No one matches that search." : "No eligible users in this warehouse."}
            </p>
          ) : (
            candidates.map((u) => {
              const selected = u.id === selectedId;
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setSelectedId(u.id)}
                  className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                    selected
                      ? "border-indigo-500 bg-indigo-500/10"
                      : "border-border hover:bg-muted/40"
                  }`}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                    {u.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{u.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {u.role}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {u.assignedAssets} asset{u.assignedAssets === 1 ? "" : "s"}
                    </span>
                  </div>
                  {selected && <UserCheck className="h-4 w-4 shrink-0 text-indigo-500" />}
                </button>
              );
            })
          )}
        </div>

        <div className="flex items-center gap-2 pt-1">
          <Button
            className="flex-1"
            disabled={!selectedId || saving}
            onClick={handleAssign}
          >
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
