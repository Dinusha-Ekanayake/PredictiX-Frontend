"use client";

/**
 * Create-ticket dialog — Admin / Super Admin role.
 *
 * Flow:
 *  1. Admin fills in title + description (and optionally asset / assigned user).
 *  2. After a 1.2s debounce, AI auto-runs — category and priority fields are
 *     populated with a spinner while the models run.
 *  3. Create Ticket is disabled while AI is running.
 *  4. Admin CAN change BOTH category and priority after AI suggests them.
 *  5. On success the dialog closes and onCreated fires.
 */

import * as React from "react";
import { AlertCircle, Bot, Loader2, Plus, Sparkles, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "@/lib/customToast";

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
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiGet, apiPost } from "@/lib/apiClient";
import {
  createTicketViaApi,
  previewTicketAI,
  type Ticket,
  type TicketPriority,
  type TicketCategory,
  type TicketAiPreview,
  addTicketAttachment,
} from "@/lib/ticketService";
import { listUsers, type UserItem } from "@/lib/userService";
import { getUser } from "@/lib/authService";
import { supabase } from "@/lib/supabaseBrowserClient";

// ─── types ────────────────────────────────────────────────────────────────────

type Asset = { id: string; asset_name: string };
type AssetSummaryResponse = { summary: string; generated_at: string; model_version: string };

type AiState =
  | { status: "idle" }
  | { status: "running" }
  | { status: "done"; result: TicketAiPreview }
  | { status: "error"; message: string };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (ticket: Ticket) => void;
  presetAssetId?: string;
  presetAssetName?: string;
  lockAsset?: boolean;
};

const selectCls =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring focus:border-ring disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer h-9";

// ─── component ────────────────────────────────────────────────────────────────

