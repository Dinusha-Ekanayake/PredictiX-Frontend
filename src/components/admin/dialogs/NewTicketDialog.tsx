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
import { apiGet } from "@/lib/apiClient";
import { createTicket, type Ticket, type TicketPriority, type TicketCategory } from "@/lib/ticketService";

type Asset = {
  id: string;
  asset_name: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (ticket: Ticket) => void;
};

export default function NewTicketDialog({ open, onOpenChange, onCreated }: Props) {
  const [assetId, setAssetId] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [priority, setPriority] = React.useState<TicketPriority | "">("");
  const [category, setCategory] = React.useState<TicketCategory | "">("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [assets, setAssets] = React.useState<Asset[]>([]);
  const [assetsLoading, setAssetsLoading] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setAssetsLoading(true);
      apiGet<Asset[]>("/assets/")
        .then((data) => setAssets(data))
        .catch(() => toast.error("Failed to load assets"))
        .finally(() => setAssetsLoading(false));
    } else {
      const t = setTimeout(() => {
        setAssetId("");
        setTitle("");
        setDescription("");
        setPriority("");
        setCategory("");
        setIsSubmitting(false);
        setAssets([]);
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
      const ticket = await createTicket({
        asset_id: assetId || null,
        title: title.trim(),
        description: description.trim(),
        priority: (priority as TicketPriority) || "Medium",
        category: (category as TicketCategory) || "Mechanical",
      });
      toast.success("Ticket created", { description: ticket.title });
      onCreated?.(ticket);
      onOpenChange(false);
    } catch (err) {
      toast.error("Failed to create ticket", {
        description: err instanceof Error ? err.message : undefined,
      });
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
          <div>
            <p className="text-sm text-muted-foreground mb-2">Asset</p>
            <Select value={assetId} onValueChange={(v) => setAssetId(v)} disabled={assetsLoading}>
              <SelectTrigger className="w-full bg-background">
                {assetsLoading ? (
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Loading assets…
                  </span>
                ) : (
                  <SelectValue placeholder="Select an asset" />
                )}
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {assets.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">No assets found</div>
                ) : (
                  assets.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.asset_name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-2">Title</p>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Short title for the ticket"
            />
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
              <Select value={priority} onValueChange={(v) => setPriority(v as TicketPriority)}>
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
              <Select value={category} onValueChange={(v) => setCategory(v as TicketCategory)}>
                <SelectTrigger className="w-full bg-background">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mechanical">Mechanical</SelectItem>
                  <SelectItem value="Electrical">Electrical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

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
