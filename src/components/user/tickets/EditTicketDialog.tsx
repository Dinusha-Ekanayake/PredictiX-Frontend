"use client";

import * as React from "react";
import { toast } from "@/lib/customToast";
import { Loader2, Pencil } from "lucide-react";

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import type { Ticket, TicketPriority, TicketCategory } from "@/lib/ticketService";
import { updateMyTicket } from "@/lib/userTicketService";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: Ticket | null;
  onUpdated?: (ticket: Ticket) => void;
};

const CATEGORIES: TicketCategory[] = ["Mechanical", "Electrical", "Software"];

function toCategory(raw: string | null): TicketCategory {
  const m: Record<string, TicketCategory> = {
    mechanical: "Mechanical", electrical: "Electrical", software: "Software", general: "Mechanical",
  };
  return m[(raw ?? "").toLowerCase()] ?? "Mechanical";
}

export default function EditTicketDialog({ open, onOpenChange, ticket, onUpdated }: Props) {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [priority, setPriority] = React.useState<TicketPriority>("Medium");
  const [category, setCategory] = React.useState<TicketCategory>("Mechanical");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open && ticket) {
      setTitle(ticket.title ?? "");
      setDescription(ticket.description ?? "");
      setPriority(ticket.priority ?? "Medium");
      setCategory(toCategory(ticket.predicted_category ?? ticket.final_category));
    }
  }, [open, ticket]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ticket) return;
    if (!title.trim()) {
      toast.error("Please enter a title.");
      return;
    }
    setSaving(true);
    try {
      const updated = await updateMyTicket(ticket.id, {
        title: title.trim(),
        description: description.trim(),
        priority,
        category,
      });
      toast.success("Ticket updated", { description: updated.title });
      onUpdated?.(updated);
      onOpenChange(false);
    } catch (err) {
      toast.error("Failed to update ticket", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Pencil className="h-5 w-5" /> Edit Ticket
          </DialogTitle>
          <DialogDescription>Update the details of your ticket.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-3 pt-2">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Title</p>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Short title" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Description</p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-base min-h-27.5 resize-vertical"
              placeholder="Describe the issue"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Priority</p>
              <Select value={priority} onValueChange={(v) => setPriority(v as TicketPriority)}>
                <SelectTrigger className="w-full bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Category</p>
              <Select value={category} onValueChange={(v) => setCategory(v as TicketCategory)}>
                <SelectTrigger className="w-full bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : "Save Changes"}
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
