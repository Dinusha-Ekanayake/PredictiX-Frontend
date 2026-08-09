"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, AlertCircle, CheckCircle, Trash2, Loader2, Sparkles, RefreshCw, XCircle } from "lucide-react";
import { toast } from "@/lib/customToast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  updateTicketStatus, 
  updateTicketPriority, 
  updateTicketAssignee, 
  fetchTicketAttachments,
  deleteTicketAttachment,
  addTicketAttachment,
  generateTicketSummaryById,
  generateAssetSummaryById,
  fetchTicketEnrichment,
  fetchTicketComments,
  createTicketComment,
  deleteTicketComment,
  askChatbotAgent,
  type Ticket,
  type TicketStatus, 
  type TicketPriority 
} from "@/lib/ticketService";
import TicketDetailsCharts from "@/components/admin/tickets/TicketDetailsCharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, User as UserIcon, Bot, Trash, MessageSquare, ShieldAlert, History } from "lucide-react";
import { supabase } from "@/lib/supabaseBrowserClient";
import { getAssetDetail } from "@/components/admin/assets/assetService";
import type { AssetDetail } from "@/components/admin/assets/types";
import type { UserItem } from "@/lib/userService";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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
  const [history, setHistory] = React.useState<any[]>([]);
  const [comments, setComments] = React.useState<any[]>([]);
  const [commentsLoading, setCommentsLoading] = React.useState(false);

  const [currentUserId, setCurrentUserId] = React.useState<string>("");
  const [currentUserRole, setCurrentUserRole] = React.useState<string>("");
  const [currentUserName, setCurrentUserName] = React.useState<string>("");

  const [discussionInput, setDiscussionInput] = React.useState("");
  const [notesInput, setNotesInput] = React.useState("");
  const [postingComment, setPostingComment] = React.useState(false);

  const [copilotMessages, setCopilotMessages] = React.useState<Array<{ role: string; content: string }>>([
    { role: "assistant", content: "👋 Hi! I am your AI Diagnostics Copilot. Ask me anything about this ticket, its failure diagnostics, or repair manuals!" }
  ]);
  const [copilotInput, setCopilotInput] = React.useState("");
  const [copilotLoading, setCopilotLoading] = React.useState(false);
  
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
    setCurrentUserId(window.localStorage.getItem("predictix.user.id") || "");
    setCurrentUserRole(window.localStorage.getItem("predictix.user.role") || "");
    setCurrentUserName(window.localStorage.getItem("predictix.user.name") || "");
  }, []);

  const isTechnician = React.useMemo(() => {
    const r = (currentUserRole || "").toLowerCase();
    if (r === "admin" || r === "superadmin" || r === "super_admin") return true;
    const userObj = users?.find((u) => u.id === currentUserId);
    return userObj?.department?.toLowerCase().includes("maintenance") || false;
  }, [users, currentUserId, currentUserRole]);

  const hasAdminAccess = React.useMemo(() => {
    if (isAdmin) return true;
    const r = (currentUserRole || "").toLowerCase();
    return r === "admin" || r === "superadmin" || r === "super_admin";
  }, [isAdmin, currentUserRole]);

  const canDelete = React.useMemo(() => {
    const role = (currentUserRole || "").toLowerCase();
    if (role === "admin" || role === "superadmin" || role === "super_admin") {
      return true;
    }
    if (ticket && currentUserId && ticket.created_by === currentUserId) {
      return true;
    }
    return false;
  }, [currentUserRole, currentUserId, ticket]);

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

        fetchTicketEnrichment(ticket)
          .then((enrich) => {
            setHistory(enrich.history || []);
          })
          .catch((err) => console.error("Failed to load ticket history:", err));

        setCommentsLoading(true);
        fetchTicketComments(ticket.id)
          .then(setComments)
          .catch(console.error)
          .finally(() => setCommentsLoading(false));
      } else {
        setAttachments([]);
        setHistory([]);
        setComments([]);
      }
    }
    if (!open) {
      setConfirmOpen(false);
      setFullSizeImage(null);
      setFile(null);
    }
  }, [ticket, open]);

  async function handleStatusChange(newStatus: TicketStatus) {
    if (!ticket || newStatus === localStatus) return;
    setStatusUpdating(true);
    const prev = localStatus;
    setLocalStatus(newStatus);
    try {
      await updateTicketStatus(ticket.id, newStatus);
      onUpdated?.({ ...ticket, status: newStatus, priority: localPriority });
      
      // Append a new status history log dynamically so the Audit Log updates instantly!
      const newLog = {
        id: crypto.randomUUID(),
        ticket_id: ticket.id,
        old_status: prev,
        new_status: newStatus,
        changed_by: currentUserId || null,
        note: "",
        created_at: new Date().toISOString()
      };
      setHistory((prevHist) => [newLog, ...prevHist]);
      
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

  async function handlePostComment(isInternal: boolean) {
    const input = isInternal ? notesInput : discussionInput;
    if (!ticket || !currentUserId || !input.trim() || postingComment) return;
    setPostingComment(true);
    try {
      const newComment = await createTicketComment(ticket.id, currentUserId, input.trim(), isInternal);
      setComments((prev) => [...prev, newComment]);
      if (isInternal) setNotesInput("");
      else setDiscussionInput("");
      toast.success(isInternal ? "Private note added" : "Comment added");
    } catch (err: any) {
      toast.error("Failed to add comment", { description: err?.message });
    } finally {
      setPostingComment(false);
    }
  }

  async function handleDeleteComment(commentId: string) {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    try {
      await deleteTicketComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      toast.success("Comment deleted");
    } catch (err: any) {
      toast.error("Failed to delete comment", { description: err?.message });
    }
  }

  async function handleSendCopilot() {
    if (!copilotInput.trim() || copilotLoading || !ticket) return;
    const userMsg = copilotInput.trim();
    setCopilotInput("");
    setCopilotMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setCopilotLoading(true);

    try {
      const context = {
        ticket_id: ticket.id,
        title: ticket.title,
        description: ticket.description,
        status: localStatus,
        priority: localPriority,
        asset_name: ticket.asset_name,
        predicted_category: ticket.predicted_category || ticket.final_category,
      };
      const activeHistory = copilotMessages.slice(-10);
      const res = await askChatbotAgent(userMsg, activeHistory, context);
      setCopilotMessages((prev) => [...prev, { role: "assistant", content: res.answer }]);
    } catch (err: any) {
      toast.error("AI Copilot failed", { description: err?.message });
      setCopilotMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Sorry, I encountered an error while processing your request." }
      ]);
    } finally {
      setCopilotLoading(false);
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
                  <span className="text-sm font-medium">{localPriority}</span>
                </div>

                {/* Status */}
                <div className="flex items-center gap-1.5">
                  {hasAdminAccess ? (
                    statusUpdating ? (
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />Updating…
                      </span>
                    ) : (
                      <Select
                        value={localStatus}
                        onValueChange={(val) => handleStatusChange(val as TicketStatus)}
                        disabled={statusUpdating}
                      >
                        <SelectTrigger className="w-[155px] h-8 text-xs font-semibold">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-3.5 w-3.5 text-rose-500 animate-pulse" />
                              <span>Open</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="in-progress">
                            <div className="flex items-center gap-2">
                              <RefreshCw className="h-3.5 w-3.5 text-amber-500" />
                              <span>In Progress</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="resolved">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                              <span>Resolved</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="closed">
                            <div className="flex items-center gap-2">
                              <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>Closed</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )
                  ) : (
                    <span className="text-sm font-medium capitalize flex items-center gap-1.5">
                      {localStatus === "open" && <AlertCircle className="h-3.5 w-3.5 text-rose-500 animate-pulse" />}
                      {localStatus === "in-progress" && <RefreshCw className="h-3.5 w-3.5 text-amber-500" />}
                      {localStatus === "resolved" && <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />}
                      {localStatus === "closed" && <XCircle className="h-3.5 w-3.5 text-muted-foreground" />}
                      {localStatus.replace("-", " ")}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {canDelete && (
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

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-4 bg-muted/40 p-1 rounded-xl mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="discussion">Discussion</TabsTrigger>
            {isTechnician && <TabsTrigger value="notes">Private Notes</TabsTrigger>}
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="grid gap-4 mt-0">
            <div className="rounded-md border p-3 bg-muted/30">
              <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
              <p className="mt-2 text-sm">{ticket?.description ?? "No description provided."}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md border p-3 bg-muted/30">
                <h4 className="text-sm font-medium text-muted-foreground">Category</h4>
                <div className="mt-2">
                  <Badge className={categoryBadgeClass(category)}>
                    {category ?? "Mechanical"}
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
                           {hasAdminAccess && (
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
                  
                  {hasAdminAccess && (
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
                {hasAdminAccess ? (
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
            {ticket?.asset_id && assetDetail && assetDetail.prediction && (
              <div className="rounded-md border p-3 bg-indigo-50/50 dark:bg-indigo-950/20">
                <h4 className="text-sm font-medium text-indigo-700 dark:text-indigo-400 mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Predictive Insights
                </h4>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
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
                  {assetDetail.prediction.estimated_cost_lkr !== null && (
                    <div>
                      <span className="text-muted-foreground">Est. Cost:</span>{" "}
                      <span className="font-medium">
                        LKR {Number(assetDetail.prediction.estimated_cost_lkr).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* AI Summaries */}
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

            {ticket && (
              <TicketDetailsCharts
                ticketId={ticket.id}
                createdAt={ticket.created_at}
                resolvedAt={ticket.resolved_at || null}
                closedAt={ticket.closed_at || null}
                currentStatus={localStatus}
                history={history}
                assetId={ticket.asset_id}
              />
            )}
          </TabsContent>

          <TabsContent value="discussion" className="space-y-4 pt-1">
            <div className="rounded-xl border border-border bg-card p-4 flex flex-col h-[400px]">
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                {commentsLoading ? (
                  <div className="flex h-full items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading discussion...
                  </div>
                ) : comments.filter(c => !c.is_internal).length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                    <MessageSquare className="h-8 w-8 text-slate-400" />
                    <p className="text-sm italic">No messages yet. Start the discussion below!</p>
                  </div>
                ) : (
                  comments.filter(c => !c.is_internal).map((c) => {
                    const commenterName = users?.find(u => u.id === c.user_id)?.name ?? "User";
                    const isMe = c.user_id === currentUserId;
                    return (
                      <div key={c.id} className={cn("flex flex-col gap-1 max-w-[85%] rounded-2xl p-3 text-sm shadow-xs", isMe ? "ml-auto bg-violet-600 text-white rounded-tr-none" : "mr-auto bg-muted rounded-tl-none text-foreground")}>
                        <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-1 mb-1">
                          <span className="font-semibold text-xs">{commenterName}</span>
                          <span className="text-[10px] opacity-75">{new Date(c.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <p className="leading-relaxed whitespace-pre-wrap">{c.comment}</p>
                        {(isMe || hasAdminAccess) && (
                          <button onClick={() => handleDeleteComment(c.id)} className="self-end mt-1 text-[10px] opacity-60 hover:opacity-100 flex items-center gap-0.5 hover:text-red-400">
                            <Trash className="h-3 w-3" /> Delete
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
              <div className="mt-3 pt-3 border-t border-border flex items-center gap-2">
                <Input
                  value={discussionInput}
                  onChange={(e) => setDiscussionInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 h-10"
                  onKeyDown={(e) => { if (e.key === 'Enter') handlePostComment(false); }}
                  disabled={postingComment}
                />
                <Button onClick={() => handlePostComment(false)} disabled={!discussionInput.trim() || postingComment} className="h-10 px-4">
                  {postingComment ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </TabsContent>

          {isTechnician && (
            <TabsContent value="notes" className="space-y-4 pt-1">
              <div className="rounded-xl border border-amber-200/50 dark:border-amber-900/30 bg-amber-50/10 dark:bg-amber-950/5 p-4 flex flex-col h-[400px]">
                <div className="mb-2 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-semibold uppercase tracking-wider">
                  <ShieldAlert className="h-3.5 w-3.5" /> Collaborative Team Notes (Technicians & Admins Only)
                </div>
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                  {commentsLoading ? (
                    <div className="flex h-full items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" /> Loading notes...
                    </div>
                  ) : comments.filter(c => c.is_internal).length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                      <ShieldAlert className="h-8 w-8 text-amber-500/50" />
                      <p className="text-sm italic">No team notes yet. Share workarounds or internal details!</p>
                    </div>
                  ) : (
                    comments.filter(c => c.is_internal).map((c) => {
                      const commenterName = users?.find(u => u.id === c.user_id)?.name ?? "User";
                      const isMe = c.user_id === currentUserId;
                      return (
                        <div key={c.id} className={cn("flex flex-col gap-1 max-w-[85%] rounded-2xl p-3 text-sm shadow-xs border", isMe ? "ml-auto bg-amber-500/20 border-amber-300/30 dark:bg-amber-500/10 text-foreground rounded-tr-none" : "mr-auto bg-muted/80 border-border rounded-tl-none text-foreground")}>
                          <div className="flex items-center justify-between gap-4 border-b border-border pb-1 mb-1">
                            <span className="font-semibold text-xs text-amber-700 dark:text-amber-400">{commenterName}</span>
                            <span className="text-[10px] opacity-75">{new Date(c.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          </div>
                          <p className="leading-relaxed whitespace-pre-wrap">{c.comment}</p>
                          {(isMe || hasAdminAccess) && (
                            <button onClick={() => handleDeleteComment(c.id)} className="self-end mt-1 text-[10px] opacity-60 hover:opacity-100 flex items-center gap-0.5 hover:text-red-500">
                              <Trash className="h-3 w-3" /> Delete
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
                <div className="mt-3 pt-3 border-t border-border flex items-center gap-2">
                  <Input
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    placeholder="Type an internal note..."
                    className="flex-1 h-10 border-amber-200/50 dark:border-amber-900/30"
                    onKeyDown={(e) => { if (e.key === 'Enter') handlePostComment(true); }}
                    disabled={postingComment}
                  />
                  <Button onClick={() => handlePostComment(true)} disabled={!notesInput.trim() || postingComment} className="h-10 px-4 bg-amber-600 hover:bg-amber-700 text-white">
                    {postingComment ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </TabsContent>
          )}

          <TabsContent value="audit" className="space-y-4 pt-1">
            <div className="rounded-xl border border-border bg-card p-4 flex flex-col h-[400px]">
              <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                <History className="h-3.5 w-3.5" /> System Audit Trail (Read Only)
              </div>
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
                {history.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground italic">
                    No status history logged yet.
                  </div>
                ) : (
                  <div className="relative pl-6 border-l border-border space-y-6 py-2 ml-3">
                    {history.map((h, idx) => {
                      const user = users?.find(u => u.id === h.changed_by)?.name ?? "System";
                      return (
                        <div key={h.id || idx} className="relative">
                          {/* Timeline dot */}
                          <div className="absolute -left-[30px] top-1 h-3 w-3 rounded-full bg-violet-600 border-2 border-background" />
                          <div className="text-sm">
                            <span className="font-semibold text-foreground capitalize">{user}</span> updated status
                            {h.old_status && (
                              <> from <span className="font-medium text-slate-500 capitalize">{h.old_status.replace("-", " ")}</span></>
                            )} to <span className="font-semibold text-violet-600 dark:text-violet-400 capitalize">{h.new_status.replace("-", " ")}</span>
                          </div>
                          {h.note && (
                            <p className="mt-1 text-xs text-muted-foreground bg-muted p-2 rounded-md border italic">"{h.note}"</p>
                          )}
                          <div className="text-[10px] text-muted-foreground mt-1">
                            {new Date(h.created_at).toLocaleString()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

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
