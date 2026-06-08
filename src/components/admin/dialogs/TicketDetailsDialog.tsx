"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, AlertCircle, CheckCircle, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  updateTicketStatus,
  updateTicketPriority,
  fetchTicketEnrichment,
  type Ticket,
  type TicketStatus,
  type TicketPriority,
  type TicketEnrichment,
} from "@/lib/ticketService";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket?: Ticket | null;
  onDelete?: (id: string) => void;
  onUpdated?: (ticket: Ticket) => void;
  isAdmin?: boolean;
};

const selectCls =
  "rounded-md border border-input bg-background px-2 py-1 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring focus:border-ring disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer h-8";

function PriorityIcon({ priority }: { priority: string }) {
  if (priority === "High") return <AlertTriangle className="h-4 w-4 text-red-600" />;
  if (priority === "Medium") return <AlertCircle className="h-4 w-4 text-amber-500" />;
  return <CheckCircle className="h-4 w-4 text-emerald-500" />;
}

export default function TicketDetailsDialog({ open, onOpenChange, ticket, onDelete, onUpdated, isAdmin = false }: Props) {
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [statusUpdating, setStatusUpdating] = React.useState(false);
  const [priorityUpdating, setPriorityUpdating] = React.useState(false);
  const [localStatus, setLocalStatus] = React.useState<TicketStatus>("open");
  const [localPriority, setLocalPriority] = React.useState<TicketPriority>("Medium");
  const [enrichment, setEnrichment] = React.useState<TicketEnrichment | null>(null);
  const [enrichmentLoading, setEnrichmentLoading] = React.useState(false);

  React.useEffect(() => {
    if (ticket) {
      setLocalStatus(ticket.status);
      setLocalPriority(ticket.priority);
    }
    if (!open) setConfirmOpen(false);
  }, [ticket, open]);

  React.useEffect(() => {
    if (!open || !ticket) {
      setEnrichment(null);
      return;
    }
    let cancelled = false;
    setEnrichmentLoading(true);
    fetchTicketEnrichment({
      id: ticket.id,
      created_by: ticket.created_by,
      assigned_to: ticket.assigned_to,
      asset_id: ticket.asset_id,
    })
      .then((data) => {
        if (!cancelled) setEnrichment(data);
      })
      .catch(() => {
        if (!cancelled) setEnrichment(null);
      })
      .finally(() => {
        if (!cancelled) setEnrichmentLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, ticket]);

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
      onUpdated?.({ ...ticket, status: localStatus, priority: newPriority });
      toast.success("Priority updated");
    } catch (err: any) {
      setLocalPriority(prev);
      toast.error("Failed to update priority", { description: err?.message });
    } finally {
      setPriorityUpdating(false);
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

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-md border p-3 bg-muted/30">
              <h4 className="text-sm font-medium text-muted-foreground">Assigned To</h4>
              <div className="mt-2 text-sm">
                {enrichment?.assignee_name ? (
                  <Badge className="bg-purple-100 text-purple-800">{enrichment.assignee_name}</Badge>
                ) : ticket?.assigned_to ? (
                  <Badge className="bg-purple-100 text-purple-800">{ticket.assigned_to.slice(0, 8)}</Badge>
                ) : (
                  "Unassigned"
                )}
              </div>
            </div>

            <div className="rounded-md border p-3 bg-muted/30">
              <h4 className="text-sm font-medium text-muted-foreground">Created By</h4>
              <div className="mt-2 text-sm">
                {enrichmentLoading && !enrichment ? (
                  <span className="text-muted-foreground">Loading…</span>
                ) : enrichment?.creator_name ? (
                  <div>
                    <Badge className="bg-blue-100 text-blue-800">{enrichment.creator_name}</Badge>
                    {enrichment.creator_email && (
                      <div className="mt-1 text-xs text-muted-foreground">{enrichment.creator_email}</div>
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground">Unknown</span>
                )}
              </div>
            </div>
          </div>

          {(enrichment?.warehouse_name || enrichment?.department_name) && (
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md border p-3 bg-muted/30">
                <h4 className="text-sm font-medium text-muted-foreground">Warehouse</h4>
                <div className="mt-2 text-sm">
                  {enrichment?.warehouse_name ?? <span className="text-muted-foreground">—</span>}
                </div>
              </div>
              <div className="rounded-md border p-3 bg-muted/30">
                <h4 className="text-sm font-medium text-muted-foreground">Department</h4>
                <div className="mt-2 text-sm">
                  {enrichment?.department_name ?? <span className="text-muted-foreground">—</span>}
                </div>
              </div>
            </div>
          )}

          {enrichment && enrichment.history.length > 0 && (
            <div className="rounded-md border p-3 bg-muted/30">
              <h4 className="text-sm font-medium text-muted-foreground">History</h4>
              <ul className="mt-2 space-y-2">
                {enrichment.history.map((h) => (
                  <li key={h.id} className="text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">
                        {h.old_status ? `${h.old_status} → ${h.new_status}` : `Set to ${h.new_status}`}
                      </span>
                      {h.changed_by_name && (
                        <span className="text-muted-foreground">by {h.changed_by_name}</span>
                      )}
                      <span className="text-muted-foreground">
                        {new Date(h.created_at).toLocaleString()}
                      </span>
                    </div>
                    {h.note && <div className="mt-0.5 text-muted-foreground">{h.note}</div>}
                  </li>
                ))}
              </ul>
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
