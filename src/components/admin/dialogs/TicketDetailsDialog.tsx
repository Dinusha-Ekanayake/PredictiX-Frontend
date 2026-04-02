"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, AlertCircle, CheckCircle, RefreshCw, XCircle, Trash2 } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket?: any;
  onDelete?: (id: string) => void;
};

function StatusIcon({ status }: { status: string }) {
  if (status === "open") return <AlertCircle className="h-4 w-4 text-destructive" />;
  if (status === "in-progress") return <RefreshCw className="h-4 w-4 text-amber-400" />;
  if (status === "resolved") return <CheckCircle className="h-4 w-4 text-emerald-400" />;
  return <XCircle className="h-4 w-4 text-muted-foreground" />;
}

function PriorityIcon({ priority }: { priority: string }) {
  if (priority === "High") return <AlertTriangle className="h-4 w-4 text-red-500" />;
  if (priority === "Medium") return <AlertCircle className="h-4 w-4 text-amber-400" />;
  return <CheckCircle className="h-4 w-4 text-emerald-400" />;
}

export default function TicketDetailsDialog({ open, onOpenChange, ticket, onDelete }: Props) {
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const categoryBadgeClass = (cat?: string) => {
    switch ((cat || "").toLowerCase()) {
      case "mechanical":
        return "bg-emerald-100 text-emerald-800";
      case "electrical":
        return "bg-pink-100 text-pink-800";
      case "software":
        return "bg-sky-100 text-sky-800";
      default:
        return "bg-emerald-100 text-emerald-800";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4 w-full">
            <div>
              <DialogTitle className="text-lg font-semibold">{ticket?.title ?? "Ticket Details"}</DialogTitle>
              <div className="mt-2 flex items-center gap-4">
                <span className="rounded-md bg-muted/30 px-3 py-1 text-sm font-medium">{ticket?.id}</span>

                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full ${ticket?.priority === "High" ? "bg-red-100" : ticket?.priority === "Medium" ? "bg-amber-100" : "bg-emerald-100"}`}>
                    {ticket?.priority === "High" ? (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    ) : ticket?.priority === "Medium" ? (
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                    )}
                  </span>
                  <span className="text-sm font-medium">{ticket?.priority}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full ${ticket?.status === "open" ? "bg-red-100" : ticket?.status === "in-progress" ? "bg-amber-100" : ticket?.status === "resolved" ? "bg-emerald-100" : "bg-slate-100"}`}>
                    {ticket?.status === "open" ? (
                      <AlertCircle className="h-4 w-4 text-red-700" />
                    ) : ticket?.status === "in-progress" ? (
                      <RefreshCw className="h-4 w-4 text-amber-600" />
                    ) : ticket?.status === "resolved" ? (
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-slate-600" />
                    )}
                  </span>
                  <span className="text-sm font-medium">{ticket?.status?.replace("-", " ")}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button className="bg-purple-600 hover:bg-purple-500 text-white">Start Review</Button>
              <Button variant="ghost" onClick={() => setConfirmOpen((s) => !s)} className="text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <DialogDescription className="mt-3 text-sm text-muted-foreground">{ticket?.asset}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 pt-4">
          <div className="rounded-md border p-3 bg-muted/30">
            <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
            <p className="mt-2 text-sm">{ticket?.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-md border p-3 bg-muted/30">
              <h4 className="text-sm font-medium text-muted-foreground">Category</h4>
              <div className="mt-2"><Badge className={categoryBadgeClass(ticket?.category)}>{ticket?.category}</Badge></div>
            </div>

            <div className="rounded-md border p-3 bg-muted/30">
              <h4 className="text-sm font-medium text-muted-foreground">Created</h4>
              <div className="mt-2 text-sm text-muted-foreground">{ticket?.createdAt}</div>
            </div>
          </div>

          <div className="rounded-md border p-3 bg-muted/30">
            <h4 className="text-sm font-medium text-muted-foreground">Assigned To</h4>
            <div className="mt-2 text-sm">{ticket?.assignedTo ?? "Unassigned"}</div>
          </div>
        </div>
        {confirmOpen && (
          <div className="mt-4 rounded-md border p-4 bg-red-50">
            <h4 className="text-sm font-medium text-red-700">Delete Ticket</h4>
            <p className="mt-2 text-sm text-red-600">Are you sure you want to delete this ticket? This action cannot be undone.</p>
            <div className="mt-4 flex items-center gap-2">
              <Button className="bg-red-600 text-white" onClick={() => {
                if (ticket && typeof ticket.id === 'string') {
                  if (typeof onDelete === 'function') onDelete(ticket.id);
                  setConfirmOpen(false);
                  onOpenChange(false);
                }
              }}>Confirm Delete</Button>
              <Button variant="ghost" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
