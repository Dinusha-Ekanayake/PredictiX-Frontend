"use client";

import * as React from "react";
import { Search, Filter, AlertTriangle, CheckCircle, AlertCircle, RefreshCw, XCircle, Loader2, Ticket as TicketIcon, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import PredictiXLoader from "@/components/loading/PredictiXLoader";
import NewTicketDialog from "@/components/admin/dialogs/NewTicketDialog";
import TicketDetailsDialog from "@/components/admin/dialogs/TicketDetailsDialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  fetchTickets,
  fetchTicketStatusCounts,
  deleteTicket,
  type Ticket,
} from "@/lib/ticketService";

export default function AdminTicketsPage() {
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [tickets, setTickets] = React.useState<Ticket[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(0);
  const [loadingMore, setLoadingMore] = React.useState(false);

  const [statusCounts, setStatusCounts] = React.useState<Record<string, number>>({ open: 0, "in-progress": 0, resolved: 0, closed: 0 });

  const [open, setOpen] = React.useState(false);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [selectedTicket, setSelectedTicket] = React.useState<Ticket | null>(null);

  const [query, setQuery] = React.useState("");
  const [debouncedQuery, setDebouncedQuery] = React.useState("");
  const [selectedStatus, setSelectedStatus] = React.useState("all");
  const [selectedPriority, setSelectedPriority] = React.useState("all");

  React.useEffect(() => {
    const role = window.localStorage.getItem("predictix.user.role");
    setIsAdmin(role === "admin" || role === "ADMIN");
  }, []);

  // Load global status counts (not affected by filters)
  React.useEffect(() => {
    fetchTicketStatusCounts().then(setStatusCounts).catch(() => {});
  }, []);

  // Debounce search input
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(t);
  }, [query]);

  // Reset and reload when filters change
  React.useEffect(() => {
    setPage(0);
    setTickets([]);
    loadPage(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, selectedStatus, selectedPriority]);

  async function loadPage(pageNum: number, reset: boolean) {
    if (pageNum === 0) setIsLoading(true);
    else setLoadingMore(true);

    try {
      const { tickets: rows, total: t } = await fetchTickets(
        pageNum,
        debouncedQuery,
        selectedStatus,
        selectedPriority
      );
      setTotal(t);
      setTickets((prev) => (reset ? rows : [...prev, ...rows]));
      setPage(pageNum);
    } catch (err: any) {
      toast.error("Failed to load tickets", { description: err?.message });
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
    }
  }

  function handleLoadMore() {
    loadPage(page + 1, false);
  }

  function handleTicketCreated(ticket: Ticket) {
    setTickets((prev) => [ticket, ...prev]);
    setTotal((t) => t + 1);
  }

  function handleTicketUpdated(updated: Ticket) {
    setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    if (selectedTicket?.id === updated.id) setSelectedTicket(updated);
  }

  async function handleDeleteTicket(id: string) {
    try {
      await deleteTicket(id);
      setTickets((prev) => prev.filter((t) => t.id !== id));
      setTotal((c) => c - 1);
      setSelectedTicket(null);
      setDetailOpen(false);
      toast.success("Ticket deleted");
    } catch (err: any) {
      toast.error("Failed to delete ticket", { description: err?.message });
    }
  }

  const categoryClass = (cat?: string | null) => {
    switch ((cat || "").toLowerCase()) {
      case "mechanical": return "bg-emerald-100 text-emerald-800";
      case "electrical": return "bg-pink-100 text-pink-800";
      case "software": return "bg-sky-100 text-sky-800";
      default: return "bg-emerald-100 text-emerald-800";
    }
  };

  const hasMore = tickets.length < total;

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <PredictiXLoader label="Loading tickets…" />
      </div>
    );
  }

  const totalAll = (statusCounts.open || 0) + (statusCounts["in-progress"] || 0) + (statusCounts.resolved || 0) + (statusCounts.closed || 0);

  return (
    <div className="w-full space-y-5 pb-10">
      {/* ══ Hero header (dashboard style) ════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-2xl border border-violet-200/60 dark:border-violet-500/20">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50/90 via-white/70 to-sky-50/80 dark:from-violet-950/70 dark:via-slate-950/60 dark:to-sky-950/50 pointer-events-none" />
        <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-gradient-to-br from-violet-400/20 to-sky-400/20 blur-3xl pointer-events-none" />

        <div className="relative px-7 py-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-violet-500 dark:text-violet-400">PredictiX</span>
              <span className="text-muted-foreground/30 text-xs font-light">/</span>
              <span className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground/60">Admin</span>
              <span className="text-muted-foreground/30 text-xs font-light">/</span>
              <span className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground/80">Tickets</span>
            </div>

            <h1 className="flex items-center gap-2.5 text-[26px] font-semibold tracking-[-0.025em] leading-none text-foreground">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-sky-500 text-white shadow-md">
                <TicketIcon className="size-5" />
              </span>
              Support Tickets
            </h1>

            <div className="flex items-center gap-2.5 mt-2.5">
              <p className="text-[12px] text-muted-foreground leading-tight max-w-sm">
                Track, assign and resolve customer-reported issues and AI-flagged alerts.
              </p>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/25 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2.5 shrink-0">
            <Button
              onClick={() => setOpen(true)}
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white shadow-md"
            >
              + New Ticket
            </Button>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100/80 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/25 px-2.5 py-1 text-[10px] font-semibold text-rose-700 dark:text-rose-300">
                <AlertCircle className="h-3 w-3" /> {statusCounts.open || 0} open
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100/80 dark:bg-violet-500/15 border border-violet-200 dark:border-violet-500/25 px-2.5 py-1 text-[10px] font-semibold text-violet-700 dark:text-violet-300">
                <Sparkles className="h-3 w-3" /> {totalAll} total
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ══ Search + filters ═════════════════════════════════════════════════ */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-card shadow-sm p-4">
        <div className="flex w-full items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tickets by title, description…"
              className="pl-9 h-10 bg-background/60 dark:bg-slate-900/60"
            />
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <Select value={selectedStatus} onValueChange={(v) => setSelectedStatus(v)}>
              <SelectTrigger className="w-[160px] h-10">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">
                  <div className="flex items-center gap-2"><AlertCircle className="h-4 w-4 text-rose-500" /><span>Open</span></div>
                </SelectItem>
                <SelectItem value="in-progress">
                  <div className="flex items-center gap-2"><RefreshCw className="h-4 w-4 text-amber-500" /><span>In Progress</span></div>
                </SelectItem>
                <SelectItem value="resolved">
                  <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /><span>Resolved</span></div>
                </SelectItem>
                <SelectItem value="closed">
                  <div className="flex items-center gap-2"><XCircle className="h-4 w-4 text-muted-foreground" /><span>Closed</span></div>
                </SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedPriority} onValueChange={(v) => setSelectedPriority(v)}>
              <SelectTrigger className="w-[160px] h-10">
                <SelectValue placeholder="All Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">
                  <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-rose-500" /><span>High</span></div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex items-center gap-2"><AlertCircle className="h-4 w-4 text-amber-500" /><span>Medium</span></div>
                </SelectItem>
                <SelectItem value="low">
                  <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /><span>Low</span></div>
                </SelectItem>
              </SelectContent>
            </Select>

            <Button variant="ghost" size="sm" className="h-10">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* ══ Status stat tiles ════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { key: "open", label: "Open", value: statusCounts.open || 0, icon: AlertCircle, iconBg: "bg-rose-100 dark:bg-rose-500/15", iconColor: "text-rose-600 dark:text-rose-400", ring: "ring-rose-400", accent: "text-rose-600 dark:text-rose-400" },
          { key: "in-progress", label: "In Progress", value: statusCounts["in-progress"] || 0, icon: RefreshCw, iconBg: "bg-amber-100 dark:bg-amber-500/15", iconColor: "text-amber-600 dark:text-amber-400", ring: "ring-amber-400", accent: "text-amber-600 dark:text-amber-400" },
          { key: "resolved", label: "Resolved", value: statusCounts.resolved || 0, icon: CheckCircle, iconBg: "bg-emerald-100 dark:bg-emerald-500/15", iconColor: "text-emerald-600 dark:text-emerald-400", ring: "ring-emerald-400", accent: "text-emerald-600 dark:text-emerald-400" },
          { key: "closed", label: "Closed", value: statusCounts.closed || 0, icon: XCircle, iconBg: "bg-slate-100 dark:bg-slate-500/15", iconColor: "text-slate-500 dark:text-slate-400", ring: "ring-slate-400", accent: "text-slate-600 dark:text-slate-400" },
        ].map((s) => {
          const Icon = s.icon;
          const active = selectedStatus === s.key;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => setSelectedStatus(active ? "all" : s.key)}
              className={cn(
                "group rounded-xl border border-slate-200 dark:border-slate-700 bg-card shadow-sm p-4 text-left transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
                active && `ring-2 ${s.ring} border-transparent`
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", s.iconBg)}>
                  <Icon className={cn("h-4 w-4", s.iconColor)} />
                </div>
                {active && (
                  <span className="text-[10px] font-bold uppercase tracking-wide text-violet-600 dark:text-violet-400">
                    Filtered
                  </span>
                )}
              </div>
              <p className={cn("text-[22px] font-semibold tracking-tight leading-none", s.accent)}>{s.value}</p>
              <p className="mt-1.5 text-[12px] font-medium text-foreground">{s.label}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                {totalAll > 0 ? `${Math.round((s.value / totalAll) * 100)}% of total` : "—"}
              </p>
            </button>
          );
        })}
      </div>

      {/* Total count */}
      <p className="text-sm text-muted-foreground">
        Showing {tickets.length} of {total} ticket{total !== 1 ? "s" : ""}
      </p>

      {/* ══ Ticket list ══════════════════════════════════════════════════════ */}
      <div className="flex flex-col gap-3">
        {tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card p-10 text-center">
            <div className="rounded-full bg-violet-100 dark:bg-violet-500/15 p-3">
              <TicketIcon className="size-5 text-violet-500" />
            </div>
            <p className="text-sm font-medium text-foreground">No tickets found</p>
            <p className="text-xs text-muted-foreground max-w-xs">
              Try adjusting filters or create a new ticket to get started.
            </p>
          </div>
        ) : (
          tickets.map((t) => {
            const priorityAccent =
              t.priority === "High"
                ? "from-rose-500 to-rose-600"
                : t.priority === "Medium"
                ? "from-amber-500 to-amber-600"
                : "from-emerald-500 to-emerald-600";
            return (
              <div
                key={t.id}
                className="group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-card p-4 pl-5 cursor-pointer transition-all duration-200 hover:border-violet-300/70 dark:hover:border-violet-500/40 hover:shadow-md hover:-translate-y-0.5"
                onClick={() => { setSelectedTicket(t); setDetailOpen(true); }}
              >
                {/* Left accent bar (priority colour) */}
                <span className={cn("absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b", priorityAccent)} />

                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="rounded-md bg-muted/50 dark:bg-muted/30 px-2.5 py-0.5 text-xs font-mono font-semibold text-foreground">
                        {t.ticket_number ?? t.id.slice(0, 8)}
                      </span>

                      <span className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
                        t.priority === "High"
                          ? "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/20"
                          : t.priority === "Medium"
                          ? "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20"
                          : "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20"
                      )}>
                        {t.priority === "High" ? <AlertTriangle className="h-3 w-3" /> : t.priority === "Medium" ? <AlertCircle className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
                        {t.priority}
                      </span>

                      <span className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset capitalize",
                        t.status === "open"
                          ? "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/20"
                          : t.status === "in-progress"
                          ? "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20"
                          : t.status === "resolved"
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20"
                          : "bg-slate-50 text-slate-600 ring-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:ring-slate-500/20"
                      )}>
                        {t.status === "open" ? <AlertCircle className="h-3 w-3" /> : t.status === "in-progress" ? <RefreshCw className="h-3 w-3" /> : t.status === "resolved" ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        {t.status.replace("-", " ")}
                      </span>
                    </div>

                    <h3 className="mt-3 text-base font-semibold text-foreground group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">{t.title}</h3>
                    {t.asset_name && <p className="text-xs text-muted-foreground mt-0.5">{t.asset_name}</p>}
                    {t.description && <p className="text-sm mt-2 text-muted-foreground line-clamp-2">{t.description}</p>}

                    <div className="mt-3 flex items-center gap-3 flex-wrap">
                      <Badge className={cn(categoryClass(t.predicted_category ?? t.final_category), "font-medium")}>
                        {t.predicted_category ?? t.final_category ?? "General"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Created {t.opened_at ? new Date(t.opened_at).toLocaleDateString() : new Date(t.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="ml-2 shrink-0 flex flex-col items-end gap-1 text-xs text-muted-foreground whitespace-nowrap">
                    <span className="text-[10px] uppercase tracking-wide">Assigned</span>
                    {t.assigned_to ? (
                      <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-500/15 dark:text-purple-300 font-mono">{t.assigned_to.slice(0, 8)}</Badge>
                    ) : (
                      <span className="italic">Unassigned</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="min-w-[160px]"
          >
            {loadingMore ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading…</>
            ) : (
              `Load More (${total - tickets.length} remaining)`
            )}
          </Button>
        </div>
      )}

      <NewTicketDialog open={open} onOpenChange={setOpen} onCreated={handleTicketCreated} />
      <TicketDetailsDialog
        ticket={selectedTicket}
        open={detailOpen}
        onOpenChange={(v) => setDetailOpen(v)}
        onDelete={isAdmin ? handleDeleteTicket : undefined}
        onUpdated={isAdmin ? handleTicketUpdated : undefined}
        isAdmin={isAdmin}
      />
    </div>
  );
}
