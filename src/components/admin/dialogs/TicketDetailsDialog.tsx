"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, AlertCircle, CheckCircle, RefreshCw, XCircle, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { updateTicketStatus, type Ticket, type TicketStatus } from "@/lib/ticketService";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket?: Ticket | null;
  onDelete?: (id: string) => void;
  onUpdated?: (ticket: Ticket) => void;
};

function PriorityBadge({ priority }: { priority: string }) {
  const cls =
    priority === "High" ? "bg-red-100" : priority === "Medium" ? "bg-amber-100" : "bg-emerald-100";
  return (
    <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full ${cls}`}>
      {priority === "High" ? (
        <AlertTriangle className="h-4 w-4 text-red-600" />
      ) : priority === "Medium" ? (
        <AlertCircle className="h-4 w-4 text-amber-500" />
      ) : (
        <CheckCircle className="h-4 w-4 text-emerald-500" />
      )}
    </span>
  );
}

const STATUS_OPTIONS: { value: TicketStatus; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "in-progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

export default function TicketDetailsDialog({ open, onOpenChange, ticket, onDelete, onUpdated }: Props) {
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [statusUpdating, setStatusUpdating] = React.useState(false);
  const [localStatus, setLocalStatus] = React.useState<TicketStatus | null>(null);

  React.useEffect(() => {
    if (ticket) setLocalStatus(ticket.status);
    if (!open) setConfirmOpen(false);
  }, [ticket, open]);

  const categoryBadgeClass = (cat?: string | null) => {
    switch ((cat || "").toLowerCase()) {
      case "mechanical": return "bg-emerald-100 text-emerald-800";
      case "electrical": return "bg-pink-100 text-pink-800";
      case "software": return "bg-sky-100 text-sky-800";
      default: return "bg-emerald-100 text-emerald-800";
    }
  };

  async function handleStatusChange(newStatus: TicketStatus) {
    if (!ticket || newStatus === localStatus) return;
    setStatusUpdating(true);
    const prev = localStatus;
    setLocalStatus(newStatus);
    try {
      await updateTicketStatus(ticket.id, newStatus);
      const updated: Ticket = { ...ticket, status: newStatus };
      onUpdated?.(updated);
      toast.success("Status updated");
    } catch (err: any) {
      setLocalStatus(prev);
      toast.error("Failed to update status", { description: err?.message });
    } finally {
      setStatusUpdating(false);
    }
  }

  const displayStatus = localStatus ?? ticket?.status ?? "open";
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
            <div>
              <DialogTitle className="text-lg font-semibold">{ticket?.title ?? "Ticket Details"}</DialogTitle>
              <div className="mt-2 flex items-center gap-4 flex-wrap">
                <span className="rounded-md bg-muted/30 px-3 py-1 text-sm font-medium">
                  {ticket?.ticket_number ?? ticket?.id?.slice(0, 8)}
                </span>

                <div className="flex items-center gap-2">
                  <PriorityBadge priority={ticket?.priority ?? "Low"} />
                  <span className="text-sm font-medium">{ticket?.priority}</span>
                </div>

                {/* Status selector */}
                <div className="flex items-center gap-2">
                  <Select
                    value={displayStatus}
                    onValueChange={(v) => handleStatusChange(v as TicketStatus)}
                    disabled={statusUpdating}
                  >
                    <SelectTrigger className="h-8 w-[148px] text-sm">
                      {statusUpdating ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-3 w-3 animate-spin" />Updating…
                        </span>
                      ) : (
                        <SelectValue />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <div className="flex items-center gap-2">
                            {opt.value === "open" && <AlertCircle className="h-3.5 w-3.5 text-red-600" />}
                            {opt.value === "in-progress" && <RefreshCw className="h-3.5 w-3.5 text-amber-500" />}
                            {opt.value === "resolved" && <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />}
                            {opt.value === "closed" && <XCircle className="h-3.5 w-3.5 text-slate-500" />}
                            {opt.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => setConfirmOpen((s) => !s)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {ticket?.asset_name && (
            <DialogDescription className="mt-3 text-sm text-muted-foreground">
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
              {ticket?.assigned_to ? (
                <Badge className="bg-purple-100 text-purple-800">{ticket.assigned_to.slice(0, 8)}</Badge>
              ) : (
                "Unassigned"
              )}
            </div>
          </div>
        </div>

        {confirmOpen && (
          <div className="mt-4 rounded-md border p-4 bg-red-50">
            <h4 className="text-sm font-medium text-red-700">Delete Ticket</h4>
            <p className="mt-2 text-sm text-red-600">Are you sure? This action cannot be undone.</p>
            <div className="mt-4 flex items-center gap-2">
              <Button
                className="bg-red-600 text-white"
                onClick={() => {
                  if (ticket) {
                    onDelete?.(ticket.id);
                    setConfirmOpen(false);
                  }
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
