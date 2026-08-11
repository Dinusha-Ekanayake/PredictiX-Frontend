"use client";

/**
 * Detail / edit / comments dialog for the user role.
 *
 * Loads the full ticket from GET /user/tickets/{id}, lets the owner edit
 * title / description / priority (PUT /user/tickets/{id}), and lists +
 * posts comments. No delete button, no status transition controls — those
 * are admin-only.
 */

import * as React from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Loader2,
  MessageSquare,
  Pencil,
  RefreshCw,
  Send,
  Sparkles,
  XCircle,
} from "lucide-react";
import { toast } from "@/lib/customToast";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  addMyTicketComment,
  getMyTicket,
  regenerateMyTicketSummary,
  regenerateMyAssetSummary,
  updateMyTicket,
  type UserTicketDetail,
} from "@/lib/api/userTickets";
import { listUsers, type UserItem } from "@/lib/userService";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketId: string | null;
  currentUserId: string | null;
  onUpdated?: (ticket: UserTicketDetail) => void;
  /** Pass the parent page's already-loaded user list to skip this dialog's
   * own GET /users/ fetch (used only to resolve id -> name). */
  users?: UserItem[];
};

function StatusIcon({ status }: { status: string }) {
  if (status === "open") return <AlertCircle className="h-4 w-4 text-destructive" />;
  if (status === "in-progress" || status === "in_progress")
    return <RefreshCw className="h-4 w-4 text-amber-400" />;
  if (status === "resolved") return <CheckCircle className="h-4 w-4 text-emerald-400" />;
  return <XCircle className="h-4 w-4 text-muted-foreground" />;
}

function PriorityIcon({ priority }: { priority: string | null | undefined }) {
  const p = (priority || "").toLowerCase();
  if (p === "high" || p === "critical")
    return <AlertTriangle className="h-4 w-4 text-red-500" />;
  if (p === "medium") return <AlertCircle className="h-4 w-4 text-amber-400" />;
  return <CheckCircle className="h-4 w-4 text-emerald-400" />;
}

