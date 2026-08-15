"use client";

/**
 * User-role ticket page.
 *
 * Visually inspired by the admin tickets page (kept untouched) but scoped to
 * the logged-in user's own tickets. Backed by the new `/user/tickets` API.
 *
 * Features:
 *  - Search (title / description / ticket_number)
 *  - Status + priority filters
 *  - Mini-dashboard with open / in-progress / resolved / closed counts
 *  - "+ New Ticket" — opens UserNewTicketDialog (POST /user/tickets)
 *  - Click a card — opens UserTicketDetailsDialog (GET/PUT + comments)
 */

import * as React from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Filter,
  Loader2,
  RefreshCw,
  Search,
  Sparkles,
  XCircle,
} from "lucide-react";
import { toast } from "@/lib/customToast";
import { cn } from "@/lib/utils";

import PredictiXLoader from "@/components/loading/PredictiXLoader";
import UserNewTicketDialog from "@/components/user/dialogs/UserNewTicketDialog";
import UserTicketDetailsDialog from "@/components/user/dialogs/UserTicketDetailsDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  listMyTickets,
  getMyTicketStats,
  type UserTicketSummary,
  type UserTicketStats,
} from "@/lib/api/userTickets";
import { listUsers, type UserItem } from "@/lib/userService";

// Values must match the Postgres ENUM labels (`ticket_status`,
// `ticket_priority`). Display label is human-friendly; value is what the
// backend stores.
const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "pending", label: "Pending" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
  { value: "cancelled", label: "Cancelled" },
];

