"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, AlertCircle, CheckCircle, Trash2, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { updateTicketStatus, updateTicketPriority, updateTicketAssignee, type Ticket, type TicketStatus, type TicketPriority } from "@/lib/ticketService";
import { getAssetDetail } from "@/components/admin/assets/assetService";
import type { AssetDetail } from "@/components/admin/assets/types";
import type { UserItem } from "@/lib/userService";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket?: Ticket | null;
  onDelete?: (id: string) => void;
  onUpdated?: (ticket: Ticket) => void;
  isAdmin?: boolean;
  users?: UserItem[];
};

const selectCls =
  "rounded-md border border-input bg-background px-2 py-1 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring focus:border-ring disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer h-8";

function PriorityIcon({ priority }: { priority: string }) {
  if (priority === "High") return <AlertTriangle className="h-4 w-4 text-red-600" />;
  if (priority === "Medium") return <AlertCircle className="h-4 w-4 text-amber-500" />;
  return <CheckCircle className="h-4 w-4 text-emerald-500" />;
}

export default function TicketDetailsDialog({ open, onOpenChange, ticket, onDelete, onUpdated, isAdmin = false, users }: Props) {
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [statusUpdating, setStatusUpdating] = React.useState(false);
  const [priorityUpdating, setPriorityUpdating] = React.useState(false);
  const [localStatus, setLocalStatus] = React.useState<TicketStatus>("open");
  const [localPriority, setLocalPriority] = React.useState<TicketPriority>("Medium");
  
  const [localAssignee, setLocalAssignee] = React.useState<string>("");
  const [assigneeUpdating, setAssigneeUpdating] = React.useState(false);
  
  const [assetDetail, setAssetDetail] = React.useState<AssetDetail | null>(null);
  const [assetLoading, setAssetLoading] = React.useState(false);

  const maintenanceUsers = React.useMemo(() => {
    if (!users) return [];
    const filtered = users.filter((u) => u.department?.toLowerCase().includes("maintenance"));
    return filtered.length > 0 ? filtered : users;
  }, [users]);

  React.useEffect(() => {
    if (ticket) {
      setLocalStatus(ticket.status);
      setLocalPriority(ticket.priority);
      setLocalAssignee(ticket.assigned_to || "");
      
      if (ticket.asset_id && open) {
        setAssetLoading(true);
        getAssetDetail(ticket.asset_id)
          .then(setAssetDetail)
          .catch((err) => console.error("Failed to load asset detail", err))
          .finally(() => setAssetLoading(false));
      } else {
        setAssetDetail(null);
      }
    }
    if (!open) setConfirmOpen(false);
  }, [ticket, open]);

  async function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value as TicketStatus;
    if (!ticket || newStatus === localStatus) return;
    setStatusUpdating(true);
    const prev = localStatus;
    setLocalStatus(newStatus);
    try {
      await updateTicketStatus(ticket.id, newStatus);
      onUpdated?.({ ...ticket, status: newStatus, priority: localPriority });
      toast.success("Status updated");
    } catch (err: any) {
      setLocalStatus(prev);
      toast.error("Failed to update status", { description: err?.message });
    } finally {
      setStatusUpdating(false);
    }
  }

  async function handlePriorityChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newPriority = e.target.value as TicketPriority;
    if (!ticket || newPriority === localPriority) return;
    setPriorityUpdating(true);
    const prev = localPriority;
    setLocalPriority(newPriority);
    try {
      await updateTicketPriority(ticket.id, newPriority);
      onUpdated?.({ ...ticket, status: localStatus, priority: newPriority, assigned_to: localAssignee || null });
      toast.success("Priority updated");
    } catch (err: any) {
      setLocalPriority(prev);
      toast.error("Failed to update priority", { description: err?.message });
    } finally {
      setPriorityUpdating(false);
    }
  }

  async function handleAssigneeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newAssignee = e.target.value;
    if (!ticket || newAssignee === localAssignee) return;
    setAssigneeUpdating(true);
    const prev = localAssignee;
    setLocalAssignee(newAssignee);
    try {
      const assignedToVal = newAssignee === "" ? null : newAssignee;
      await updateTicketAssignee(ticket.id, assignedToVal);
      onUpdated?.({ ...ticket, status: localStatus, priority: localPriority, assigned_to: assignedToVal });
      toast.success("Assignee updated");
    } catch (err: any) {
      setLocalAssignee(prev);
      toast.error("Failed to update assignee", { description: err?.message });
    } finally {
      setAssigneeUpdating(false);
    }
  }

  const categoryBadgeClass = (cat?: string | null) => {
    switch ((cat || "").toLowerCase()) {
      case "mechanical": return "bg-emerald-100 text-emerald-800";
      case "electrical": return "bg-pink-100 text-pink-800";
      case "software": return "bg-sky-100 text-sky-800";
      default: return "bg-emerald-100 text-emerald-800";
    }
  };

  const category = ticket?.predicted_category ?? ticket?.final_category;
  const createdDate = ticket?.opened_at
    ? new Date(ticket.opened_at).toLocaleDateString()
    : ticket?.created_at
    ? new Date(ticket.created_at).toLocaleDateString()
    : "—";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4 w-full">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg font-semibold">{ticket?.title ?? "Ticket Details"}</DialogTitle>

              <div className="mt-3 flex items-center gap-3 flex-wrap">
                {/* Ticket number */}
                <span className="rounded-md bg-muted/30 px-3 py-1 text-sm font-medium">
                  {ticket?.ticket_number ?? ticket?.id?.slice(0, 8)}
                </span>

                {/* Priority */}
                <div className="flex items-center gap-1.5">
                  <PriorityIcon priority={localPriority} />
                  {isAdmin ? (
                    priorityUpdating ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                    ) : (
                      <select
                        value={localPriority}
                        onChange={handlePriorityChange}
                        disabled={priorityUpdating}
                        className={selectCls + " w-[110px]"}
                      >
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    )
                  ) : (
                    <span className="text-sm font-medium">{localPriority}</span>
                  )}
                </div>

                {/* Status */}
                <div className="flex items-center gap-1.5">
                  {isAdmin ? (
                    statusUpdating ? (
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />Updating…
                      </span>
                    ) : (
                      <select
                        value={localStatus}
                        onChange={handleStatusChange}
                        disabled={statusUpdating}
                        className={selectCls + " w-[140px]"}
                      >
                        <option value="open">Open</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    )
                  ) : (
                    <span className="text-sm font-medium capitalize">{localStatus.replace("-", " ")}</span>
                  )}
                </div>
              </div>
            </div>

            {isAdmin && (
              <Button
                variant="ghost"
                onClick={() => setConfirmOpen((s) => !s)}
                className="text-destructive shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          {ticket?.asset_name && (
            <DialogDescription className="mt-2 text-sm text-muted-foreground">
              {ticket.asset_name}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="grid gap-4 pt-4">
          <div className="rounded-md border p-3 bg-muted/30">
            <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
            <p className="mt-2 text-sm">{ticket?.description ?? "No description provided."}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-md border p-3 bg-muted/30">
              <h4 className="text-sm font-medium text-muted-foreground">Category</h4>
              <div className="mt-2">
                <Badge className={categoryBadgeClass(category)}>
                  {category ?? "General"}
                </Badge>
              </div>
            </div>

            <div className="rounded-md border p-3 bg-muted/30">
              <h4 className="text-sm font-medium text-muted-foreground">Created</h4>
              <div className="mt-2 text-sm text-muted-foreground">{createdDate}</div>
            </div>
          </div>

          <div className="rounded-md border p-3 bg-muted/30">
            <h4 className="text-sm font-medium text-muted-foreground">Assigned To</h4>
            <div className="mt-2 text-sm">
              {isAdmin ? (
                assigneeUpdating ? (
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />Updating…
                  </span>
                ) : (
                  <select
                    value={localAssignee}
                    onChange={handleAssigneeChange}
                    disabled={assigneeUpdating}
                    className={selectCls + " w-full max-w-[250px]"}
                  >
                    <option value="">Unassigned</option>
                    {maintenanceUsers.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.department})</option>
                    ))}
                  </select>
                )
              ) : (
                ticket?.assigned_to ? (
                  <Badge className="bg-purple-100 text-purple-800">
                    {users?.find(u => u.id === ticket.assigned_to)?.name ?? ticket.assigned_to.slice(0, 8)}
                  </Badge>
                ) : (
                  "Unassigned"
                )
              )}
            </div>
          </div>

          {/* Asset Info Section */}
          {ticket?.asset_id && (
            <div className="rounded-md border p-3 bg-muted/30">
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Asset Information</h4>
              {assetLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading asset details...
                </div>
              ) : assetDetail ? (
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Asset Code:</span>{" "}
                    <span className="font-medium">{assetDetail.asset.asset_code}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Name:</span>{" "}
                    <span className="font-medium">{assetDetail.asset.asset_name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Type:</span>{" "}
                    <span className="font-medium">{assetDetail.asset.asset_type || "—"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Make / Model:</span>{" "}
                    <span className="font-medium">
                      {assetDetail.asset.make || "—"} {assetDetail.asset.model || ""}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>{" "}
                    <Badge variant="outline" className="ml-1 capitalize">{assetDetail.asset.status}</Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Health Band:</span>{" "}
                    <span className="font-medium capitalize">{assetDetail.asset.health_band || "—"}</span>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Could not load asset information.</div>
              )}
            </div>
          )}

          {/* Predictive Insights Section */}
          {ticket?.asset_id && assetDetail && (assetDetail.prediction || assetDetail.costPrediction) && (
            <div className="rounded-md border p-3 bg-indigo-50/50 dark:bg-indigo-950/20">
              <h4 className="text-sm font-medium text-indigo-700 dark:text-indigo-400 mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Predictive Insights
              </h4>
              <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                {assetDetail.prediction && (
                  <>
                    <div>
                      <span className="text-muted-foreground">Failure Probability:</span>{" "}
                      <span className="font-medium">
                        {assetDetail.prediction.failure_probability !== null 
                          ? `${(Number(assetDetail.prediction.failure_probability) * 100).toFixed(1)}%` 
                          : "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Risk Level:</span>{" "}
                      <Badge variant="outline" className="ml-1 capitalize">{assetDetail.prediction.risk_level || "—"}</Badge>
                    </div>
                  </>
                )}
                {assetDetail.costPrediction && (
                  <>
                    <div>
                      <span className="text-muted-foreground">Est. Cost:</span>{" "}
                      <span className="font-medium">
                        {assetDetail.costPrediction.estimated_cost !== null 
                          ? `$${Number(assetDetail.costPrediction.estimated_cost).toFixed(2)}` 
                          : "—"}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {confirmOpen && (
          <div className="mt-4 rounded-md border p-4 bg-red-50 dark:bg-red-950/30">
            <h4 className="text-sm font-medium text-red-700">Delete Ticket</h4>
            <p className="mt-2 text-sm text-red-600">Are you sure? This action cannot be undone.</p>
            <div className="mt-4 flex items-center gap-2">
              <Button
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={() => {
                  if (ticket) { onDelete?.(ticket.id); setConfirmOpen(false); }
                }}
              >
                Confirm Delete
              </Button>
              <Button variant="ghost" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
