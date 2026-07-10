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
  ChevronDown,
  LifeBuoy,
  Mail,
  FileQuestion,
} from "lucide-react";
import { toast } from "@/lib/customToast";

import AdminNavbar from "@/components/navigation/AdminNavbar";
import UserNavbar from "@/components/navigation/UserNavbar";
import AmbientBackground from "@/components/background/AmbientBackground";
import Footer from "@/components/navigation/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/apiClient";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── FAQ Accordion Card ───────────────────────────────────────────────────────
// NOTE: The outer row is a <div> (not <button>) so that admin action
// <button> elements inside it are NOT nested inside another <button>.

function FaqCard({
  item,
  isAdmin,
  isEditing,
  editQuestion,
  editAnswer,
  isSavingEdit,
  deletingId,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onEditQuestion,
  onEditAnswer,
  onConfirmDelete,
  onRequestDelete,
  onCancelDelete,
}: {
  item: FaqItem;
  isAdmin: boolean;
  isEditing: boolean;
  editQuestion: string;
  editAnswer: string;
  isSavingEdit: boolean;
  deletingId: string | null;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onEditQuestion: (v: string) => void;
  onEditAnswer: (v: string) => void;
  onConfirmDelete: () => void;
  onRequestDelete: () => void;
  onCancelDelete: () => void;
}) {
  const [open, setOpen] = React.useState(false);

  // ── Edit mode ───────────────────────────────────────────────────────────────
  if (isEditing) {
    return (
      <div className="rounded-2xl border border-violet-300 dark:border-violet-500/50 bg-card shadow-sm p-5 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-500/15">
            <Pencil className="size-3.5 text-violet-600 dark:text-violet-400" />
          </span>
          <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
            Editing FAQ
          </span>
        </div>
        <Input
          value={editQuestion}
          onChange={(e) => onEditQuestion(e.target.value)}
          placeholder="Question"
          className="bg-background/60 dark:bg-slate-900/60"
        />
        <textarea
          value={editAnswer}
          onChange={(e) => onEditAnswer(e.target.value)}
          placeholder="Answer"
          className="min-h-24 w-full resize-y rounded-xl border border-input bg-background/60 dark:bg-slate-900/60 px-3 py-2.5 text-sm outline-none focus-visible:border-violet-400 focus-visible:ring-2 focus-visible:ring-violet-400/30 transition-all"
        />
        <div className="flex items-center gap-2 justify-end">
          <Button
            type="button"
            size="sm"
            onClick={onSaveEdit}
            disabled={isSavingEdit || !editQuestion.trim() || !editAnswer.trim()}
            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white shadow-sm"
          >
            <Check className="size-3.5 mr-1.5" />
            {isSavingEdit ? "Saving…" : "Save Changes"}
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={onCancelEdit}>
            <X className="size-3.5 mr-1.5" />
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  // ── View mode ───────────────────────────────────────────────────────────────
  return (
    <div
      className={cn(
        "group rounded-2xl border bg-card transition-all duration-200 overflow-hidden",
        "border-slate-200 dark:border-slate-800",
        open
          ? "border-violet-200 dark:border-violet-500/40 shadow-md shadow-violet-500/5"
          : "hover:border-violet-200/70 dark:hover:border-violet-500/30 hover:shadow-sm"
      )}
    >
      {/* ── Header row: outer is a plain div, click zone is a div[role=button] */}
      <div className="flex items-center gap-2 pr-3">
        {/* Clickable question area — uses div+role so buttons can sit beside it */}
        <div
          role="button"
          tabIndex={0}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setOpen((v) => !v)}
          className="flex-1 min-w-0 flex items-center gap-3 px-5 py-4 cursor-pointer select-none"
        >
          <span
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors",
              open
                ? "bg-gradient-to-br from-violet-500 to-sky-500 text-white"
                : "bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 group-hover:bg-violet-100 dark:group-hover:bg-violet-500/15"
            )}
          >
            <MessageSquareText className="size-4" />
          </span>
          <span className="text-sm font-semibold text-foreground leading-snug">
            {item.question}
          </span>
        </div>

        {/* Right side: admin actions + chevron — siblings of the click zone, NOT inside it */}
        <div className="flex items-center gap-1 shrink-0">
          {isAdmin && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={onStartEdit}
                className="rounded-lg p-1.5 text-muted-foreground hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-colors"
                title="Edit"
              >
                <Pencil className="size-3.5" />
              </button>

              {deletingId === item.id ? (
                <span className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={onConfirmDelete}
                    className="rounded-lg px-2.5 py-1 bg-rose-600 text-white text-xs font-medium hover:bg-rose-700 transition-colors"
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={onCancelDelete}
                    className="rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={onRequestDelete}
                  className="rounded-lg p-1.5 text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="size-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Chevron — also a plain div click so it doesn't nest inside role=button */}
          <div
            onClick={() => setOpen((v) => !v)}
            className="p-2 cursor-pointer rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform duration-200",
                open && "rotate-180 text-violet-500"
              )}
            />
          </div>
        </div>
      </div>

      {/* Answer panel — CSS height transition */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300",
          open ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-5 pb-5">
          <div className="ml-11 pl-4 border-l-2 border-violet-200/80 dark:border-violet-500/30">
            <p className="text-sm leading-7 text-muted-foreground">
              {item.answer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HelpDeskPage() {
  const adminFormRef = React.useRef<HTMLDivElement | null>(null);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [faqItems, setFaqItems] = React.useState<FaqItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState("");

  const [adminQuestion, setAdminQuestion] = React.useState("");
  const [adminAnswer, setAdminAnswer] = React.useState("");
  const [adminCategory, setAdminCategory] = React.useState("general");
  const [isAdding, setIsAdding] = React.useState(false);

  const [activeCategory, setActiveCategory] = React.useState<string>("all");

  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editQuestion, setEditQuestion] = React.useState("");
  const [editAnswer, setEditAnswer] = React.useState("");
  const [isSavingEdit, setIsSavingEdit] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const r = (window.localStorage.getItem("predictix.user.role") ?? "").toLowerCase();
    setIsAdmin(r === "admin" || r === "super_admin");
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

  React.useEffect(() => { fetchFaqs(); }, [fetchFaqs]);

  const categories = React.useMemo(() => [
    { id: "all", label: "All Topics" },
    { id: "ticket", label: "Ticket" },
    { id: "asset", label: "Asset" },
    { id: "user", label: "User" },
    { id: "warehouse", label: "Warehouse" },
    { id: "general", label: "General" },
  ], []);

  const filteredFaqs = React.useMemo(() => {
    let result = faqItems;

    if (activeCategory !== "all") {
      result = result.filter((item) => item.category?.toLowerCase() === activeCategory);
    }

    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (item) =>
          item.question.toLowerCase().includes(q) ||
          item.answer.toLowerCase().includes(q)
      );
    }
    return result;
  }, [faqItems, query, activeCategory]);

  async function handleAddFaq() {
    const question = adminQuestion.trim();
    const answer = adminAnswer.trim();
    if (!question || !answer) return;
    setIsAdding(true);
    try {
      const created = await apiPost<FaqItem>("/faqs/", { 
        question, 
        answer, 
        category: adminCategory 
      });
      setFaqItems((prev) => [created, ...prev]);
      setAdminQuestion("");
      setAdminAnswer("");
      toast.success("FAQ published successfully");
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

  const Navbar = isAdmin ? AdminNavbar : UserNavbar;

  return (
    <div className="relative min-h-screen flex flex-col">
      <AmbientBackground />
      <Navbar />

      <main className="relative z-10 flex-1 mx-auto w-full max-w-5xl px-4 py-8 space-y-6">

        {/* ── Hero header ── */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-linear-to-br from-slate-50 via-white to-slate-50 dark:from-violet-500/8 dark:via-white/2 dark:to-transparent dark:bg-white/2 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 dark:bg-white/6 p-2.5">
                <CircleHelp className="h-5 w-5 text-primary dark:text-white/70" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Help Desk</h1>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Browse curated answers to common questions.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 dark:bg-violet-500/15 border border-violet-200 dark:border-violet-500/25 px-3 py-1 text-xs font-medium text-violet-700 dark:text-violet-300">
                <BookOpen className="h-3.5 w-3.5" />
                {faqItems.length} articles
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/25 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                <Sparkles className="h-3.5 w-3.5" />
                Knowledge Base
              </span>
              {isAdmin && (
                <Button
                  size="sm"
                  variant="default"
                  className="h-8 gap-1.5 rounded-full"
                  onClick={() =>
                    adminFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
                  }
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  Add Q&amp;A
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* ── Search & Filters ───────────────────────────────────────────── */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-card shadow-sm p-4 space-y-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 h-11 bg-background/60 dark:bg-slate-900/60 rounded-xl border-slate-200 dark:border-slate-700"
              placeholder="Search questions and answers…"
              aria-label="Search FAQ"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors border outline-none focus-visible:ring-2 focus-visible:ring-violet-400/30",
                  activeCategory === cat.id
                    ? "bg-violet-600 text-white border-violet-600 shadow-sm"
                    : "bg-transparent text-muted-foreground border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── FAQ List ────────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-card shadow-sm overflow-hidden">
          {/* Section header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-white/[0.02]">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-500/15">
                <FileQuestion className="size-4 text-violet-600 dark:text-violet-400" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">Frequently Asked Questions</p>
                <p className="text-[11px] text-muted-foreground">
                  {query
                    ? `${filteredFaqs.length} result${filteredFaqs.length !== 1 ? "s" : ""} for "${query}"`
                    : `${filteredFaqs.length} article${filteredFaqs.length !== 1 ? "s" : ""} available`}
                </p>
              </div>
            </div>
          </div>

          <div className="p-5">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-xl bg-slate-200 dark:bg-slate-700 shrink-0" />
                      <div className="h-4 rounded-lg bg-slate-200 dark:bg-slate-700 flex-1" />
                    </div>
                  </div>
                ))}
              </div>
            ) : loadError ? (
              <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-destructive/40 p-10 text-center">
                <div className="rounded-full bg-red-100 dark:bg-red-500/10 p-3">
                  <X className="size-5 text-red-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-destructive">Failed to load FAQs</p>
                  <p className="text-xs text-muted-foreground mt-1">{loadError}</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={fetchFaqs}>Retry</Button>
              </div>
            ) : filteredFaqs.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-12 text-center">
                <div className="rounded-2xl bg-violet-100/80 dark:bg-violet-500/10 p-4">
                  <Search className="size-6 text-violet-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">No matching FAQ found</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                    {query
                      ? `No results for "${query}". Try a different term.`
                      : "No FAQs have been added yet. Ask your admin to add some."}
                  </p>
                </div>
                {query && (
                  <Button type="button" variant="outline" size="sm" onClick={() => setQuery("")}>
                    Clear search
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredFaqs.map((item) => (
                  <FaqCard
                    key={item.id}
                    item={item}
                    isAdmin={isAdmin}
                    isEditing={editingId === item.id}
                    editQuestion={editQuestion}
                    editAnswer={editAnswer}
                    isSavingEdit={isSavingEdit}
                    deletingId={deletingId}
                    onStartEdit={() => startEdit(item)}
                    onCancelEdit={cancelEdit}
                    onSaveEdit={() => saveEdit(item.id)}
                    onEditQuestion={setEditQuestion}
                    onEditAnswer={setEditAnswer}
                    onConfirmDelete={() => handleDelete(item.id)}
                    onRequestDelete={() => setDeletingId(item.id)}
                    onCancelDelete={() => setDeletingId(null)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Contact Support (non-admin users) ──────────────────────────── */}
        {!isAdmin && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-card shadow-sm overflow-hidden">
            <div className="relative p-6">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-50 to-sky-50 dark:from-violet-950/30 dark:to-sky-950/20 pointer-events-none" />
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-sky-500 text-white shadow-md shadow-violet-500/25">
                  <LifeBuoy className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">Still need help?</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Contact your administrator directly if you can't find an answer here.
                  </p>
                </div>
                <a
                  href="mailto:support@lankalogix.lk"
                  className="shrink-0 inline-flex items-center gap-2 rounded-xl border border-violet-200 dark:border-violet-500/30 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-medium text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-colors shadow-sm"
                >
                  <Mail className="size-4" />
                  Contact Admin
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ── Admin: Add FAQ ──────────────────────────────────────────────── */}
        {isAdmin && (
          <div
            ref={adminFormRef}
            className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-card shadow-sm overflow-hidden"
          >
            {/* Accent top bar */}
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-sky-500" />

            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-500/15">
                  <PlusCircle className="size-4 text-violet-600 dark:text-violet-400" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">Add New FAQ</p>
                  <p className="text-[11px] text-muted-foreground">Publish a new question and answer to the knowledge base.</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Question</label>
                <Input
                  value={adminQuestion}
                  onChange={(e) => setAdminQuestion(e.target.value)}
                  placeholder="e.g. How do I reset my password?"
                  aria-label="FAQ question"
                  className="bg-background/60 dark:bg-slate-900/60 rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</label>
                <select
                  value={adminCategory}
                  onChange={(e) => setAdminCategory(e.target.value)}
                  className="w-full h-10 rounded-xl border border-input bg-background/60 dark:bg-slate-900/60 px-3.5 text-sm outline-none transition-all focus-visible:border-violet-400 focus-visible:ring-2 focus-visible:ring-violet-400/30 text-foreground"
                >
                  {categories.filter(c => c.id !== "all").map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Answer</label>
                <textarea
                  value={adminAnswer}
                  onChange={(e) => setAdminAnswer(e.target.value)}
                  placeholder="Provide a clear and concise answer…"
                  className="min-h-28 w-full resize-y rounded-xl border border-input bg-background/60 dark:bg-slate-900/60 px-3.5 py-2.5 text-sm outline-none transition-all focus-visible:border-violet-400 focus-visible:ring-2 focus-visible:ring-violet-400/30"
                  aria-label="FAQ answer"
                />
              </div>
              <div className="flex items-center justify-between pt-1">
                <p className="text-xs text-muted-foreground">
                  This FAQ will be visible to all users immediately.
                </p>
                <Button
                  type="button"
                  onClick={handleAddFaq}
                  disabled={!adminQuestion.trim() || !adminAnswer.trim() || isAdding}
                  className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white shadow-md shadow-violet-500/25"
                >
                  <PlusCircle className="size-4 mr-1.5" />
                  {isAdding ? "Publishing…" : "Publish FAQ"}
                </Button>
              </div>
            </div>
          </div>
        )}

      </main>
      
      <Footer />
    </div>
  );
}