export default function NewTicketDialog({
  open, onOpenChange, onCreated, presetAssetId, presetAssetName, lockAsset,
}: Props) {
  const [assetId, setAssetId] = React.useState("");
  const [assets, setAssets] = React.useState<Asset[]>([]);
  const [assetsLoading, setAssetsLoading] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [assignedTo, setAssignedTo] = React.useState("");
  const [users, setUsers] = React.useState<UserItem[]>([]);
  const [usersLoading, setUsersLoading] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);

  // asset summary
  const [assetSummary, setAssetSummary] = React.useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = React.useState(false);
  const [ticketSummary, setTicketSummary] = React.useState<string | null>(null);
  const [ticketSummaryLoading, setTicketSummaryLoading] = React.useState(false);

  // AI state
  const [ai, setAi] = React.useState<AiState>({ status: "idle" });
  // Admin-editable overrides (pre-seeded from AI, fully editable)
  const [priority, setPriority] = React.useState<string>("");
  const [category, setCategory] = React.useState<string>("");

  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── asset summary ─────────────────────────────────────────────────────────
  React.useEffect(() => {
    if (!assetId) { setAssetSummary(null); return; }
    let cancelled = false;
    setSummaryLoading(true); setAssetSummary(null);
    apiGet<AssetSummaryResponse>(`/asset-summaries/by-asset/${assetId}`)
      .then((d) => { if (!cancelled) setAssetSummary(d?.summary ?? null); })
      .catch(() => { if (!cancelled) setAssetSummary(null); })
      .finally(() => { if (!cancelled) setSummaryLoading(false); });
    return () => { cancelled = true; };
  }, [assetId]);

  // ── ticket summary preview (debounced) ─────────────────────────────────────
  React.useEffect(() => {
    const t = title.trim(), d = description.trim();
    // Wait until the AI has set category so the summary includes
    // them instead of hallucinating those slots.
    if (!t || !d || !category) { setTicketSummary(null); return; }
    let cancelled = false;
    const timer = setTimeout(async () => {
      setTicketSummaryLoading(true);
      try {
        const res = await apiPost<AssetSummaryResponse>("/ticket-summaries/generate", {
          title: t,
          description: d,
          category,
          priority: priority || undefined,
        });
        if (!cancelled) setTicketSummary(res?.summary ?? null);
      } catch {
        if (!cancelled) setTicketSummary(null);
      } finally {
        if (!cancelled) setTicketSummaryLoading(false);
      }
    }, 900);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [title, description, category, priority]);

  // ── debounced AI ──────────────────────────────────────────────────────────
  React.useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimTitle = title.trim();
    const trimDesc = description.trim();

    if (!trimTitle || !trimDesc) {
      setAi({ status: "idle" });
      setPriority(""); setCategory("");
      return;
    }

    setAi({ status: "running" });

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await previewTicketAI(trimTitle, trimDesc);
        setAi({ status: "done", result: res });
        if (res.predicted_category) setCategory(res.predicted_category);
        if (res.predicted_priority) setPriority(res.predicted_priority);
      } catch (err) {
        setAi({ status: "error", message: err instanceof Error ? err.message : "AI failed" });
      }
    }, 1200);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [title, description]);

  // ── open/close ────────────────────────────────────────────────────────────
  React.useEffect(() => {
    if (open) {
      if (presetAssetId) setAssetId(presetAssetId);
      setAssetsLoading(true);
      apiGet<Asset[]>("/assets/dropdown")
        .then((d) => setAssets(d ?? []))
        .catch(() => {})
        .finally(() => setAssetsLoading(false));

      setUsersLoading(true);
      listUsers()
        .then((d) => setUsers(d ?? []))
        .catch(() => {})
        .finally(() => setUsersLoading(false));
      return;
    }
    const t = setTimeout(() => {
      setAssetId(""); setTitle(""); setDescription(""); setPriority(""); setCategory("");
      setAssignedTo(""); setIsSubmitting(false); setAssets([]); setUsers([]);
      setAssetSummary(null); setTicketSummary(null); setAi({ status: "idle" }); setFile(null);
    }, 200);
    return () => clearTimeout(t);
  }, [open, presetAssetId]);

  // ── submit ────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { toast.error("Please enter a title."); return; }

    const currentUser = getUser();
    if (!currentUser?.id) { toast.error("Session error — please log in again."); return; }

    const aiResult = ai.status === "done" ? ai.result : null;

    setIsSubmitting(true);
    try {
      const ticket = await createTicketViaApi({
        asset_id: assetId || null,
        title: title.trim(),
        description: description.trim(),
        priority: priority || "medium",
        predicted_priority: aiResult?.predicted_priority ?? null,
        predicted_category: category || (aiResult?.predicted_category ?? null),
        assigned_to: assignedTo || null,
        created_by: currentUser.id,
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
            await addTicketAttachment(
              ticket.id,
              publicUrlData.publicUrl,
              file.type,
              file.name
            );
          }
        }
      }

      toast.success("Ticket created", { description: ticket.title });
      onCreated?.(ticket);
      onOpenChange(false);
    } catch (err: any) {
      toast.error("Failed to create ticket", { description: err?.message });
    } finally {
      setIsSubmitting(false);
    }
  }

  const aiBlocking = ai.status === "running";
  const canCreate = title.trim().length > 0 && !aiBlocking && !isSubmitting;

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Ticket
          </DialogTitle>
          <DialogDescription>
            Fill in the details — AI will auto-suggest category and priority, which you can adjust before creating.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-3 pt-2">
          {/* Asset */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Asset{lockAsset && presetAssetName ? ` · ${presetAssetName}` : ""}
            </p>
            {assetsLoading && !lockAsset ? (
              <div className="flex items-center gap-2 h-9 px-3 rounded-md border border-input text-sm text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />Loading assets…
              </div>
            ) : (
              <select value={assetId} onChange={(e) => setAssetId(e.target.value)} className={selectCls} disabled={lockAsset}>
                {lockAsset && presetAssetId ? (
                  <option value={presetAssetId}>{presetAssetName ?? "Selected asset"}</option>
                ) : (
                  <>
                    <option value="">Select an asset (optional)</option>
                    {assets.map((a) => <option key={a.id} value={a.id}>{a.asset_name}</option>)}
                  </>
                )}
              </select>
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
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Short title for the ticket" disabled={isSubmitting} />
          </div>

          {/* Description */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Description</p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm min-h-[110px] resize-vertical outline-none focus:ring-2 focus:ring-ring"
              placeholder="Describe the issue — AI will analyze this to suggest category and priority"
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

          {/* Priority + Category — both editable for admin */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-violet-500" />
                Priority
                {ai.status === "running" && <Loader2 className="h-3 w-3 animate-spin text-violet-400" />}
              </p>
              <Select value={priority} onValueChange={setPriority} disabled={isSubmitting || aiBlocking}>
                <SelectTrigger className="w-full bg-background">
                  <SelectValue placeholder={aiBlocking ? "Analyzing…" : "AI will suggest"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      High
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      Medium
                    </div>
                  </SelectItem>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      Low
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-violet-500" />
                Category
                {ai.status === "running" && <Loader2 className="h-3 w-3 animate-spin text-violet-400" />}
              </p>
              <Select value={category} onValueChange={setCategory} disabled={isSubmitting || aiBlocking}>
                <SelectTrigger className="w-full bg-background">
                  <SelectValue placeholder={aiBlocking ? "Analyzing…" : "AI will suggest"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mechanical">Mechanical</SelectItem>
                  <SelectItem value="electrical">Electrical</SelectItem>
                  <SelectItem value="software">Software</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* AI status indicators */}
          {ai.status === "done" && (ai.result.predicted_category || ai.result.predicted_priority) && (
            <div className="flex items-center gap-2 text-xs text-violet-600 dark:text-violet-400">
              <Sparkles className="h-3.5 w-3.5" />
              AI suggestions applied — you can adjust before creating.
            </div>
          )}
          {ai.status === "error" && (
            <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800/40 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              AI models are temporarily unavailable — set category and priority manually.
            </div>
          )}

          {/* Assigned User */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Assigned User</p>
            {usersLoading ? (
              <div className="flex items-center gap-2 h-9 px-3 rounded-md border border-input text-sm text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />Loading users…
              </div>
            ) : (
              <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} className={selectCls} disabled={isSubmitting}>
                <option value="">Select a user (optional)</option>
                {users.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
              </select>
            )}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button type="submit" className="w-full" disabled={!canCreate}>
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating…</> :
                aiBlocking ? <><Loader2 className="mr-2 h-4 w-4 animate-spin text-violet-400" />Analyzing…</> :
                "Create Ticket"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} className="w-full" disabled={isSubmitting}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
