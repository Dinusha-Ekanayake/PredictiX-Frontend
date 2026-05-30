"use client";

/**
 * Create-ticket dialog for the user role.
 *
 * Two-stage UX:
 *   1. User fills title + description (and optionally a priority override).
 *   2. They click "Preview AI" to call POST /user/tickets/preview — the AI
 *      runs without saving. Results render below the form with three actions:
 *        - Accept   → apply the predictions to the create payload
 *        - Regenerate → re-run the preview
 *        - Discard  → hide the panel, fall back to "ignore AI"
 *   3. They click "Create Ticket". If they accepted a preview, the accepted
 *      values are sent verbatim (use_ai_predictions=false). Otherwise the
 *      backend may run AI itself (use_ai_predictions=true) or skip it.
 *   4. On success the form view is replaced by a results panel showing the
 *      new ticket number plus a "Create another" / "Done" pair.
 *
 * Mirrors the visual structure of the admin NewTicketDialog (kept untouched).
 */

import * as React from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Loader2,
  Plus,
  RefreshCw,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createMyTicket,
  previewMyTicketAI,
  type TicketPreviewResponse,
  type UserTicketDetail,
} from "@/lib/api/userTickets";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (ticket: UserTicketDetail) => void;
};

export default function UserNewTicketDialog({
  open,
  onOpenChange,
  onCreated,
}: Props) {
  // -------- Form state --------
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [priority, setPriority] = React.useState<string>("");

  // -------- AI preview state --------
  const [preview, setPreview] = React.useState<TicketPreviewResponse | null>(null);
  const [previewLoading, setPreviewLoading] = React.useState(false);
  const [previewAccepted, setPreviewAccepted] = React.useState(false);

  // -------- Submission state --------
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [result, setResult] = React.useState<UserTicketDetail | null>(null);

  // Reset everything shortly after the dialog closes so the closing animation
  // doesn't show empty/stale values mid-fade.
  React.useEffect(() => {
    if (open) return;
    const t = setTimeout(() => {
      setTitle("");
      setDescription("");
      setPriority("");
      setPreview(null);
      setPreviewLoading(false);
      setPreviewAccepted(false);
      setIsSubmitting(false);
      setResult(null);
    }, 200);
    return () => clearTimeout(t);
  }, [open]);

  async function runPreview() {
    if (!title.trim() || !description.trim()) {
      toast.error("Add a title and description before previewing the AI.");
      return;
    }
    setPreviewLoading(true);
    setPreviewAccepted(false);
    try {
      const p = await previewMyTicketAI({
        title: title.trim(),
        description: description.trim(),
        priority: priority || undefined,
      });
      setPreview(p);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Preview failed");
    } finally {
      setPreviewLoading(false);
    }
  }

  function acceptPreview() {
    if (!preview) return;
    // If the user hadn't already chosen a priority, fill it from the prediction.
    if (!priority && preview.predicted_priority) {
      setPriority(preview.predicted_priority);
    }
    setPreviewAccepted(true);
    toast.success("AI suggestions applied — click Create Ticket to save.");
  }

  function discardPreview() {
    setPreview(null);
    setPreviewAccepted(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error("Title and description are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      // If the user accepted a preview, send those values and skip backend AI.
      // Otherwise leave use_ai_predictions=false too — they had the chance to
      // preview and chose not to. (Set to true if you want the old auto-AI
      // behavior on submit-without-preview.)
      const created = await createMyTicket({
        title: title.trim(),
        description: description.trim(),
        priority: priority || undefined,
        use_ai_predictions: false,
        predicted_priority:
          previewAccepted && preview?.predicted_priority
            ? preview.predicted_priority
            : undefined,
        predicted_category:
          previewAccepted && preview?.predicted_category
            ? preview.predicted_category
            : undefined,
        ticket_summary:
          previewAccepted && preview?.ticket_summary
            ? preview.ticket_summary
            : undefined,
      });
      toast.success("Ticket created", {
        description: `${created.ticket_number} — ${created.title}`,
      });
      setResult(created);
      onCreated?.(created);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create ticket";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Did the preview return at least one usable field?
  const previewHasOutput =
    !!preview &&
    (!!preview.predicted_priority ||
      !!preview.predicted_category ||
      !!preview.ticket_summary);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[680px] max-h-[90vh] overflow-y-auto">
        {result ? (
          // -----------------------------------------------------------
          // Step 4 — post-create success
          // -----------------------------------------------------------
          <>
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                Ticket created
              </DialogTitle>
              <DialogDescription>
                <span className="font-mono text-foreground">
                  {result.ticket_number}
                </span>{" "}
                — {result.title}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 pt-2">
              {(result.ticket_summary ||
                result.predicted_priority ||
                result.predicted_category) && (
                <div className="rounded-md border bg-violet-50/40 dark:bg-violet-950/20 p-3">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-violet-500" />
                    Saved AI insights
                  </h4>
                  <div className="mt-2 space-y-2">
                    {result.ticket_summary && (
                      <p className="text-sm">{result.ticket_summary}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {result.predicted_category && (
                        <Badge className="bg-sky-100 text-sky-800">
                          Category: {result.predicted_category}
                        </Badge>
                      )}
                      {result.predicted_priority && (
                        <Badge className="bg-amber-100 text-amber-800">
                          Predicted priority: {result.predicted_priority}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    // Re-enter form mode but keep the dialog open.
                    setTitle("");
                    setDescription("");
                    setPriority("");
                    setPreview(null);
                    setPreviewAccepted(false);
                    setResult(null);
                  }}
                  className="w-full"
                >
                  Create another
                </Button>
                <Button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="w-full"
                >
                  Done
                </Button>
              </div>
            </div>
          </>
        ) : (
          // -----------------------------------------------------------
          // Steps 1-3 — form + inline preview
          // -----------------------------------------------------------
          <>
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Ticket
              </DialogTitle>
              <DialogDescription>
                Fill the details, optionally preview the AI suggestions, then
                create the ticket.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="grid gap-3 pt-2">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Title</p>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Short title for the ticket"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Description</p>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-base min-h-[120px] resize-vertical"
                  placeholder="Describe the issue in detail (what's wrong, when it started, any recent changes)"
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Priority (optional)
                  </p>
                  <Select
                    value={priority}
                    onValueChange={(v) => setPriority(v)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue placeholder="Choose or let AI suggest" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    AI assistance
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={runPreview}
                    disabled={isSubmitting || previewLoading}
                    className="w-full h-10 justify-start"
                  >
                    {previewLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin text-violet-500" />
                        Running AI…
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4 text-violet-500" />
                        {preview ? "Regenerate" : "Preview AI"}
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* ---------------- AI preview panel ---------------- */}
              {preview && (
                <div
                  className={`rounded-md border p-3 ${
                    previewAccepted
                      ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300/50"
                      : "bg-violet-50/40 dark:bg-violet-950/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-violet-500" />
                      AI suggestions
                      {previewAccepted && (
                        <span className="text-xs text-emerald-600 inline-flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          Accepted
                        </span>
                      )}
                    </h4>
                  </div>

                  {previewHasOutput ? (
                    <div className="mt-2 space-y-2">
                      {preview.ticket_summary && (
                        <p className="text-sm">{preview.ticket_summary}</p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {preview.predicted_category && (
                          <Badge className="bg-sky-100 text-sky-800">
                            Category: {preview.predicted_category}
                          </Badge>
                        )}
                        {preview.predicted_priority && (
                          <Badge className="bg-amber-100 text-amber-800">
                            Priority: {preview.predicted_priority}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
                      <div>
                        AI predictions are unavailable right now.
                        {preview.errors &&
                          Object.keys(preview.errors).length > 0 && (
                            <ul className="mt-1 list-disc list-inside text-xs">
                              {Object.entries(preview.errors).map(([k, v]) => (
                                <li key={k}>
                                  <span className="font-medium">{k}:</span>{" "}
                                  {v.length > 140 ? v.slice(0, 140) + "…" : v}
                                </li>
                              ))}
                            </ul>
                          )}
                      </div>
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {previewHasOutput && !previewAccepted && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={acceptPreview}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Accept
                      </Button>
                    )}
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={runPreview}
                      disabled={previewLoading}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Regenerate
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={discardPreview}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Discard
                    </Button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating…
                    </>
                  ) : (
                    "Create Ticket"
                  )}
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => onOpenChange(false)}
                  className="w-full"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
