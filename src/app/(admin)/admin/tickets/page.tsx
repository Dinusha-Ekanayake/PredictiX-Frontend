"use client";

import * as React from "react";
import { Search, Filter, AlertTriangle, CheckCircle, AlertCircle, RefreshCw, XCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
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
  deleteTicket,
  type Ticket,
} from "@/lib/ticketService";

export default function AdminTicketsPage() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [tickets, setTickets] = React.useState<Ticket[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(0);
  const [loadingMore, setLoadingMore] = React.useState(false);

  const [open, setOpen] = React.useState(false);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [selectedTicket, setSelectedTicket] = React.useState<Ticket | null>(null);

  const [query, setQuery] = React.useState("");
  const [debouncedQuery, setDebouncedQuery] = React.useState("");
  const [selectedStatus, setSelectedStatus] = React.useState("all");
  const [selectedPriority, setSelectedPriority] = React.useState("all");

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
    } catch (err) {
      toast.error("Failed to load tickets", {
        description: err instanceof Error ? err.message : undefined,
      });
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
    } catch (err) {
      toast.error("Failed to delete ticket", {
        description: err instanceof Error ? err.message : undefined,
      });
    }
  }

  const stats = React.useMemo(() => {
    const s: Record<string, number> = { open: 0, "in-progress": 0, resolved: 0, closed: 0 };
    tickets.forEach((t) => { s[t.status] = (s[t.status] || 0) + 1; });
    return s;
  }, [tickets]);

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

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Tickets</h1>
        <p className="text-sm text-muted-foreground">Manage support tickets and alerts.</p>
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
                placeholder="Search tickets by title, description…"
                className="pl-12 h-12 rounded-lg"
              />
            </div>

            <div className="hidden items-center gap-2 sm:flex">
              <Select value={selectedStatus} onValueChange={(v) => setSelectedStatus(v)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">
                    <div className="flex items-center gap-2"><AlertCircle className="h-4 w-4 text-destructive" /><span>Open</span></div>
                  </SelectItem>
                  <SelectItem value="in-progress">
                    <div className="flex items-center gap-2"><RefreshCw className="h-4 w-4 text-amber-400" /><span>In Progress</span></div>
                  </SelectItem>
                  <SelectItem value="resolved">
                    <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-400" /><span>Resolved</span></div>
                  </SelectItem>
                  <SelectItem value="closed">
                    <div className="flex items-center gap-2"><XCircle className="h-4 w-4 text-muted-foreground" /><span>Closed</span></div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedPriority} onValueChange={(v) => setSelectedPriority(v)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" /><span>High</span></div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2"><AlertCircle className="h-4 w-4 text-amber-400" /><span>Medium</span></div>
                  </SelectItem>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-400" /><span>Low</span></div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Filter className="h-4 w-4" />
            </Button>
            <Button onClick={() => setOpen(true)} className="bg-purple-600 hover:bg-purple-500 text-white">
              + New Ticket
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-dynamic cursor-default hover:bg-red-50 dark:hover:bg-red-900/40 transition-colors">
          <CardContent className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-red-500" />
            <div>
              <div className="text-sm text-muted-foreground">Open</div>
              <div className="text-xl font-semibold">{stats.open}</div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-dynamic cursor-default hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-colors">
          <CardContent className="flex items-center gap-3">
            <RefreshCw className="h-6 w-6 text-amber-500" />
            <div>
              <div className="text-sm text-muted-foreground">In Progress</div>
              <div className="text-xl font-semibold">{stats["in-progress"]}</div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-dynamic cursor-default hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors">
          <CardContent className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-emerald-500" />
            <div>
              <div className="text-sm text-muted-foreground">Resolved</div>
              <div className="text-xl font-semibold">{stats.resolved}</div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-dynamic cursor-default hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
          <CardContent className="flex items-center gap-3">
            <XCircle className="h-6 w-6 text-slate-500" />
            <div>
              <div className="text-sm text-muted-foreground">Closed</div>
              <div className="text-xl font-semibold">{stats.closed}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Total count */}
      <p className="text-sm text-muted-foreground">
        Showing {tickets.length} of {total} ticket{total !== 1 ? "s" : ""}
      </p>

      {/* Ticket list */}
      <div className="flex flex-col gap-4">
        {tickets.length === 0 ? (
          <div className="rounded-xl border p-8 text-center text-muted-foreground">
            No tickets found.
          </div>
        ) : (
          tickets.map((t) => (
            <div
              key={t.id}
              className="ticket-dynamic rounded-xl border p-4 cursor-pointer transform-gpu will-change-transform hover:scale-[1.01] hover:bg-muted/10 dark:hover:bg-muted/20 hover:shadow-lg transition-transform duration-150 ease-out"
              onClick={() => { setSelectedTicket(t); setDetailOpen(true); }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="rounded-md bg-muted/30 px-3 py-1 text-sm font-medium">
                      {t.ticket_number ?? t.id.slice(0, 8)}
                    </span>

                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center justify-center h-5 w-5 rounded-full ${t.priority === "High" ? "bg-red-100" : t.priority === "Medium" ? "bg-amber-100" : "bg-emerald-100"}`}>
                        {t.priority === "High" ? <AlertTriangle className="h-3 w-3 text-red-600" /> : t.priority === "Medium" ? <AlertCircle className="h-3 w-3 text-amber-500" /> : <CheckCircle className="h-3 w-3 text-emerald-500" />}
                      </span>
                      <span className="text-sm font-medium">{t.priority}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center justify-center h-5 w-5 rounded-full ${t.status === "open" ? "bg-red-100" : t.status === "in-progress" ? "bg-amber-100" : t.status === "resolved" ? "bg-emerald-100" : "bg-slate-100"}`}>
                        {t.status === "open" ? <AlertCircle className="h-3 w-3 text-red-700" /> : t.status === "in-progress" ? <RefreshCw className="h-3 w-3 text-amber-600" /> : t.status === "resolved" ? <CheckCircle className="h-3 w-3 text-emerald-600" /> : <XCircle className="h-3 w-3 text-slate-600" />}
                      </span>
                      <span className="text-sm font-medium">{t.status.replace("-", " ")}</span>
                    </div>
                  </div>

                  <h3 className="mt-3 text-lg font-semibold">{t.title}</h3>
                  {t.asset_name && <p className="text-sm text-muted-foreground mt-1">{t.asset_name}</p>}
                  {t.description && <p className="text-sm mt-2 text-muted-foreground line-clamp-2">{t.description}</p>}

                  <div className="mt-3 flex items-center gap-3 flex-wrap">
                    <Badge className={categoryClass(t.predicted_category ?? t.final_category)}>
                      {t.predicted_category ?? t.final_category ?? "General"}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Created: {t.opened_at ? new Date(t.opened_at).toLocaleDateString() : new Date(t.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="ml-4 text-sm text-muted-foreground whitespace-nowrap flex items-center gap-2">
                  Assigned to:{" "}
                  {t.assigned_to ? (
                    <Badge className="bg-purple-100 text-purple-800">{t.assigned_to.slice(0, 8)}</Badge>
                  ) : (
                    <span>Unassigned</span>
                  )}
                </div>
              </div>
            </div>
          ))
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
        onDelete={handleDeleteTicket}
        onUpdated={handleTicketUpdated}
      />
    </div>
  );
}
