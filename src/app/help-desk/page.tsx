"use client";

import * as React from "react";
import {
  CircleHelp,
  MessageSquareText,
  PlusCircle,
  Search,
  Pencil,
  Trash2,
  Check,
  X,
  Sparkles,
  BookOpen,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";

import AdminNavbar from "@/components/navigation/AdminNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/apiClient";
import { cn } from "@/lib/utils";

type FaqItem = {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  tags: string[] | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
};

export default function HelpDeskPage() {
  const adminFormRef = React.useRef<HTMLDivElement | null>(null);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [faqItems, setFaqItems] = React.useState<FaqItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState("");

  // Add form state
  const [adminQuestion, setAdminQuestion] = React.useState("");
  const [adminAnswer, setAdminAnswer] = React.useState("");
  const [isAdding, setIsAdding] = React.useState(false);

  // Inline edit state
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editQuestion, setEditQuestion] = React.useState("");
  const [editAnswer, setEditAnswer] = React.useState("");
  const [isSavingEdit, setIsSavingEdit] = React.useState(false);

  // Delete confirm state
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const role = window.localStorage.getItem("predictix.user.role");
    setIsAdmin(role === "admin" || role === "ADMIN");
  }, []);

  const fetchFaqs = React.useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const data = await apiGet<FaqItem[]>("/faqs/");
      setFaqItems(data ?? []);
    } catch (err: any) {
      setLoadError(err?.message ?? "Failed to load FAQs");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  const filteredFaqs = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return faqItems;
    return faqItems.filter(
      (item) =>
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q)
    );
  }, [faqItems, query]);

  async function handleAddFaq() {
    const question = adminQuestion.trim();
    const answer = adminAnswer.trim();
    if (!question || !answer) return;

    setIsAdding(true);
    try {
      const created = await apiPost<FaqItem>("/faqs/", { question, answer });
      setFaqItems((prev) => [created, ...prev]);
      setAdminQuestion("");
      setAdminAnswer("");
      toast.success("FAQ added");
    } catch (err: any) {
      toast.error("Failed to add FAQ", { description: err?.message });
    } finally {
      setIsAdding(false);
    }
  }

  function startEdit(item: FaqItem) {
    setEditingId(item.id);
    setEditQuestion(item.question);
    setEditAnswer(item.answer);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditQuestion("");
    setEditAnswer("");
  }

  async function saveEdit(id: string) {
    const question = editQuestion.trim();
    const answer = editAnswer.trim();
    if (!question || !answer) return;

    setIsSavingEdit(true);
    try {
      const updated = await apiPut<FaqItem>(`/faqs/${id}`, { question, answer });
      setFaqItems((prev) => prev.map((f) => (f.id === id ? updated : f)));
      setEditingId(null);
      toast.success("FAQ updated");
    } catch (err: any) {
      toast.error("Failed to update FAQ", { description: err?.message });
    } finally {
      setIsSavingEdit(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await apiDelete(`/faqs/${id}`);
      setFaqItems((prev) => prev.filter((f) => f.id !== id));
      setDeletingId(null);
      toast.success("FAQ deleted");
    } catch (err: any) {
      toast.error("Failed to delete FAQ", { description: err?.message });
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <AdminNavbar />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">

          {/* ══ Hero header (dashboard style) ════════════════════════════════ */}
          <div className="relative overflow-hidden rounded-2xl border border-violet-200/60 dark:border-white/10 dark:bg-white/2">
            <div className="absolute inset-0 bg-linear-to-br from-violet-50/90 via-white/70 to-sky-50/80 dark:from-violet-500/8 dark:via-white/2 dark:to-transparent pointer-events-none" />
            <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-gradient-to-br from-violet-400/20 to-sky-400/20 dark:from-violet-500/10 dark:to-sky-500/5 blur-3xl pointer-events-none" />

            <div className="relative px-7 py-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-violet-500 dark:text-violet-400">PredictiX</span>
                  <span className="text-muted-foreground/30 text-xs font-light">/</span>
                  <span className="text-[10px] tracking-widest uppercase text-muted-foreground/80">Help Desk</span>
                </div>

                <h1 className="flex items-center gap-2.5 text-[26px] font-semibold tracking-[-0.025em] leading-none text-foreground">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-violet-500 to-sky-500 text-white shadow-md">
                    <CircleHelp className="size-5" />
                  </span>
                  Help Desk
                </h1>

                <p className="mt-2.5 text-[12px] text-muted-foreground leading-tight max-w-md">
                  Browse curated answers to common questions. Can't find what you need? Reach out to your admin.
                </p>
              </div>

              <div className="flex flex-col items-end gap-2.5 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100/80 dark:bg-violet-500/15 border border-violet-200 dark:border-violet-500/25 px-2.5 py-1 text-[10px] font-semibold text-violet-700 dark:text-violet-300">
                    <BookOpen className="h-3 w-3" /> {faqItems.length} article{faqItems.length === 1 ? "" : "s"}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/80 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/25 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                    <Sparkles className="h-3 w-3" /> Knowledge Base
                  </span>
                </div>
                {isAdmin && (
                  <Button
                    type="button"
                    onClick={() => adminFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                    className="h-9 shrink-0 bg-linear-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white shadow-md"
                  >
                    <PlusCircle className="size-4" />
                    Add New Q&amp;A
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* ══ Search bar ═══════════════════════════════════════════════════ */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-card shadow-sm p-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9 h-11 bg-background/60 dark:bg-slate-900/60"
                placeholder="Search question or answer…"
                aria-label="Search FAQ"
              />
            </div>
          </div>

          {/* ══ FAQ list ═════════════════════════════════════════════════════ */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-card shadow-sm">
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-200 dark:border-slate-700">
              <div>
                <p className="text-[13px] font-semibold text-foreground flex items-center gap-2">
                  <HelpCircle className="size-4 text-violet-500" />
                  Frequently Asked Questions
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {filteredFaqs.length} result{filteredFaqs.length === 1 ? "" : "s"}
                </p>
              </div>
            </div>

            <div className="p-4">
              {isLoading ? (
                <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  Loading FAQs…
                </p>
              ) : loadError ? (
                <div className="space-y-3 rounded-xl border border-dashed border-destructive/40 p-4 text-sm">
                  <p className="text-destructive">Failed to load FAQs: {loadError}</p>
                  <Button type="button" variant="outline" onClick={fetchFaqs}>Retry</Button>
                </div>
              ) : filteredFaqs.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border p-10 text-center">
                  <div className="rounded-full bg-violet-100 dark:bg-violet-500/15 p-3">
                    <Search className="size-5 text-violet-500" />
                  </div>
                  <p className="text-sm font-medium text-foreground">No matching FAQ found</p>
                  <p className="text-xs text-muted-foreground max-w-xs">
                    Try a different search term or ask your admin to add a new question.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredFaqs.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "group rounded-xl border bg-card transition-all duration-200",
                        "border-slate-200 dark:border-slate-700",
                        "hover:border-violet-300/70 dark:hover:border-violet-500/40 hover:shadow-md",
                        editingId === item.id && "border-violet-400 dark:border-violet-500/60 shadow-md"
                      )}
                    >
                      {editingId === item.id ? (
                        /* ── Inline edit mode ── */
                        <div className="p-4 space-y-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Pencil className="size-3.5 text-violet-500" />
                            <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wide">
                              Editing
                            </span>
                          </div>
                          <Input
                            value={editQuestion}
                            onChange={(e) => setEditQuestion(e.target.value)}
                            placeholder="Question"
                            className="bg-background/60 dark:bg-slate-900/60"
                          />
                          <textarea
                            value={editAnswer}
                            onChange={(e) => setEditAnswer(e.target.value)}
                            placeholder="Answer"
                            className="min-h-20 w-full resize-y rounded-md border border-input bg-background/60 dark:bg-slate-900/60 px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                          />
                          <div className="flex items-center gap-2 justify-end">
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => saveEdit(item.id)}
                              disabled={isSavingEdit || !editQuestion.trim() || !editAnswer.trim()}
                              className="bg-linear-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white"
                            >
                              <Check className="size-3.5 mr-1" />
                              {isSavingEdit ? "Saving…" : "Save"}
                            </Button>
                            <Button type="button" size="sm" variant="ghost" onClick={cancelEdit}>
                              <X className="size-3.5 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        /* ── Normal view mode ── */
                        <details className="group/details px-4 py-3 [&[open]>summary>div>span>svg.chevron]:rotate-90">
                          <summary className="cursor-pointer list-none text-sm font-semibold md:text-base">
                            <div className="flex items-center justify-between gap-3">
                              <span className="inline-flex items-center gap-2.5 flex-1 min-w-0">
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-violet-500/15 to-sky-500/15 text-violet-600 dark:text-violet-400 group-hover:from-violet-500/25 group-hover:to-sky-500/25 transition-colors">
                                  <MessageSquareText className="size-3.5" />
                                </span>
                                <span className="text-foreground truncate">{item.question}</span>
                              </span>
                              {isAdmin && (
                                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.preventDefault()}>
                                  <button
                                    type="button"
                                    onClick={() => startEdit(item)}
                                    className="rounded-lg p-1.5 text-muted-foreground hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-colors"
                                    title="Edit"
                                  >
                                    <Pencil className="size-3.5" />
                                  </button>
                                  {deletingId === item.id ? (
                                    <span className="flex items-center gap-1 text-xs">
                                      <button
                                        type="button"
                                        onClick={() => handleDelete(item.id)}
                                        className="rounded-md px-2 py-1 bg-rose-600 text-white text-xs font-medium hover:bg-rose-700 transition-colors"
                                      >
                                        Confirm
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setDeletingId(null)}
                                        className="rounded-md px-2 py-1 text-muted-foreground hover:bg-muted transition-colors"
                                      >
                                        Cancel
                                      </button>
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => setDeletingId(item.id)}
                                      className="rounded-lg p-1.5 text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                                      title="Delete"
                                    >
                                      <Trash2 className="size-3.5" />
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </summary>
                          <div className="mt-3 ml-9 pl-3 border-l-2 border-violet-200/60 dark:border-violet-500/30">
                            <p className="text-sm leading-6 text-muted-foreground md:text-[15px]">
                              {item.answer}
                            </p>
                          </div>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ══ Admin: Add FAQ ═══════════════════════════════════════════════ */}
          {isAdmin && (
            <div
              ref={adminFormRef}
              className="relative rounded-xl border border-slate-200 dark:border-slate-700 bg-card shadow-sm overflow-hidden"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-violet-500 via-fuchsia-500 to-sky-500" />
              <div className="px-5 pt-5 pb-3 border-b border-slate-200 dark:border-slate-700">
                <p className="text-[13px] font-semibold text-foreground flex items-center gap-2">
                  <PlusCircle className="size-4 text-violet-500" />
                  Add New FAQ
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Publish a new question and answer to the knowledge base.
                </p>
              </div>
              <div className="p-5 space-y-3">
                <Input
                  value={adminQuestion}
                  onChange={(e) => setAdminQuestion(e.target.value)}
                  placeholder="Question"
                  aria-label="FAQ question"
                  className="bg-background/60 dark:bg-slate-900/60"
                />
                <textarea
                  value={adminAnswer}
                  onChange={(e) => setAdminAnswer(e.target.value)}
                  placeholder="Answer"
                  className="min-h-24 w-full resize-y rounded-md border border-input bg-background/60 dark:bg-slate-900/60 px-3 py-2 text-sm outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  aria-label="FAQ answer"
                />
                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={handleAddFaq}
                    disabled={!adminQuestion.trim() || !adminAnswer.trim() || isAdding}
                    className="bg-linear-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white shadow-md"
                  >
                    {isAdding ? "Saving…" : "Add Question & Answer"}
                  </Button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
