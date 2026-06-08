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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus } from "lucide-react";
import { apiGet } from "@/lib/apiClient";
import { createTicket, type Ticket, type TicketPriority, type TicketCategory } from "@/lib/ticketService";
import { listUsers, type UserItem } from "@/lib/userService";

type Asset = {
  id: string;
  asset_name: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (ticket: Ticket) => void;
  /** Preselect an asset (e.g. "create ticket on this asset" from the assets page). */
  presetAssetId?: string;
  presetAssetName?: string;
  /** Lock the asset selector to the preset asset. */
  lockAsset?: boolean;
  /**
   * Override the create call: the user section routes creation through the
   * backend /tickets/mine endpoint so ownership is enforced server-side.
   * When omitted, the default Supabase createTicket is used (admin).
   */
  createFn?: (payload: {
    asset_id: string | null;
    title: string;
    description: string;
    priority: TicketPriority;
    category: TicketCategory;
    assigned_to?: string | null;
  }) => Promise<Ticket>;
};

const selectCls =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring focus:border-ring disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer h-9";

export default function NewTicketDialog({
  open, onOpenChange, onCreated, presetAssetId, presetAssetName, lockAsset, createFn,
}: Props) {
  const [assetId, setAssetId] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [priority, setPriority] = React.useState<TicketPriority | "">("");
  const [category, setCategory] = React.useState<TicketCategory | "">("");
  const [assignedTo, setAssignedTo] = React.useState("");
  const [users, setUsers] = React.useState<UserItem[]>([]);
  const [usersLoading, setUsersLoading] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [assets, setAssets] = React.useState<Asset[]>([]);
  const [assetsLoading, setAssetsLoading] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      if (presetAssetId) setAssetId(presetAssetId);
      setAssetsLoading(true);
      apiGet<Asset[]>("/assets/dropdown")
        .then((data) => setAssets(data ?? []))
        .catch((err) => {
          console.error("Failed to load assets:", err);
          toast.error("Failed to load assets", { description: err?.message });
        })
        .finally(() => setAssetsLoading(false));

      setUsersLoading(true);
      listUsers()
        .then((data) => setUsers(data ?? []))
        .catch((err) => {
          console.error("Failed to load users:", err);
        })
        .finally(() => setUsersLoading(false));
    } else {
      const t = setTimeout(() => {
        setAssetId("");
        setTitle("");
        setDescription("");
        setPriority("");
        setCategory("");
        setAssignedTo("");
        setIsSubmitting(false);
        setAssets([]);
        setUsers([]);
      }, 200);
      return () => clearTimeout(t);
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a title for the ticket.");
      return;
    }

    setIsSubmitting(true);
    try {
      const createArgs = {
        asset_id: assetId || null,
        title: title.trim(),
        description: description.trim(),
        priority: (priority as TicketPriority) || "Medium",
        category: (category as TicketCategory) || "Mechanical",
        assigned_to: assignedTo || null,
      };
      const ticket = createFn
        ? await createFn(createArgs)
        : await createTicket(createArgs);
      toast.success("Ticket created", { description: ticket.title });
      onCreated?.(ticket);
      onOpenChange(false);
    } catch (err: any) {
      toast.error("Failed to create ticket", { description: err?.message });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Ticket
          </DialogTitle>
          <DialogDescription>Fill the details below to create a new ticket.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-3 pt-2">
          {/* Asset */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Asset{lockAsset && presetAssetName ? ` · ${presetAssetName}` : ""}
            </p>
            {assetsLoading && !lockAsset ? (
              <div className="flex items-center gap-2 h-9 px-3 rounded-md border border-input text-sm text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Loading assets…
              </div>
            ) : (
              <select
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
                className={selectCls}
                disabled={lockAsset}
              >
                {lockAsset && presetAssetId ? (
                  <option value={presetAssetId}>{presetAssetName ?? "Selected asset"}</option>
                ) : (
                  <>
                    <option value="">Select an asset (optional)</option>
                    {assets.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.asset_name}
                      </option>
                    ))}
                  </>
                )}
              </select>
            )}
          </div>

          {/* Title */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Title</p>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Short title for the ticket"
            />
          </div>

          {/* Description */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Description</p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-base min-h-[110px] resize-vertical outline-none focus:ring-2 focus:ring-ring"
              placeholder="Describe the issue in detail"
            />
          </div>

          {/* Priority + Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Priority</p>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TicketPriority)}
                className={selectCls}
              >
                <option value="">Select priority</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Category</p>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TicketCategory)}
                className={selectCls}
              >
                <option value="">Select category</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Electrical">Electrical</option>
                <option value="Software">Software</option>
              </select>
            </div>
          </div>

          {/* Assigned User */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Assigned User</p>
            {usersLoading ? (
              <div className="flex items-center gap-2 h-9 px-3 rounded-md border border-input text-sm text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Loading users…
              </div>
            ) : (
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className={selectCls}
              >
                <option value="">Select a user (optional)</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating…</>
              ) : (
                "Create Ticket"
              )}
            </Button>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} className="w-full">
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
