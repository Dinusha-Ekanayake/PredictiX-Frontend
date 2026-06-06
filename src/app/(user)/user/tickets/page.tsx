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
import { toast } from "sonner";

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
  const [selectedStatus, setSelectedStatus] = React.useState("all");
  const [selectedPriority, setSelectedPriority] = React.useState("all");

  const [newOpen, setNewOpen] = React.useState(false);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [activeTicketId, setActiveTicketId] = React.useState<string | null>(null);

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
            search: query.trim() || undefined,
            sort_by: "created_at",
            sort_dir: "desc",
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
    [selectedStatus, selectedPriority, query]
  );

  // Initial load — runs once.
  React.useEffect(() => {
    loadTickets("initial");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch when filters change (debounced for search).
  React.useEffect(() => {
    const t = setTimeout(() => {
      loadTickets("refresh");
    }, 300);
    return () => clearTimeout(t);
  }, [selectedStatus, selectedPriority, query, loadTickets]);

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
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">My Tickets</h1>
          <p className="text-sm text-muted-foreground">
            Track issues you&apos;ve reported and the work assigned to you.
          </p>
        </div>
        {refreshing && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mt-2" />
        )}
      </div>

      {/* Search + filters bar */}
      <div className="w-full">
        <div className="flex w-full items-center gap-3 rounded-2xl border border-input bg-transparent p-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title, description or ticket number…"
                className="pl-12 h-12 rounded-lg"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
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
      <div className="flex flex-col gap-4">
        {tickets.length === 0 && !errorMsg && (
          <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
            No tickets match your filters. Click <strong>+ New Ticket</strong> to
            create one.
          </div>
        )}

        {tickets.map((t) => {
          const displayPriority = t.final_priority || t.priority || t.predicted_priority;
          const displayCategory = t.final_category || t.predicted_category;
          return (
            <div
              key={t.id}
              className="ticket-dynamic rounded-xl border p-4 cursor-pointer transform-gpu will-change-transform hover:scale-[1.01] hover:bg-muted/10 dark:hover:bg-muted/20 hover:shadow-lg transition-transform duration-150 ease-out"
              onClick={() => openDetail(t.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-md bg-muted/30 px-3 py-1 text-sm font-medium">
                      {t.ticket_number}
                    </span>

                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center justify-center h-5 w-5 rounded-full ${priorityRingClass(displayPriority)}`}
                      >
                        {priorityIcon(displayPriority)}
                      </span>
                      <span className="text-sm font-medium capitalize">
                        {displayPriority || "unset"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center justify-center h-5 w-5 rounded-full ${statusRingClass(t.status)}`}
                      >
                        {statusIcon(t.status)}
                      </span>
                      <span className="text-sm font-medium capitalize">
                        {t.status.replace(/[-_]/g, " ")}
                      </span>
                    </div>

                    {t.predicted_priority &&
                      !t.final_priority &&
                      t.predicted_priority !== t.priority && (
                        <span className="inline-flex items-center gap-1 text-xs text-violet-600">
                          <Sparkles className="h-3 w-3" />
                          AI suggested
                        </span>
                      )}
                  </div>

                  <h3 className="mt-3 text-lg font-semibold truncate">{t.title}</h3>

                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    {displayCategory && (
                      <Badge className={categoryBadgeClass(displayCategory)}>
                        {displayCategory}
                      </Badge>
                    )}
                    <span className="text-sm text-muted-foreground">
                      Created: {formatDate(t.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
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
      />
    </div>
  );
}
