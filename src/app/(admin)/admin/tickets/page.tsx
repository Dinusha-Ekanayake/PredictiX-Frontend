"use client";

import * as React from "react";
import { Search, Filter, AlertTriangle, CheckCircle, AlertCircle, RefreshCw, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

type Ticket = {
  id: string;
  asset: string;
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  status: "open" | "in-progress" | "resolved" | "closed";
  category: string;
  assignedTo?: string;
  createdAt: string;
};

export default function AdminTicketsPage() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [selectedTicket, setSelectedTicket] = React.useState<Ticket | null>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const MOCK_TICKETS: Ticket[] = [
    { id: "T-1001", asset: "Compressor A-14", title: "Vibration spike detected", description: "RMS exceeded threshold during last cycle.", priority: "High", status: "open", category: "Mechanical", assignedTo: "Tech-01", createdAt: "2026-02-14" },
    { id: "T-1002", asset: "Pump P-09", title: "Temperature rising trend", description: "Gradual temp increase over 3 hours.", priority: "Medium", status: "open", category: "Electrical", assignedTo: "Tech-02", createdAt: "2026-02-13" },
    { id: "T-1003", asset: "Motor M-02", title: "Minor sensor drift", description: "Sensor offset observed intermittently.", priority: "Low", status: "open", category: "Software", assignedTo: "Tech-03", createdAt: "2026-02-12" },

    { id: "T-2001", asset: "Conveyor B-12", title: "Strange noise during run", description: "Grinding noise coming from bearing area.", priority: "High", status: "in-progress", category: "Mechanical", assignedTo: "Tech-01", createdAt: "2026-02-11" },
    { id: "T-2002", asset: "Heater H-07", title: "Intermittent trip", description: "Circuit trips under load occasionally.", priority: "Medium", status: "in-progress", category: "Electrical", assignedTo: "Tech-02", createdAt: "2026-02-10" },
    { id: "T-2003", asset: "Sensor S-21", title: "Calibration needed", description: "Periodic re-calibration recommended.", priority: "Low", status: "in-progress", category: "Software", assignedTo: "Tech-03", createdAt: "2026-02-09" },

    { id: "T-3001", asset: "Crane LD-03", title: "Load imbalance resolved", description: "Root cause fixed and verified.", priority: "High", status: "resolved", category: "Mechanical", assignedTo: "Tech-04", createdAt: "2026-02-08" },
    { id: "T-3002", asset: "Pump P-11", title: "Seal replaced", description: "Leak fixed, monitoring for recurrence.", priority: "Medium", status: "resolved", category: "Mechanical", assignedTo: "Tech-05", createdAt: "2026-02-07" },
    { id: "T-3003", asset: "Fan F-02", title: "Imbalance corrected", description: "Fan balanced and vibration reduced.", priority: "Low", status: "resolved", category: "Mechanical", assignedTo: "Tech-06", createdAt: "2026-02-06" },

    { id: "T-4001", asset: "Generator G-01", title: "Closed - awaiting parts", description: "Ticket closed but unresolved (awaiting long-lead parts).", priority: "High", status: "closed", category: "Electrical", assignedTo: "Tech-07", createdAt: "2026-02-05" },
    { id: "T-4002", asset: "Valve V-08", title: "Closed - monitoring", description: "Issue closed, continue to monitor.", priority: "Medium", status: "closed", category: "Mechanical", assignedTo: "Tech-08", createdAt: "2026-02-04" },
    { id: "T-4003", asset: "Gauge G-12", title: "Closed - informational", description: "Routine notice, no action required.", priority: "Low", status: "closed", category: "Software", assignedTo: "Tech-09", createdAt: "2026-02-03" },
  ];
  // default order: inverse of initial array (newest first by createdAt)
  const [tickets, setTickets] = React.useState<Ticket[]>(() => {
    return MOCK_TICKETS.slice().sort((a, b) => {
      // ISO date strings compare correctly
      if (a.createdAt < b.createdAt) return 1;
      if (a.createdAt > b.createdAt) return -1;
      return 0;
    });
  });
  const dragItemId = React.useRef<string | null>(null);
  const dragGhostRef = React.useRef<HTMLElement | null>(null);
  const draggedElRef = React.useRef<HTMLElement | null>(null);
  const [query, setQuery] = React.useState("");
  const [selectedStatus, setSelectedStatus] = React.useState<string>("all");
  const [selectedPriority, setSelectedPriority] = React.useState<string>("all");

  const categoryClass = React.useCallback((cat?: string) => {
    switch ((cat || "").toLowerCase()) {
      case "mechanical":
        return "bg-emerald-100 text-emerald-800";
      case "electrical":
        return "bg-pink-100 text-pink-800";
      case "software":
        return "bg-sky-100 text-sky-800";
      default:
        return "bg-emerald-100 text-emerald-800";
    }
  }, []);

  function handleDragStart(e: React.DragEvent, id: string) {
    dragItemId.current = id;
    e.dataTransfer.effectAllowed = "move";
    try {
      e.dataTransfer.setData("text/plain", id);
    } catch {}

    // Create a visual clone (ghost) that follows the mouse and scale/darken it
    const target = e.currentTarget as HTMLElement;
    draggedElRef.current = target;
    try {
      const rect = target.getBoundingClientRect();
      const clone = target.cloneNode(true) as HTMLElement;
      clone.style.position = "fixed";
      clone.style.left = `${e.clientX}px`;
      clone.style.top = `${e.clientY}px`;
      clone.style.width = `${rect.width}px`;
      clone.style.pointerEvents = "none";
      clone.style.zIndex = "9999";
      clone.style.margin = "0";
      clone.style.transition = "transform 120ms ease, left 0ms, top 0ms";
      clone.style.transform = "translate(-50%,-50%) scale(1.15)";
      clone.style.filter = "brightness(0.85)";
      document.body.appendChild(clone);
      dragGhostRef.current = clone;
      // Use our clone as the native drag image so browsers don't create a semi-transparent default
      try {
        e.dataTransfer.setDragImage(clone, e.clientX - rect.left, e.clientY - rect.top);
      } catch {}
    } catch {}

    // darken the original element slightly (do NOT make it transparent)
    try {
      target.style.filter = "brightness(0.92)";
      // ensure it's not made transparent by the UA during drag
      target.style.opacity = "1";
      target.style.visibility = "visible";
    } catch {}
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    // Move ghost to follow cursor
    const ghost = dragGhostRef.current;
    if (ghost) {
      try {
        ghost.style.left = `${e.clientX}px`;
        ghost.style.top = `${e.clientY}px`;
      } catch {}
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || dragItemId.current;
    const target = e.currentTarget as HTMLElement;
    const indexAttr = target.dataset.index;
    if (!id || indexAttr === undefined) return;
    const toIndex = Number(indexAttr);
    setTickets((prev) => {
      const fromIndex = prev.findIndex((p) => p.id === id);
      if (fromIndex === -1) return prev;
      const next = prev.slice();
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
    dragItemId.current = null;

    // cleanup ghost and restore original appearance (remove brightness filter)
    try {
      if (dragGhostRef.current && dragGhostRef.current.parentElement) {
        dragGhostRef.current.parentElement.removeChild(dragGhostRef.current);
      }
    } catch {}
    dragGhostRef.current = null;
    try {
      if (draggedElRef.current) draggedElRef.current.style.filter = "";
    } catch {}
    draggedElRef.current = null;
  }

  function handleDragEnd() {
    // cleanup if drag ends without drop
    try {
      if (dragGhostRef.current && dragGhostRef.current.parentElement) {
        dragGhostRef.current.parentElement.removeChild(dragGhostRef.current);
      }
    } catch {}
    dragGhostRef.current = null;
    try {
      if (draggedElRef.current) draggedElRef.current.style.filter = "";
    } catch {}
    draggedElRef.current = null;
    dragItemId.current = null;
  }

  const filteredTickets = React.useMemo(() => {
    return tickets.filter((t) => {
      // status filter
      if (selectedStatus && selectedStatus !== "all" && t.status !== selectedStatus) return false;
      // priority filter (select values are lowercase)
      if (selectedPriority && selectedPriority !== "all" && t.priority.toLowerCase() !== selectedPriority) return false;
      // search
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        t.id.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.asset.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      );
    });
  }, [tickets, query, selectedStatus, selectedPriority]);

  const stats = React.useMemo(() => {
    const s = { open: 0, "in-progress": 0, resolved: 0, closed: 0 } as Record<string, number>;
    tickets.forEach((t) => {
      s[t.status] = (s[t.status] || 0) + 1;
    });
    return s;
  }, [tickets]);

  function handleDeleteTicket(id: string) {
    setTickets((prev) => prev.filter((t) => t.id !== id));
    setSelectedTicket(null);
    setDetailOpen(false);
  }

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
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tickets..." className="pl-12 h-12 rounded-lg" />
            </div>

            <div className="hidden items-center gap-2 sm:flex">
              <Select value={selectedStatus} onValueChange={(v) => setSelectedStatus(v)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      <span>Open</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="in-progress">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 text-amber-400" />
                      <span>In Progress</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="resolved">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                      <span>Resolved</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="closed">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                      <span>Closed</span>
                    </div>
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
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      <span>High</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-400" />
                      <span>Medium</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                      <span>Low</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                  <Filter className="h-4 w-4" />
                </Button>
                <Button onClick={() => setOpen(true)} className="bg-purple-600 hover:bg-purple-500 text-white">+ New Ticket</Button>
              </div>
        </div>
      </div>

      {/* Mini dashboard */}
      <div className="grid grid-cols-4 gap-4">
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
      {/* Tickets list */}
      <div className="flex flex-col gap-4">
        {tickets.map((t, idx) => (
          <div
            key={t.id}
            data-id={t.id}
            data-index={idx}
            draggable
            onDragStart={(e) => handleDragStart(e, t.id)}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
            className="ticket-dynamic rounded-xl border p-4 cursor-move transform-gpu will-change-transform hover:scale-[1.01] hover:bg-muted/10 dark:hover:bg-muted/20 hover:shadow-lg transition-transform duration-150 ease-out hover:z-10"
            onClick={() => {
              setSelectedTicket(t);
              setDetailOpen(true);
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="rounded-md bg-muted/30 px-3 py-1 text-sm font-medium">{t.id}</span>

                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center justify-center h-5 w-5 rounded-full ${t.priority === "High" ? "bg-red-100" : t.priority === "Medium" ? "bg-amber-100" : "bg-emerald-100"}`}>
                      {t.priority === "High" ? (
                        <AlertTriangle className="h-3 w-3 text-red-600" />
                      ) : t.priority === "Medium" ? (
                        <AlertCircle className="h-3 w-3 text-amber-500" />
                      ) : (
                        <CheckCircle className="h-3 w-3 text-emerald-500" />
                      )}
                    </span>
                    <span className="text-sm font-medium">{t.priority}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center justify-center h-5 w-5 rounded-full ${t.status === "open" ? "bg-red-100" : t.status === "in-progress" ? "bg-amber-100" : t.status === "resolved" ? "bg-emerald-100" : "bg-slate-100"}`}>
                      {t.status === "open" ? (
                        <AlertCircle className="h-3 w-3 text-red-700" />
                      ) : t.status === "in-progress" ? (
                        <RefreshCw className="h-3 w-3 text-amber-600" />
                      ) : t.status === "resolved" ? (
                        <CheckCircle className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <XCircle className="h-3 w-3 text-slate-600" />
                      )}
                    </span>
                    <span className="text-sm font-medium">{t.status.replace("-", " ")}</span>
                  </div>
                </div>

                <h3 className="mt-3 text-lg font-semibold">{t.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{t.asset}</p>
                <p className="text-sm mt-2 text-muted-foreground">{t.description}</p>

                <div className="mt-3 flex items-center gap-3">
                  <Badge className="bg-emerald-100 text-emerald-800">{t.category}</Badge>
                  <span className="text-sm text-muted-foreground">Created: {t.createdAt}</span>
                </div>
              </div>

              <div className="ml-4 text-sm text-muted-foreground whitespace-nowrap flex items-center gap-2">Assigned to: {t.assignedTo ? <span><Badge className="bg-purple-100 text-purple-800">{t.assignedTo}</Badge></span> : <span className="text-sm">Unassigned</span>}</div>
            </div>
          </div>
        ))}
      </div>
      <NewTicketDialog open={open} onOpenChange={setOpen} />
      <TicketDetailsDialog ticket={selectedTicket} open={detailOpen} onOpenChange={(v) => setDetailOpen(v)} onDelete={handleDeleteTicket} />
    </div>
  );
}

