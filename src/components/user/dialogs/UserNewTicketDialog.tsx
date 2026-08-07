"use client";

/**
 * Create-ticket dialog — User role.
 *
 * Flow:
 *  1. User fills in title + description (and optionally selects an asset).
 *  2. After a short debounce (1.2s) the AI runs automatically — category
 *     and priority fields populate with a spinner while it runs.
 *  3. Create Ticket is disabled until the AI has returned (or failed).
 *  4. User can change the CATEGORY but NOT the priority (it is read-only).
 *  5. On success the form is replaced by a results panel.
 */

import * as React from "react";
import {
  AlertCircle,
  Bot,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Lock,
  Plus,
  Sparkles,
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

import { apiGet, apiPost } from "@/lib/apiClient";
import { addMyTicketAttachment } from "@/lib/api/userTickets";
import { supabase } from "@/lib/supabaseBrowserClient";

// ─── local types ──────────────────────────────────────────────────────────────

type Asset = { id: string; asset_name: string };
type AssetSummaryResponse = { summary: string; generated_at: string; model_version: string };

type AiState =
  | { status: "idle" }
  | { status: "running" }
  | { status: "done"; result: TicketPreviewResponse }
  | { status: "error"; message: string };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (ticket: UserTicketDetail) => void;
};

const selectCls =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring focus:border-ring disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer h-9";

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
  low: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
};

const CATEGORY_COLORS: Record<string, string> = {
  electrical: "bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300",
  mechanical: "bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300",
  software: "bg-violet-100 text-violet-800 dark:bg-violet-950/40 dark:text-violet-300",
};

// ─── component ────────────────────────────────────────────────────────────────