const PRIORITY_OPTIONS = [
  { value: "all", label: "All Priority" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

function priorityRingClass(priority?: string | null) {
  const p = (priority || "").toLowerCase();
  if (p === "high" || p === "critical") return "bg-red-100";
  if (p === "medium") return "bg-amber-100";
  if (p === "low") return "bg-emerald-100";
  return "bg-slate-100";
}

function priorityIcon(priority?: string | null) {
  const p = (priority || "").toLowerCase();
  if (p === "high" || p === "critical")
    return <AlertTriangle className="h-3 w-3 text-red-600" />;
  if (p === "medium") return <AlertCircle className="h-3 w-3 text-amber-500" />;
  return <CheckCircle className="h-3 w-3 text-emerald-500" />;
}

function statusRingClass(status: string) {
  if (status === "open") return "bg-red-100";
  if (status === "in-progress" || status === "in_progress") return "bg-amber-100";
  if (status === "resolved") return "bg-emerald-100";
  return "bg-slate-100";
}

function statusIcon(status: string) {
  if (status === "open") return <AlertCircle className="h-3 w-3 text-red-700" />;
  if (status === "in-progress" || status === "in_progress")
    return <RefreshCw className="h-3 w-3 text-amber-600" />;
  if (status === "resolved")
    return <CheckCircle className="h-3 w-3 text-emerald-600" />;
  return <XCircle className="h-3 w-3 text-slate-600" />;
}

function categoryBadgeClass(cat?: string | null) {
  switch ((cat || "").toLowerCase()) {
    case "mechanical":
      return "bg-emerald-100 text-emerald-800";
    case "electrical":
      return "bg-pink-100 text-pink-800";
    case "software":
      return "bg-sky-100 text-sky-800";
    default:
      return "bg-slate-100 text-slate-800";
  }
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return iso;
  }
}

export default function UserTicketsPage() {
  const [tickets, setTickets] = React.useState<UserTicketSummary[]>([]);
  const [stats, setStats] = React.useState<UserTicketStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const [query, setQuery] = React.useState("");
  const [appliedQuery, setAppliedQuery] = React.useState("");
  const [selectedStatus, setSelectedStatus] = React.useState("all");
  const [selectedPriority, setSelectedPriority] = React.useState("all");
  const [sortBy, setSortBy] = React.useState<"created_at" | "updated_at" | "priority" | "status" | "ticket_number" | "title" | "name">("created_at");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc");

  const [newOpen, setNewOpen] = React.useState(false);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [activeTicketId, setActiveTicketId] = React.useState<string | null>(null);
  const [users, setUsers] = React.useState<UserItem[]>([]);

  // Read the current user id once on mount — needed by the detail dialog to
  // decide if the "Edit" button shows up.
  const currentUserId = React.useMemo(() => {
    if (typeof window === "undefined") return null;
    return (
      localStorage.getItem("predictix.user.id") ||
      localStorage.getItem("user_id") ||
      null
    );
  }, []);

  const userMap = React.useMemo(() => {
    const map = new Map<string, string>();
    users.forEach((u) => {
      map.set(u.id, u.name);
    });
    return map;
  }, [users]);

  const loadTickets = React.useCallback(
    async (mode: "initial" | "refresh" = "initial") => {
      if (mode === "initial") setLoading(true);
      else setRefreshing(true);
      setErrorMsg(null);
      try {
        // The list respects the active filters; the KPI stats are fetched
        // separately so they always show the user's TRUE totals from the DB,
        // independent of the current filter/search/pagination.
        const [res, statsRes] = await Promise.all([
          listMyTickets({
            status: selectedStatus !== "all" ? selectedStatus : undefined,
            priority: selectedPriority !== "all" ? selectedPriority : undefined,
            search: appliedQuery.trim() || undefined,
            sort_by: sortBy,
            sort_dir: sortDir,
            page_size: 100,
          }),
          getMyTicketStats(),
        ]);
        setTickets(res.items);
        setStats(statsRes);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to load tickets";
        setErrorMsg(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [selectedStatus, selectedPriority, appliedQuery, sortBy, sortDir]
  );

  // Initial load — runs once.
  React.useEffect(() => {
    loadTickets("initial");
    listUsers()
      .then(setUsers)
      .catch((err) => console.error("Failed to load users:", err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch when filters change
  React.useEffect(() => {
    loadTickets("refresh");
  }, [selectedStatus, selectedPriority, appliedQuery, sortBy, sortDir, loadTickets]);

  function openDetail(id: string) {
    setActiveTicketId(id);
    setDetailOpen(true);
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <PredictiXLoader label="Loading your tickets…" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* ── Welcome header ── */}
      <div className="relative overflow-hidden rounded-2xl border border-violet-200/60 dark:border-white/10 dark:bg-white/2">
        <div className="absolute inset-0 bg-linear-to-br from-violet-50/90 via-white/70 to-sky-50/80 dark:from-violet-500/8 dark:via-white/2 dark:to-transparent pointer-events-none" />
        <div className="relative px-7 py-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-violet-500 dark:text-violet-400">PredictiX</span>
              <span className="text-muted-foreground/30 text-xs font-light">/</span>
              <span className="text-[10px] tracking-widest uppercase text-muted-foreground/60">User</span>
              <span className="text-muted-foreground/30 text-xs font-light">/</span>
              <span className="text-[10px] tracking-widest uppercase text-muted-foreground/80">Tickets</span>
            </div>
            <h1 className="text-[26px] font-semibold tracking-[-0.025em] leading-none text-foreground">
              My Tickets
            </h1>
            <div className="flex items-center gap-2.5 mt-2.5">
              <p className="text-[12px] text-muted-foreground leading-tight max-w-sm">
                Track issues you&apos;ve reported and the work assigned to you.
              </p>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/25 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2.5 shrink-0">
            {refreshing && (
              <Badge variant="outline" className="gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium text-muted-foreground bg-background/50 backdrop-blur-sm border-border">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Refreshing
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Search + filters bar */}
      <div className="w-full">
        <div className="flex w-full items-center gap-3 rounded-2xl border border-input bg-transparent p-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-2xl">
              <button
                type="button"
                onClick={() => setAppliedQuery(query)}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer z-10"
              >
                <Search className="h-4 w-4" />
              </button>
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setAppliedQuery(query);
                  }
                }}
                placeholder="Search by title, description, ticket number or assignee name…"
                className="pl-12 h-12 rounded-lg"
              />
            </div>

            <Select
              value={`${sortBy}_${sortDir}`}
              onValueChange={(v) => {
                const [by, dir] = v.split("_");
                setSortBy(by as any);
                setSortDir(dir as any);
              }}
            >
              <SelectTrigger className="w-[170px] h-12 rounded-lg">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at_asc">Oldest First</SelectItem>
                <SelectItem value="created_at_desc">Newest First</SelectItem>
                <SelectItem value="title_asc">Name (A-Z)</SelectItem>
                <SelectItem value="title_desc">Name (Z-A)</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">
                    <div className="flex items-center gap-2"><AlertCircle className="h-4 w-4 text-rose-500" /><span>Open</span></div>
                  </SelectItem>
                  <SelectItem value="in_progress">
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

              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All Priority" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(selectedStatus !== "all" || selectedPriority !== "all" || query.trim() !== "" || appliedQuery.trim() !== "" || sortBy !== "created_at" || sortDir !== "asc") && (
              <Button
                variant="ghost"
                size="sm"
                className="h-10 text-muted-foreground hover:text-foreground hover:bg-muted/50 px-3 flex items-center gap-1.5"
                onClick={() => {
                  setQuery("");
                  setAppliedQuery("");
                  setSelectedStatus("all");
                  setSelectedPriority("all");
                  setSortBy("created_at");
                  setSortDir("asc");
                }}
              >
                <XCircle className="h-4 w-4" />
                Clear all
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => loadTickets("refresh")}
            >
              <Filter className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => setNewOpen(true)}
              className="bg-purple-600 hover:bg-purple-500 text-white"
            >
              + New Ticket
            </Button>
          </div>
        </div>
      </div>

      {/* Mini dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="card-dynamic cursor-default hover:bg-red-50 dark:hover:bg-red-900/40 transition-colors">
          <CardContent className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-red-500" />
            <div>
              <div className="text-sm text-muted-foreground">Open</div>
              <div className="text-xl font-semibold">{stats?.open ?? 0}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-dynamic cursor-default hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-colors">
          <CardContent className="flex items-center gap-3">
            <RefreshCw className="h-6 w-6 text-amber-500" />
            <div>
              <div className="text-sm text-muted-foreground">In Progress</div>
              <div className="text-xl font-semibold">{stats?.in_progress ?? 0}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-dynamic cursor-default hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors">
          <CardContent className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-emerald-500" />
            <div>
              <div className="text-sm text-muted-foreground">Resolved</div>
              <div className="text-xl font-semibold">{stats?.resolved ?? 0}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-dynamic cursor-default hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
          <CardContent className="flex items-center gap-3">
            <XCircle className="h-6 w-6 text-slate-500" />
            <div>
              <div className="text-sm text-muted-foreground">Closed</div>
              <div className="text-xl font-semibold">{stats?.closed ?? 0}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error banner */}
      {errorMsg && (
        <div className="rounded-md border border-red-200 bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-700 dark:text-red-300">
          {errorMsg}
        </div>
      )}

      {/* Tickets list */}
      <div className="rounded-[24px] border border-border/50 bg-card/30 backdrop-blur-xl shadow-sm overflow-hidden flex flex-col h-[600px]">
        {/* Header row (hidden on small screens) */}
        <div className="hidden md:flex items-center gap-4 p-4 px-6 border-b border-border/40 bg-muted/20 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          <div className="w-[100px]">Ticket ID</div>
          <div className="flex-1">Details</div>
          <div className="w-[130px]">Status</div>
          <div className="w-[130px]">Priority</div>
          <div className="w-[100px] text-right">Created</div>
        </div>

        {/* Scrollable list area */}
        <div className="flex-1 overflow-y-auto scrollbar-styled p-2 md:p-3 flex flex-col gap-1">
          {tickets.length === 0 && !errorMsg && (
            <div className="flex h-full flex-col items-center justify-center p-12 text-center">
              <CheckCircle className="h-8 w-8 text-violet-500 opacity-90 mb-4" />
              <p className="text-base font-bold text-foreground">No tickets found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your filters, or click <strong className="text-violet-600 dark:text-violet-400 font-semibold">+ New Ticket</strong>.
              </p>
            </div>
          )}

          {tickets.map((t) => {
            const displayPriority = t.final_priority || t.priority || t.predicted_priority;
            const displayCategory = t.final_category || t.predicted_category;
            
            const s = (t.status || "").toLowerCase();
            const statusBorder =
              s === "open"
                ? "border-rose-500/30 dark:border-rose-500/25 hover:border-rose-500 dark:hover:border-rose-500/60"
                : s === "in-progress" || s === "in_progress"
                ? "border-amber-500/30 dark:border-amber-500/25 hover:border-amber-500 dark:hover:border-amber-500/60"
                : s === "resolved"
                ? "border-emerald-500/30 dark:border-emerald-500/25 hover:border-emerald-500 dark:hover:border-emerald-500/60"
                : "border-slate-500/30 dark:border-slate-500/25 hover:border-slate-500 dark:hover:border-slate-500/60";

            return (
              <div
                key={t.id}
                onClick={() => openDetail(t.id)}
                className={cn(
                  "group flex flex-col md:flex-row md:items-center gap-3 md:gap-4 p-3 px-4 md:px-3 rounded-xl hover:bg-card/80 hover:shadow-sm transition-all cursor-pointer border",
                  statusBorder
                )}
              >
                <div className="w-auto md:w-[100px] flex items-center">
                  <span className="inline-flex items-center rounded-full bg-background/80 px-2.5 py-0.5 text-[10px] font-bold text-muted-foreground ring-1 ring-inset ring-border">
                    #{t.ticket_number}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[14px] font-bold text-foreground group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors truncate">
                      {t.title}
                    </h3>
                    {t.predicted_priority && !t.final_priority && t.predicted_priority !== t.priority && (
                      <span className="hidden sm:flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded-full ring-1 ring-violet-500/20">
                        <Sparkles className="h-3 w-3" /> AI
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {displayCategory && (
                      <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">
                        {displayCategory}
                      </span>
                    )}
                    {t.assigned_to && (
                      <>
                        <span className="text-[9px] text-muted-foreground/40">•</span>
                        <span className="text-[10px] font-semibold text-violet-600/80 dark:text-violet-400/80">
                          {userMap.get(t.assigned_to) ?? t.assigned_to.slice(0, 8)}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 md:gap-4 flex-wrap mt-2 md:mt-0">
                  <div className="w-auto md:w-[130px]">
                    <div className="inline-flex items-center gap-1.5 bg-background/60 rounded-full pr-2.5 ring-1 ring-border/50">
                      <span className={`flex items-center justify-center h-5 w-5 rounded-full shadow-inner ${statusRingClass(t.status)}`}>
                        {statusIcon(t.status)}
                      </span>
                      <span className="text-[10px] font-bold capitalize text-foreground/80 tracking-wide">
                        {t.status.replace(/[-_]/g, " ")}
                      </span>
                    </div>
                  </div>

                  <div className="w-auto md:w-[130px]">
                    <div className="inline-flex items-center gap-1.5 bg-background/60 rounded-full pr-2.5 ring-1 ring-border/50">
                      <span className={`flex items-center justify-center h-5 w-5 rounded-full shadow-inner ${priorityRingClass(displayPriority)}`}>
                        {priorityIcon(displayPriority)}
                      </span>
                      <span className="text-[10px] font-bold capitalize text-foreground/80 tracking-wide">
                        {displayPriority || "unset"}
                      </span>
                    </div>
                  </div>

                  <div className="w-auto md:w-[100px] md:text-right hidden sm:block">
                    <span className="text-[10px] font-semibold text-muted-foreground whitespace-nowrap">
                      {formatDate(t.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <UserNewTicketDialog
        open={newOpen}
        onOpenChange={setNewOpen}
        onCreated={() => loadTickets("refresh")}
      />
      <UserTicketDetailsDialog
        open={detailOpen}
        onOpenChange={(v) => {
          setDetailOpen(v);
          if (!v) setActiveTicketId(null);
        }}
        ticketId={activeTicketId}
        currentUserId={currentUserId}
        onUpdated={() => loadTickets("refresh")}
        users={users}
      />
    </div>
  );
}
