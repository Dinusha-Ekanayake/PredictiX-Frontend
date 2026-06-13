"use client";

import * as React from "react";
import { toast } from "sonner";
import { Search, Boxes, MapPin, CalendarClock, Ticket as TicketIcon, Info, ChevronRight, Activity } from "lucide-react";
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
import UserAssetDetailsDialog from "@/components/user/assets/UserAssetDetailsDialog";

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
  const [detailsAssetId, setDetailsAssetId] = React.useState<string | null>(null);

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
    return (
      <div 
        className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-card p-5 shadow-sm hover:shadow-md hover:border-indigo-500/30 dark:hover:border-indigo-500/30 hover:-translate-y-1 transition-all cursor-pointer overflow-hidden"
        onClick={() => setDetailsAssetId(r.id)}
      >
        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight className="h-5 w-5 text-indigo-500" />
        </div>
        <div>
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Boxes className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1 pr-6">
              <p className="truncate text-base font-bold text-foreground">{r.name}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-slate-100 dark:bg-white/10 px-2 py-0.5 text-xs font-mono font-medium text-muted-foreground">{r.code}</span>
                <Badge variant="outline" className="text-[10px] capitalize rounded-md bg-transparent">{r.status?.replace("_", " ")}</Badge>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
            {r.category && (
              <div className="flex items-center gap-1.5">
                <Boxes className="h-3.5 w-3.5 opacity-70" />
                <span className="capitalize truncate">{r.category.replace("_", " ")}</span>
              </div>
            )}
            {r.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 opacity-70" />
                <span className="truncate">{r.location}</span>
              </div>
            )}
            {r.nextServiceDate && (
              <div className={`flex items-center gap-1.5 col-span-2 ${d != null && d <= 30 ? "text-amber-600 dark:text-amber-400 font-medium" : ""}`}>
                <CalendarClock className="h-3.5 w-3.5 opacity-70" />
                <span className="truncate">{d != null && d < 0 ? `Service overdue by ${Math.abs(d)} days` : `Next service in ${d} days`}</span>
              </div>
            )}
            {h != null && (
               <div className="flex items-center gap-1.5 col-span-2">
                 <Activity className="h-3.5 w-3.5 opacity-70" />
                 <div className="flex flex-1 items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div className="h-full rounded-full" style={{ width: `${h}%`, background: healthColor(h) }} />
                    </div>
                    <span className="w-8 text-right font-semibold tabular-nums" style={{ color: healthColor(h) }}>{h}%</span>
                 </div>
               </div>
            )}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          {r.assigned ? (
            <Badge variant="secondary" className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500">Assigned to you</Badge>
          ) : (
             <span />
          )}
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-8 shrink-0 gap-1.5 text-xs hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400"
            onClick={(e) => {
              e.stopPropagation();
              setTicketAsset({ id: r.id, name: r.name });
            }}
          >
            <TicketIcon className="h-3.5 w-3.5" /> Create Ticket
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 pb-10">
      <PageHero
        crumbs={["PredictiX", "User", "Assets"]}
        title="Assets"
        subtitle="Your assigned assets are shown below. Search to find any asset and raise a ticket on it."
      />

      {/* Search */}
      <div className="relative w-full">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          placeholder="Search all assets by name, code, type…" 
          className="h-14 rounded-2xl pl-12 text-base bg-white dark:bg-card border-slate-200 dark:border-slate-800 shadow-sm focus-visible:ring-indigo-500" 
        />
      </div>

      {/* Read-only notice when browsing all assets */}
      {isSearching && (
        <div className="flex items-center gap-3 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-500/10 px-5 py-4 text-sm text-indigo-800 dark:text-indigo-300">
          <Info className="h-5 w-5 shrink-0" />
          <p>Browsing all assets (read-only). You can view details and raise tickets, but only admins can modify asset properties.</p>
        </div>
      )}

      <div>
        <div className="flex items-center gap-2 mb-6">
          <Boxes className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-bold tracking-tight">
            {isSearching ? `Search Results (${rows.length})` : `My Assigned Assets (${rows.length})`}
          </h2>
        </div>
        
        {(isSearching ? searching : loadingMine) ? (
          <div className="flex justify-center py-20"><PredictiXLoader label={isSearching ? "Searching…" : "Loading your assets…"} /></div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 py-20 text-center bg-slate-50/50 dark:bg-card/50">
            <Boxes className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-4" />
            <h3 className="text-lg font-semibold text-foreground">No assets found</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm">
              {isSearching ? "Try adjusting your search terms." : "No assets are currently assigned to you. Use the search bar above to find an asset."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {rows.map((r) => <AssetCard key={r.id} r={r} />)}
          </div>
        )}
      </div>

      {/* Create ticket on a selected asset (asset locked) */}
      <NewTicketDialog
        open={ticketAsset !== null}
        onOpenChange={(o) => { if (!o) setTicketAsset(null); }}
        presetAssetId={ticketAsset?.id}
        presetAssetName={ticketAsset?.name}
        lockAsset
        onCreated={() => { toast.success("Ticket created", { description: "View it under My Tickets." }); setTicketAsset(null); }}
      />

      {/* Asset Details Dialog */}
      <UserAssetDetailsDialog
        assetId={detailsAssetId}
        open={detailsAssetId !== null}
        onOpenChange={(open) => { if (!open) setDetailsAssetId(null); }}
      />
    </div>
  );
}