export default function UserNewTicketDialog({ open, onOpenChange, onCreated }: Props) {
  // form
  const [assetId, setAssetId] = React.useState("");
  const [assets, setAssets] = React.useState<Asset[]>([]);
  const [assetsLoading, setAssetsLoading] = React.useState(false);
  const [assetsLoadFailed, setAssetsLoadFailed] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");


  const [file, setFile] = React.useState<File | null>(null);

  // asset summary
  const [assetSummary, setAssetSummary] = React.useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = React.useState(false);
  const [ticketSummary, setTicketSummary] = React.useState<string | null>(null);
  const [ticketSummaryLoading, setTicketSummaryLoading] = React.useState(false);

  // AI state
  const [ai, setAi] = React.useState<AiState>({ status: "idle" });
  // Category / priority the user may have overridden after AI ran
  const [categoryOverride, setCategoryOverride] = React.useState<string>("");
  const [priorityOverride, setPriorityOverride] = React.useState<string>("");

  // submission
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [result, setResult] = React.useState<UserTicketDetail | null>(null);

  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── asset summary ────────────────────────────────────────────────────────────
  React.useEffect(() => {
    if (!assetId) { setAssetSummary(null); return; }
    let cancelled = false;
    setSummaryLoading(true);
    setAssetSummary(null);
    apiGet<AssetSummaryResponse>(`/asset-summaries/by-asset/${assetId}`)
      .then((d) => { if (!cancelled) setAssetSummary(d?.summary ?? null); })
      .catch(() => { if (!cancelled) setAssetSummary(null); })
      .finally(() => { if (!cancelled) setSummaryLoading(false); });
    return () => { cancelled = true; };
  }, [assetId]);

  // ── ticket summary preview (debounced) ───────────────────────────────────────
  React.useEffect(() => {
    const t = title.trim(), d = description.trim();
    // Wait until the AI has detected category AND priority so the summary
    // includes them instead of hallucinating those slots.
    const aiRes = ai.status === "done" ? ai.result : null;
    const cat = categoryOverride || aiRes?.predicted_category || "";
    const pri = priorityOverride || aiRes?.predicted_priority || "";
    // Generate the summary only once category AND priority are confirmed (set by
    // the AI or the user), so it reflects those values. Regenerates if changed.
    if (!t || !d || !cat || !pri) { setTicketSummary(null); return; }
    let cancelled = false;
    const timer = setTimeout(async () => {
      setTicketSummaryLoading(true);
      try {
        const res = await apiPost<AssetSummaryResponse>("/ticket-summaries/generate", {
          title: t,
          description: d,
          category: cat,
          priority: pri,
        });
        if (!cancelled) setTicketSummary(res?.summary ?? null);
      } catch {
        if (!cancelled) setTicketSummary(null);
      } finally {
        if (!cancelled) setTicketSummaryLoading(false);
      }
    }, 900);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [title, description, ai, categoryOverride, priorityOverride]);

  // ── debounced AI trigger ─────────────────────────────────────────────────────
  React.useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimTitle = title.trim();
    const trimDesc = description.trim();

    if (!trimTitle || !trimDesc) {
      setAi({ status: "idle" });
      setCategoryOverride("");
      return;
    }

    setAi({ status: "running" });
    setCategoryOverride("");
    setPriorityOverride("");

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await previewMyTicketAI({ title: trimTitle, description: trimDesc });
        setAi({ status: "done", result: res });
        // Pre-fill the editable category + priority with the AI suggestion
        if (res.predicted_category) setCategoryOverride(res.predicted_category);
        if (res.predicted_priority) setPriorityOverride(res.predicted_priority);
      } catch (err) {
        setAi({ status: "error", message: err instanceof Error ? err.message : "AI failed" });
      }
    }, 1200);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [title, description]);

  // ── dialog open/close ────────────────────────────────────────────────────────
  React.useEffect(() => {
    if (open) {
      setAssetsLoading(true); setAssetsLoadFailed(false);
      apiGet<Asset[]>("/assets/dropdown")
        .then((d) => setAssets(d ?? []))
        .catch(() => {
          setAssetsLoadFailed(true);
          toast.error("Couldn't load assets", { description: "The asset list failed to load. You can still create the ticket without linking an asset, or try reopening this dialog." });
        })
        .finally(() => setAssetsLoading(false));
      return;
    }
    const t = setTimeout(() => {
      setAssetId(""); setAssets([]); setAssetsLoadFailed(false); setTitle(""); setDescription("");
      setAssetSummary(null); setTicketSummary(null);
      setAi({ status: "idle" }); setCategoryOverride(""); setPriorityOverride("");
      setIsSubmitting(false); setResult(null); setFile(null);
    }, 200);
    return () => clearTimeout(t);
  }, [open]);

  // ── submit ───────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error("Title and description are required.");
      return;
    }

    const aiResult = ai.status === "done" ? ai.result : null;

    setIsSubmitting(true);
    try {
      const created = await createMyTicket({
        title: title.trim(),
        description: description.trim(),
        asset_id: assetId || undefined,

        use_ai_predictions: false,
        predicted_priority: priorityOverride || (aiResult?.predicted_priority ?? undefined),
        predicted_category: categoryOverride || (aiResult?.predicted_category ?? undefined),
        ticket_summary: aiResult?.ticket_summary ?? undefined,
      });

      if (file && supabase) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("ticket-attachments")
          .upload(fileName, file);
        
        if (uploadError) {
          console.error("Upload error:", uploadError);
          toast.error("Ticket created, but failed to upload image.");
        } else {
          const { data: publicUrlData } = supabase.storage
            .from("ticket-attachments")
            .getPublicUrl(fileName);
            
          if (publicUrlData?.publicUrl) {
            await addMyTicketAttachment(
              created.id,
              publicUrlData.publicUrl,
              file.type,
              file.name
            );
          }
        }
      }

      toast.success("Ticket created", { description: `${created.ticket_number} — ${created.title}` });
      setResult(created);
      onCreated?.(created);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create ticket");
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── derived ──────────────────────────────────────────────────────────────────
  const aiResult = ai.status === "done" ? ai.result : null;
  // Create is blocked while AI is still running (but allowed if idle=no text, or error=graceful)
  const aiBlocking = ai.status === "running";
  const canCreate = title.trim().length > 0 && description.trim().length > 0 && !aiBlocking && !isSubmitting;

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[680px] max-h-[90vh] overflow-y-auto">
        {result ? (
          /* ── Success panel ── */
          <>
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                Ticket created
              </DialogTitle>
              <DialogDescription>
                <span className="font-mono text-foreground">{result.ticket_number}</span> — {result.title}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 pt-2">
              {(result.predicted_priority || result.predicted_category) && (
                <div className="rounded-md border bg-violet-50/40 dark:bg-violet-950/20 p-3">
                  <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-2">
                    <Sparkles className="h-3.5 w-3.5 text-violet-500" />
                    AI predictions saved
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {result.predicted_category && (
                      <Badge className={CATEGORY_COLORS[result.predicted_category] ?? ""}>
                        {result.predicted_category}
                      </Badge>
                    )}
                    {result.predicted_priority && (
                      <Badge className={PRIORITY_COLORS[result.predicted_priority] ?? ""}>
                        {result.predicted_priority} priority
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <Button variant="secondary" onClick={() => {
                  setTitle(""); setDescription(""); setAssetId("");
                  setAi({ status: "idle" }); setCategoryOverride(""); setPriorityOverride(""); setResult(null); setAssetSummary(null); setTicketSummary(null); setFile(null);
                }}>
                  Create another
                </Button>
                <Button onClick={() => onOpenChange(false)}>Done</Button>
              </div>
            </div>
          </>
        ) : (
          /* ── Create form ── */
          <>
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Ticket
              </DialogTitle>
              <DialogDescription>
                Fill in the title and description — AI will automatically categorize and prioritize your ticket.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="grid gap-3 pt-2">
              {/* Asset */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Asset (optional)</p>
                {assetsLoading ? (
                  <div className="flex items-center gap-2 h-9 px-3 rounded-md border border-input text-sm text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />Loading assets…
                  </div>
                ) : (
                  <select value={assetId} onChange={(e) => setAssetId(e.target.value)} className={selectCls} disabled={isSubmitting}>
                    <option value="">Select an asset (optional)</option>
                    {assets.map((a) => <option key={a.id} value={a.id}>{a.asset_name}</option>)}
                  </select>
                )}
                {assetsLoadFailed && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="h-3 w-3 shrink-0" />
                    Failed to load the asset list — you can still submit without one.
                  </p>
                )}
              </div>

              {/* Asset Summary */}
              {(summaryLoading || assetSummary) && (
                <div className="rounded-md border border-violet-200/60 bg-violet-50/50 dark:bg-violet-950/20 dark:border-violet-800/40 px-3 py-2.5">
                  <p className="text-xs font-medium text-violet-600 dark:text-violet-400 flex items-center gap-1.5 mb-1">
                    <Bot className="h-3.5 w-3.5" />AI Asset Summary
                  </p>
                  {summaryLoading
                    ? <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-3.5 w-3.5 animate-spin text-violet-500" />Generating…</div>
                    : <p className="text-sm text-foreground/90 leading-relaxed">{assetSummary}</p>
                  }
                </div>
              )}

              {/* Title */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Title <span className="text-destructive">*</span></p>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Short title for the ticket"
                  disabled={isSubmitting}
                />
              </div>

              {/* Description */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Description <span className="text-destructive">*</span></p>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm min-h-[110px] resize-vertical outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Describe the issue in detail — AI will analyze this to categorize and prioritize automatically"
                  disabled={isSubmitting}
                />
              </div>

              {/* AI Ticket Summary */}
              {(ticketSummaryLoading || ticketSummary) && (
                <div className="rounded-md border border-violet-200/60 bg-violet-50/50 dark:bg-violet-950/20 dark:border-violet-800/40 px-3 py-2.5">
                  <p className="text-xs font-medium text-violet-600 dark:text-violet-400 flex items-center gap-1.5 mb-1">
                    <Bot className="h-3.5 w-3.5" />AI Ticket Summary
                  </p>
                  {ticketSummaryLoading
                    ? <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-3.5 w-3.5 animate-spin text-violet-500" />Generating…</div>
                    : <p className="text-sm text-foreground/90 leading-relaxed">{ticketSummary}</p>
                  }
                </div>
              )}

              {/* Image Upload */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Attach Image (optional)</p>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  disabled={isSubmitting}
                  className="cursor-pointer file:text-foreground file:bg-transparent file:border-0 file:text-sm file:font-medium"
                />
                {file && (
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground mb-1">Preview:</p>
                    <img 
                      src={URL.createObjectURL(file)} 
                      alt="Preview" 
                      className="max-h-32 rounded-md object-contain border bg-muted/30" 
                    />
                  </div>
                )}
              </div>

              {/* AI results: category + priority — both AI-suggested and editable */}
              <div className="grid grid-cols-2 gap-3">
                {/* Category — user CAN change */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-violet-500" />
                    Category
                    {ai.status === "running" && <Loader2 className="h-3 w-3 animate-spin text-violet-400" />}
                  </p>
                  <Select
                    value={categoryOverride}
                    onValueChange={setCategoryOverride}
                    disabled={isSubmitting || ai.status === "running"}
                  >
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue placeholder={ai.status === "running" ? "Analyzing…" : "AI will detect"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mechanical">Mechanical</SelectItem>
                      <SelectItem value="electrical">Electrical</SelectItem>
                      <SelectItem value="software">Software</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">AI-suggested — you can change it</p>
                </div>

                {/* Priority — user CAN change */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-violet-500" />
                    Priority
                    {ai.status === "running" && <Loader2 className="h-3 w-3 animate-spin text-violet-400" />}
                  </p>
                  <Select
                    value={priorityOverride}
                    onValueChange={setPriorityOverride}
                    disabled={isSubmitting || ai.status === "running"}
                  >
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue placeholder={ai.status === "running" ? "Analyzing…" : "AI will detect"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">AI-suggested — you can change it</p>
                </div>
              </div>

              {/* AI error notice */}
              {ai.status === "error" && (
                <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800/40 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  AI models are temporarily unavailable — you can still create the ticket without predictions.
                </div>
              )}



              {/* Actions */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <Button type="submit" className="w-full" disabled={!canCreate}>
                  {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating…</> :
                    aiBlocking ? <><Loader2 className="mr-2 h-4 w-4 animate-spin text-violet-400" />Analyzing…</> :
                    "Create Ticket"}
                </Button>
                <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={isSubmitting} className="w-full">
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
