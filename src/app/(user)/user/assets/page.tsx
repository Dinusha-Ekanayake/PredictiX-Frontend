"use client";

import * as React from "react";
import { toast } from "sonner";
import { Search, Boxes, MapPin, CalendarClock, Ticket as TicketIcon, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PredictiXLoader from "@/components/loading/PredictiXLoader";
import NewTicketDialog from "@/components/admin/dialogs/NewTicketDialog";
import PageHero from "@/components/common/PageHero";
import { fetchMyAssets, type UserAssetData } from "@/lib/api/userProfileApi";
import { listAssets } from "@/components/admin/assets/assetService";
import type { Asset } from "@/components/admin/assets/types";
import { createMyTicket } from "@/lib/userTicketService";

function healthColor(p: number) {
  return p >= 80 ? "#10b981" : p >= 60 ? "#f59e0b" : "#ef4444";
}
function daysUntil(d: string | null) {
  return d ? Math.ceil((new Date(d).getTime() - Date.now()) / 86_400_000) : null;
}

/** Unified row shape so assigned + searched assets render the same way. */
type Row = {
  id: string;
  code: string;
  name: string;
  category: string | null;
  location: string | null;
  status: string;
  healthPercent: number | null;
  nextServiceDate: string | null;
  assigned: boolean;
};

export default function UserAssetsPage() {
  const [mine, setMine] = React.useState<UserAssetData[]>([]);
  const [loadingMine, setLoadingMine] = React.useState(true);

  const [query, setQuery] = React.useState("");
  const [debounced, setDebounced] = React.useState("");
  const [results, setResults] = React.useState<Asset[]>([]);
  const [searching, setSearching] = React.useState(false);

  const [ticketAsset, setTicketAsset] = React.useState<{ id: string; name: string } | null>(null);

  // Assigned assets (default view)
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingMine(true);
      try {
        const a = await fetchMyAssets();
        if (!cancelled) setMine(a);
      } catch (err) {
        if (!cancelled) toast.error("Failed to load your assets", { description: err instanceof Error ? err.message : undefined });
      } finally {
        if (!cancelled) setLoadingMine(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Debounce search input
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 400);
    return () => clearTimeout(t);
  }, [query]);

  // Search across ALL assets (read-only)
  React.useEffect(() => {
    if (!debounced) { setResults([]); return; }
    let cancelled = false;
    setSearching(true);
    listAssets({ query: debounced, status: "all", health_band: "all", warehouse_id: "all" })
      .then((data) => { if (!cancelled) setResults(data); })
      .catch((err) => { if (!cancelled) toast.error("Search failed", { description: err instanceof Error ? err.message : undefined }); })
      .finally(() => { if (!cancelled) setSearching(false); });
    return () => { cancelled = true; };
  }, [debounced]);

  const myIds = React.useMemo(() => new Set(mine.map((m) => m.asset_id)), [mine]);

  const myRows: Row[] = mine.map((a) => ({
    id: a.asset_id, code: a.asset_code, name: a.name, category: a.category,
    location: a.location, status: a.status, healthPercent: a.healthPercent,
    nextServiceDate: a.nextServiceDate, assigned: true,
  }));

  const searchRows: Row[] = results.map((a) => ({
    id: a.id, code: a.asset_code, name: a.asset_name, category: a.category,
    location: null, status: a.status, healthPercent: null, nextServiceDate: a.next_service_date,
    assigned: myIds.has(a.id),
  }));

  const isSearching = debounced.length > 0;
  const rows = isSearching ? searchRows : myRows;

  function AssetCard({ r }: { r: Row }) {
    const h = r.healthPercent != null ? Math.round(r.healthPercent) : null;
    const d = daysUntil(r.nextServiceDate);
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15">
            <Boxes className="h-5 w-5 text-indigo-500" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-sm font-semibold">{r.name}</p>
              <span className="rounded-full bg-slate-100 dark:bg-white/10 px-2 py-0.5 text-[10px] font-mono text-muted-foreground">{r.code}</span>
              {r.assigned && <Badge variant="outline" className="text-[10px]">Assigned to you</Badge>}
              <Badge variant="outline" className="text-[10px] capitalize">{r.status?.replace("_", " ")}</Badge>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
              {r.category && <span className="capitalize">{r.category.replace("_", " ")}</span>}
              {r.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{r.location}</span>}
              {r.nextServiceDate && (
                <span className={`inline-flex items-center gap-1 ${d != null && d <= 30 ? "text-amber-600 dark:text-amber-400 font-medium" : ""}`}>
                  <CalendarClock className="h-3 w-3" />
                  {d != null && d < 0 ? `overdue ${Math.abs(d)}d` : `service in ${d}d`}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto shrink-0 mt-1 sm:mt-0">
          {h != null && (
            <div className="flex shrink-0 items-center gap-2">
              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full" style={{ width: `${h}%`, background: healthColor(h) }} />
              </div>
              <span className="w-9 text-right text-xs font-semibold tabular-nums" style={{ color: healthColor(h) }}>{h}%</span>
            </div>
          )}
          <Button size="sm" variant="outline" className="shrink-0 gap-1.5"
            onClick={() => setTicketAsset({ id: r.id, name: r.name })}>
            <TicketIcon className="h-3.5 w-3.5" /> Create Ticket
          </Button>
        </div>
      </div>
  }

  return (
    <div className="w-full space-y-6">
      <PageHero
        crumbs={["PredictiX", "User", "Assets"]}
        title="Assets"
        subtitle="Your assigned assets are shown below. Search to find any asset and raise a ticket on it."
      />

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search all assets by name, code, type…" className="h-11 rounded-lg pl-12" />
      </div>

      {/* Read-only notice when browsing all assets */}
      {isSearching && (
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-muted/30 px-4 py-2.5 text-[12px] text-muted-foreground">
          <Info className="h-4 w-4 shrink-0" />
          Browsing all assets (read-only). You can raise a ticket on any asset, but only admins can modify assets.
        </div>
      )}

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Boxes className="h-4 w-4 text-muted-foreground" />
            {isSearching ? `Search Results (${rows.length})` : `My Assigned Assets (${rows.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(isSearching ? searching : loadingMine) ? (
            <div className="flex justify-center py-10"><PredictiXLoader label={isSearching ? "Searching…" : "Loading your assets…"} /></div>
          ) : rows.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {isSearching ? "No assets match your search." : "No assets are currently assigned to you. Use search to find an asset."}
            </p>
          ) : (
            rows.map((r) => <AssetCard key={r.id} r={r} />)
          )}
        </CardContent>
      </Card>

      {/* Create ticket on a selected asset (asset locked) */}
      <NewTicketDialog
        open={ticketAsset !== null}
        onOpenChange={(o) => { if (!o) setTicketAsset(null); }}
        createFn={createMyTicket}
        presetAssetId={ticketAsset?.id}
        presetAssetName={ticketAsset?.name}
        lockAsset
        onCreated={() => { toast.success("Ticket created", { description: "View it under My Tickets." }); setTicketAsset(null); }}
      />
    </div>
  );
}