function formatTimestamp(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function UserTicketDetailsDialog({
  open,
  onOpenChange,
  ticketId,
  currentUserId,
  onUpdated,
  users: usersProp,
}: Props) {
  const [ticket, setTicket] = React.useState<UserTicketDetail | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [editing, setEditing] = React.useState(false);
  const [savingEdit, setSavingEdit] = React.useState(false);
  const [commentText, setCommentText] = React.useState("");
  const [postingComment, setPostingComment] = React.useState(false);
  const [fetchedUsers, setFetchedUsers] = React.useState<UserItem[]>([]);
  // Prefer the parent's already-loaded list; fall back to this dialog's own fetch.
  const users = usersProp ?? fetchedUsers;

  // Edit form state — local until saved.
  const [editTitle, setEditTitle] = React.useState("");
  const [editDescription, setEditDescription] = React.useState("");
  const [editPriority, setEditPriority] = React.useState<string>("");

  const [fullSizeImage, setFullSizeImage] = React.useState<string | null>(null);
  const [regenSummary, setRegenSummary] = React.useState(false);
  const [regenAsset, setRegenAsset] = React.useState(false);

  async function handleRegenerateSummary() {
    if (!ticket) return;
    setRegenSummary(true);
    try {
      const res = await regenerateMyTicketSummary(ticket.id);
      setTicket({ ...ticket, ticket_summary: res.summary });
      toast.success("AI summary generated");
    } catch (e) {
      toast.error("Failed to generate summary", {
        description: e instanceof Error ? e.message : undefined,
      });
    } finally {
      setRegenSummary(false);
    }
  }

  async function handleRegenerateAssetSummary() {
    if (!ticket?.asset_id) return;
    setRegenAsset(true);
    try {
      const res = await regenerateMyAssetSummary(ticket.asset_id);
      setTicket({ ...ticket, asset_summary: res.summary });
      toast.success("Asset summary generated");
    } catch (e) {
      toast.error("Failed to generate asset summary", {
        description: e instanceof Error ? e.message : undefined,
      });
    } finally {
      setRegenAsset(false);
    }
  }

  React.useEffect(() => {
    if (!open || !ticketId) return;
    let cancelled = false;

    setLoading(true);
    setEditing(false);
    setCommentText("");
    getMyTicket(ticketId)
      .then((t) => {
        if (cancelled) return;
        setTicket(t);
        setEditTitle(t.title);
        setEditDescription(t.description);
        setEditPriority(t.priority || "");
      })
      .catch((err: Error) => {
        if (cancelled) return;
        toast.error(err.message || "Could not load ticket");
        onOpenChange(false);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    if (!usersProp) {
      listUsers()
        .then((data) => {
          if (!cancelled) setFetchedUsers(data ?? []);
        })
        .catch((err) => console.error("Failed to load users:", err));
    }

    return () => {
      cancelled = true;
    };
  }, [open, ticketId, onOpenChange, usersProp]);

  const userMap = React.useMemo(() => {
    const map = new Map<string, string>();
    users.forEach((u) => {
      map.set(u.id, u.name);
    });
    return map;
  }, [users]);

  const isOwner = !!ticket && !!currentUserId && ticket.created_by === currentUserId;

  async function handleSaveEdit() {
    if (!ticket) return;

    const payload: Record<string, string> = {};
    if (editTitle.trim() && editTitle !== ticket.title) payload.title = editTitle.trim();
    if (editDescription.trim() && editDescription !== ticket.description)
      payload.description = editDescription.trim();
    if (editPriority && editPriority !== (ticket.priority ?? ""))
      payload.priority = editPriority;

    if (Object.keys(payload).length === 0) {
      setEditing(false);
      return;
    }

    setSavingEdit(true);
    try {
      const updated = await updateMyTicket(ticket.id, payload);
      setTicket(updated);
      setEditing(false);
      toast.success("Ticket updated");
      onUpdated?.(updated);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Update failed";
      toast.error(msg);
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleAddComment() {
    if (!ticket || !commentText.trim()) return;
    setPostingComment(true);
    try {
      const newComment = await addMyTicketComment(ticket.id, commentText.trim());
      setTicket({ ...ticket, comments: [...ticket.comments, newComment] });
      setCommentText("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not post comment";
      toast.error(msg);
    } finally {
      setPostingComment(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
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
              <XCircle className="h-5 w-5" />
            </Button>
          </div>
        )}

        {loading || !ticket ? (
          <>
            {/* Radix requires a DialogTitle for screen readers. The loading
                state has no meaningful title, so we hide it visually. */}
            <VisuallyHidden>
              <DialogTitle>Loading ticket</DialogTitle>
            </VisuallyHidden>
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-start justify-between gap-4 w-full">
                <div className="flex-1 min-w-0">
                  <DialogTitle className="text-lg font-semibold truncate">
                    {ticket.title}
                  </DialogTitle>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <span className="rounded-md bg-muted/30 px-3 py-1 text-sm font-medium">
                      {ticket.ticket_number}
                    </span>

                    <div className="flex items-center gap-2">
                      <PriorityIcon priority={ticket.final_priority || ticket.priority} />
                      <span className="text-sm font-medium capitalize">
                        {ticket.final_priority || ticket.priority || "unset"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <StatusIcon status={ticket.status} />
                      <span className="text-sm font-medium capitalize">
                        {ticket.status.replace(/[-_]/g, " ")}
                      </span>
                    </div>
                  </div>
                </div>

                {isOwner && !editing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditing(true)}
                    className="shrink-0"
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                )}
              </div>

              <DialogDescription className="mt-3 text-sm text-muted-foreground">
                Opened {formatTimestamp(ticket.created_at)}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 pt-4">
              {/* Description / Edit form */}
              {editing ? (
                <div className="rounded-md border p-3 bg-muted/30 space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Title</p>
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      disabled={savingEdit}
                    />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Description</p>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      disabled={savingEdit}
                      className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm min-h-27.5 resize-vertical"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Priority</p>
                      <Select
                        value={editPriority}
                        onValueChange={(v) => setEditPriority(v)}
                        disabled={savingEdit}
                      >
                        <SelectTrigger className="w-full bg-background">
                          <SelectValue placeholder="Unset" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => setEditing(false)}
                      disabled={savingEdit}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSaveEdit} disabled={savingEdit}>
                      {savingEdit ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving…
                        </>
                      ) : (
                        "Save"
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="rounded-md border p-3 bg-muted/30">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Description
                    </h4>
                    <p className="mt-2 text-sm whitespace-pre-wrap">
                      {ticket.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-md border p-3 bg-muted/30">
                      <h4 className="text-sm font-medium text-muted-foreground">Category</h4>
                      <div className="mt-2">
                        <Badge className="bg-sky-100 text-sky-800">
                          {ticket.final_category || ticket.predicted_category || "Mechanical"}
                        </Badge>
                      </div>
                    </div>

                    <div className="rounded-md border p-3 bg-muted/30">
                      <h4 className="text-sm font-medium text-muted-foreground">Assigned To</h4>
                      <div className="mt-2 text-sm">
                        {ticket.assigned_to ? (
                          <Badge className="bg-purple-100 text-purple-800">
                            {userMap.get(ticket.assigned_to) ?? ticket.assigned_to.slice(0, 8)}
                          </Badge>
                        ) : (
                          <span className="italic text-muted-foreground">Unassigned</span>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* AI fields */}
              {ticket && (
                <div className="rounded-md border p-3 bg-violet-50/40 dark:bg-violet-950/20">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-violet-500" />
                    AI insights
                  </h4>
                  <div className="mt-2 space-y-3 text-sm">
                    {/* Ticket summary */}
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-muted-foreground">Ticket summary</span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={handleRegenerateSummary}
                          disabled={regenSummary}
                        >
                          {regenSummary ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <RefreshCw className="h-3.5 w-3.5" />
                          )}
                          <span className="ml-1">
                            {ticket.ticket_summary ? "Regenerate" : "Generate"}
                          </span>
                        </Button>
                      </div>
                      <p className="mt-1 text-sm">
                        {ticket.ticket_summary || (
                          <span className="italic text-muted-foreground">
                            No ticket summary yet — click Generate.
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Asset summary */}
                    {ticket.asset_id && (
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-medium text-muted-foreground">Asset summary</span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={handleRegenerateAssetSummary}
                            disabled={regenAsset}
                          >
                            {regenAsset ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <RefreshCw className="h-3.5 w-3.5" />
                            )}
                            <span className="ml-1">
                              {ticket.asset_summary ? "Regenerate" : "Generate"}
                            </span>
                          </Button>
                        </div>
                        <p className="mt-1 text-sm">
                          {ticket.asset_summary || (
                            <span className="italic text-muted-foreground">
                              No asset summary yet — click Generate.
                            </span>
                          )}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {ticket.predicted_category && (
                        <Badge className="bg-sky-100 text-sky-800">
                          Category: {ticket.predicted_category}
                        </Badge>
                      )}
                      {ticket.predicted_priority && (
                        <Badge className="bg-amber-100 text-amber-800">
                          Predicted: {ticket.predicted_priority}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Attachments */}
              {ticket.attachments && ticket.attachments.length > 0 && (
                <div className="rounded-md border p-3 bg-muted/30">
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">
                    Attachments
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {ticket.attachments.map((a) => (
                      <div 
                        key={a.id} 
                        className="relative group cursor-zoom-in rounded-md border bg-background overflow-hidden w-24 h-24 flex items-center justify-center"
                        onClick={() => setFullSizeImage(a.file_path)}
                      >
                        <img 
                          src={a.file_path} 
                          alt={a.original_filename || "Attachment"} 
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* History (read-only) */}
              {ticket.history.length > 0 && (
                <div className="rounded-md border p-3 bg-muted/30">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Status history
                  </h4>
                  <ul className="mt-2 space-y-1 text-sm">
                    {ticket.history.map((h) => (
                      <li key={h.id} className="flex items-center gap-2">
                        <span className="text-muted-foreground">
                          {formatTimestamp(h.created_at)}
                        </span>
                        <span>
                          {h.old_status ? `${h.old_status} → ` : ""}
                          <span className="font-medium capitalize">
                            {h.new_status.replace(/[-_]/g, " ")}
                          </span>
                        </span>
                        {h.note && (
                          <span className="text-muted-foreground italic">— {h.note}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Comments */}
              <div className="rounded-md border p-3 bg-muted/30">
                <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Comments ({ticket.comments.length})
                </h4>

                <ul className="mt-3 space-y-3">
                  {ticket.comments.length === 0 && (
                    <li className="text-sm text-muted-foreground italic">
                      No comments yet.
                    </li>
                  )}
                  {ticket.comments.map((c) => (
                    <li key={c.id} className="rounded-md border bg-background p-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{c.user_id === currentUserId ? "You" : c.user_id}</span>
                        <span>{formatTimestamp(c.created_at)}</span>
                      </div>
                      <p className="mt-1 text-sm whitespace-pre-wrap">{c.comment}</p>
                    </li>
                  ))}
                </ul>

                <div className="mt-3 flex items-end gap-2">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment…"
                    disabled={postingComment}
                    className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[60px] resize-vertical"
                  />
                  <Button
                    onClick={handleAddComment}
                    disabled={postingComment || !commentText.trim()}
                  >
                    {postingComment ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-1" />
                        Send
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
