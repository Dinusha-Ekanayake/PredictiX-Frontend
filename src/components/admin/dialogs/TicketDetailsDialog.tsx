"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, AlertCircle, CheckCircle, Trash2, Loader2, Sparkles } from "lucide-react";
import { toast } from "@/lib/customToast";
import { 
  updateTicketStatus, 
  updateTicketPriority, 
  updateTicketAssignee, 
  fetchTicketAttachments,
  deleteTicketAttachment,
  addTicketAttachment,
  generateTicketSummaryById,
  generateAssetSummaryById,
  type Ticket,
  type TicketStatus, 
  type TicketPriority 
} from "@/lib/ticketService";
import { supabase } from "@/lib/supabaseBrowserClient";
import { getAssetDetail } from "@/components/admin/assets/assetService";
import type { AssetDetail } from "@/components/admin/assets/types";
import type { UserItem } from "@/lib/userService";
import { Input } from "@/components/ui/input";

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

  const [attachments, setAttachments] = React.useState<any[]>([]);
  const [attachmentsLoading, setAttachmentsLoading] = React.useState(false);
  const [fullSizeImage, setFullSizeImage] = React.useState<string | null>(null);
  const [file, setFile] = React.useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = React.useState(false);
  const [ticketSummary, setTicketSummary] = React.useState<string | null>(null);
  const [assetSummary, setAssetSummary] = React.useState<string | null>(null);
  const [regenTicket, setRegenTicket] = React.useState(false);
  const [regenAsset, setRegenAsset] = React.useState(false);

  async function handleRegenTicketSummary() {
    if (!ticket) return;
    setRegenTicket(true);
    try {
      const res = await generateTicketSummaryById(ticket.id);
      setTicketSummary(res.summary);
      toast.success("Ticket summary generated");
    } catch (e) {
      toast.error("Failed to generate ticket summary", {
        description: e instanceof Error ? e.message : undefined,
      });
    } finally {
      setRegenTicket(false);
    }
  }

  async function handleRegenAssetSummary() {
    if (!ticket?.asset_id) return;
    setRegenAsset(true);
    try {
      const res = await generateAssetSummaryById(ticket.asset_id);
      setAssetSummary(res.summary);
      toast.success("Asset summary generated");
    } catch (e) {
      toast.error("Failed to generate asset summary", {
        description: e instanceof Error ? e.message : undefined,
      });
    } finally {
      setRegenAsset(false);
    }
  }

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
      setTicketSummary(ticket.ticket_summary ?? null);
      setAssetSummary(ticket.asset_summary ?? null);

      if (ticket.asset_id && open) {
        setAssetLoading(true);
        getAssetDetail(ticket.asset_id)
          .then(setAssetDetail)
          .catch((err) => console.error("Failed to load asset detail", err))
          .finally(() => setAssetLoading(false));
      } else {
        setAssetDetail(null);
      }

      if (open) {
        setAttachmentsLoading(true);
        fetchTicketAttachments(ticket.id)
          .then(setAttachments)
          .catch(console.error)
          .finally(() => setAttachmentsLoading(false));
      } else {
        setAttachments([]);
      }
    }
    if (!open) {
      setConfirmOpen(false);
      setFullSizeImage(null);
      setFile(null);
    }
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

  async function handleDeleteAttachment(attachmentId: string) {
    if (!confirm("Are you sure you want to delete this attachment?")) return;
    try {
      await deleteTicketAttachment(attachmentId);
      setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
      toast.success("Attachment deleted");
    } catch (err: any) {
      toast.error("Failed to delete attachment", { description: err?.message });
    }
  }

  async function handleUploadAttachment() {
    if (!file || !ticket || !supabase) return;
    setUploadingImage(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("ticket-attachments")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("ticket-attachments")
        .getPublicUrl(fileName);

      if (publicUrlData?.publicUrl) {
        await addTicketAttachment(
          ticket.id,
          publicUrlData.publicUrl,
          file.type,
          file.name
        );
        const updated = await fetchTicketAttachments(ticket.id);
        setAttachments(updated);
        setFile(null);
        toast.success("Attachment uploaded");
      }
    } catch (err: any) {
      toast.error("Failed to upload attachment", { description: err?.message });
    } finally {
      setUploadingImage(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px] max-h-[90vh] overflow-y-auto">
        {/* Full size image overlay */}
        {fullSizeImage && (
          <div 
            className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4 cursor-zoom-out"
            onClick={() => setFullSizeImage(null)}
          >
            <img 
              src={fullSizeImage} 
              alt="Full size" 
              className="max-w-full max-h-full object-contain cursor-default"
              onClick={(e) => e.stopPropagation()}
            />
            <Button 
              variant="secondary" 
              size="icon" 
              className="absolute top-4 right-4 rounded-full"
              onClick={() => setFullSizeImage(null)}
            >
              <AlertCircle className="h-0 w-0 hidden" /> {/* dummy icon */}
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
            </Button>
          </div>
        )}

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

          {/* Attachments */}
          <div className="rounded-md border p-3 bg-muted/30">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Attachments</h4>
            {attachmentsLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading attachments…
              </div>
            ) : (
              <div className="space-y-4">
                {attachments.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {attachments.map((a) => (
                      <div key={a.id} className="relative group rounded-md border bg-background overflow-hidden w-24 h-24 flex items-center justify-center">
                        <img 
                          src={a.file_path} 
                          alt={a.original_filename || "Attachment"} 
                          className="object-cover w-full h-full cursor-zoom-in"
                          onClick={() => setFullSizeImage(a.file_path)}
                        />
                        {isAdmin && (
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button 
                              variant="destructive" 
                              size="icon" 
                              className="h-7 w-7 rounded-full"
                              onClick={() => handleDeleteAttachment(a.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No attachments.</p>
                )}
                
                {isAdmin && (
                  <div className="mt-3 flex items-end gap-2 max-w-sm">
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-1">Upload New Image</p>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        disabled={uploadingImage}
                        className="cursor-pointer file:text-foreground file:bg-transparent file:border-0 file:text-sm file:font-medium h-9"
                      />
                    </div>
                    <Button 
                      onClick={handleUploadAttachment} 
                      disabled={!file || uploadingImage}
                      size="sm"
                      className="h-9"
                    >
                      {uploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : "Upload"}
                    </Button>
                  </div>
                )}
              </div>
            )}
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

          {/* AI Summaries (local ONNX Seq2Seq models) */}
          {ticket && (
            <div className="rounded-md border p-3 bg-violet-50/40 dark:bg-violet-950/20">
              <h4 className="text-sm font-medium text-violet-700 dark:text-violet-400 mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                AI Summaries
              </h4>

              <div className="mb-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-muted-foreground">Ticket summary</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={handleRegenTicketSummary}
                    disabled={regenTicket}
                  >
                    {regenTicket ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5" />
                    )}
                    <span className="ml-1">{ticketSummary ? "Regenerate" : "Generate"}</span>
                  </Button>
                </div>
                <p className="mt-1 text-sm">
                  {ticketSummary || (
                    <span className="italic text-muted-foreground">No ticket summary yet.</span>
                  )}
                </p>
              </div>

              {ticket.asset_id && (
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-muted-foreground">Asset summary</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={handleRegenAssetSummary}
                      disabled={regenAsset}
                    >
                      {regenAsset ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5" />
                      )}
                      <span className="ml-1">{assetSummary ? "Regenerate" : "Generate"}</span>
                    </Button>
                  </div>
                  <p className="mt-1 text-sm">
                    {assetSummary || (
                      <span className="italic text-muted-foreground">No asset summary yet.</span>
                    )}
                  </p>
                </div>
              )}
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
