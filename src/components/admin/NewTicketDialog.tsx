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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Loader2, Plus } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function generateId() {
  return `T${Math.floor(Math.random() * 9000) + 100}`;
}

export default function NewTicketDialog({ open, onOpenChange }: Props) {
  const [asset, setAsset] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [priority, setPriority] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setAsset("");
        setTitle("");
        setDescription("");
        setPriority("");
        setCategory("");
        setIsSubmitting(false);
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
    await new Promise((r) => setTimeout(r, 800));

    const newTicket = {
      id: generateId(),
      asset: asset || "Unknown",
      title: title.trim(),
      description: description.trim(),
      priority: priority || "Medium",
      category: category || "General",
      createdAt: new Date().toISOString(),
    };

    setIsSubmitting(false);
    onOpenChange(false);
    toast.success("Ticket created", { description: `${newTicket.id} — ${newTicket.title}` });
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
          <div>
            <p className="text-sm text-muted-foreground mb-2">Asset</p>
            <Select value={asset} onValueChange={(v) => setAsset(v)}>
              <SelectTrigger className="w-full bg-background">
                <SelectValue placeholder="Select an asset" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Compressor A-14">Compressor A-14</SelectItem>
                <SelectItem value="Pump P-09">Pump P-09</SelectItem>
                <SelectItem value="Motor M-02">Motor M-02</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-2">Title</p>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Short title for the ticket" />
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-2">Description</p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-base min-h-[110px] resize-vertical"
              placeholder="Describe the issue in detail"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Priority</p>
              <Select value={priority} onValueChange={(v) => setPriority(v)}>
                <SelectTrigger className="w-full bg-background">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Category</p>
              <Select value={category} onValueChange={(v) => setCategory(v)}>
                <SelectTrigger className="w-full bg-background">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mechanical">Mechanical</SelectItem>
                  <SelectItem value="Electrical">Electrical</SelectItem>
                  <SelectItem value="Sensors">Sensors</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
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
