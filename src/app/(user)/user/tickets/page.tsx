"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Search, AlertCircle, RefreshCw, CheckCircle, XCircle, AlertTriangle,
  Plus, Pencil, Trash2, Loader2, Ticket as TicketIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import PredictiXLoader from "@/components/loading/PredictiXLoader";
import NewTicketDialog from "@/components/admin/dialogs/NewTicketDialog";
import EditTicketDialog from "@/components/user/tickets/EditTicketDialog";
import { fetchMyTickets, deleteTicket, type Ticket } from "@/lib/ticketService";
import { getUser } from "@/lib/authService";

const PRI_CLS: Record<string, string> = {
  High: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  Medium: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  Low: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
};
const STATUS_ICON: Record<string, React.ElementType> = {
  open: AlertCircle, "in-progress": RefreshCw, resolved: CheckCircle, closed: XCircle,
};

export default function UserTicketsPage() {
  const userId = React.useMemo(() => getUser()?.id ?? null, []);

  const [isLoading, setIsLoading] = React.useState(true);
  const [tickets, setTickets] = React.useState<Ticket[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(0);
  const [loadingMore, setLoadingMore] = React.useState(false);

  const [query, setQuery] = React.useState("");
  const [debouncedQuery, setDebouncedQuery] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const [priority, setPriority] = React.useState("all");

  const [newOpen, setNewOpen] = React.useState(false);
  const [editTicket, setEditTicket] = React.useState<Ticket | null>(null);

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(t);
  }, [query]);

  const loadPage = React.useCallback(
    async (pageNum: number, reset: boolean) => {
      if (!userId) return;
      if (pageNum === 0) setIsLoading(true); else setLoadingMore(true);
      try {
        const { tickets: rows, total: t } = await fetchMyTickets(userId, pageNum, debouncedQuery, status, priority);
        setTotal(t);
        setTickets((prev) => (reset ? rows : [...prev, ...rows]));
        setPage(pageNum);
      } catch (err) {
        toast.error("Failed to load your tickets", { description: err instanceof Error ? err.message : undefined });
      } finally {
        setIsLoading(false);
        setLoadingMore(false);
      }
    },
    [userId, debouncedQuery, status, priority],
  );

  React.useEffect(() => {
    setPage(0);
    setTickets([]);
    loadPage(0, true);
  }, [loadPage]);

  function handleCreated(ticket: Ticket) {
    setTickets((prev) => [ticket, ...prev]);
    setTotal((t) => t + 1);
  }
  function handleUpdated(updated: Ticket) {
    setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }
  async function handleDelete(t: Ticket) {
    if (!confirm(`Delete ticket "${t.title}"? This cannot be undone.`)) return;
    try {
      await deleteTicket(t.id);
      setTickets((prev) => prev.filter((x) => x.id !== t.id));
      setTotal((c) => Math.max(0, c - 1));
      toast.success("Ticket deleted");
    } catch (err) {
      toast.error("Failed to delete ticket", { description: err instanceof Error ? err.message : undefined });
    }
  }

  if (!userId) {
    return <div className="rounded-2xl border p-8 text-center text-muted-foreground">Please log in to view your tickets.</div>;
  }
  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <PredictiXLoader label="Loading your tickets…" />
      </div>
    );
  }

  const hasMore = tickets.length < total;

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">My Tickets</h1>
        <p className="text-sm text-muted-foreground">Tickets you have created. You can edit or delete your own tickets.</p>
      </div>

      {/* Filters */}
      <div className="flex w-full flex-col gap-3 rounded-2xl border border-input p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search your tickets…" className="h-11 rounded-lg pl-12" />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="All Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setNewOpen(true)} className="gap-1.5 bg-purple-600 text-white hover:bg-purple-500">
          <Plus className="h-4 w-4" /> New Ticket
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">Showing {tickets.length} of {total} ticket{total !== 1 ? "s" : ""}</p>

      {/* List */}
      <div className="flex flex-col gap-4">
        {tickets.length === 0 ? (
          <div className="rounded-xl border p-10 text-center text-muted-foreground">
            <TicketIcon className="mx-auto mb-3 h-8 w-8 opacity-40" />
            You haven&apos;t created any tickets yet.
          </div>
        ) : (
          tickets.map((t) => {
            const SIcon = STATUS_ICON[t.status] ?? AlertCircle;
            return (
              <div key={t.id} className="rounded-xl border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-muted/40 px-2.5 py-0.5 text-sm font-medium">{t.ticket_number ?? t.id.slice(0, 8)}</span>
                      <Badge className={PRI_CLS[t.priority] ?? PRI_CLS.Medium}>
                        {t.priority === "High" ? <AlertTriangle className="mr-1 h-3 w-3" /> : null}{t.priority}
                      </Badge>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                        <SIcon className="h-3.5 w-3.5" />{t.status.replace("-", " ")}
                      </span>
                    </div>
                    <h3 className="mt-2 text-lg font-semibold">{t.title}</h3>
                    {t.asset_name && <p className="mt-0.5 text-sm text-muted-foreground">{t.asset_name}</p>}
                    {t.description && <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{t.description}</p>}
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <Badge variant="outline" className="capitalize">{t.predicted_category ?? t.final_category ?? "General"}</Badge>
                      <span className="text-xs text-muted-foreground">
                        Created {new Date(t.opened_at ?? t.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col gap-2">
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setEditTicket(t)}>
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button variant="destructive" size="sm" className="gap-1.5" onClick={() => handleDelete(t)}>
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button variant="outline" onClick={() => loadPage(page + 1, false)} disabled={loadingMore} className="min-w-[160px]">
            {loadingMore ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading…</> : `Load More (${total - tickets.length} remaining)`}
          </Button>
        </div>
      )}

      <NewTicketDialog open={newOpen} onOpenChange={setNewOpen} onCreated={handleCreated} createdBy={userId} />
      <EditTicketDialog open={editTicket !== null} onOpenChange={(o) => { if (!o) setEditTicket(null); }} ticket={editTicket} onUpdated={handleUpdated} />
    </div>
  );
}
