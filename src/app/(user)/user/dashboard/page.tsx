"use client";

import * as React from "react";
import Link from "next/link";
import {
  Boxes, Activity, Wrench, ShieldCheck, MapPin, CalendarClock,
  Users as UsersIcon, ChevronRight, AlertCircle, Building2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import PredictiXLoader from "@/components/loading/PredictiXLoader";
import {
  fetchMyProfile,
  fetchMyAssets,
  fetchMyStats,
  getTeamMembers,
  type UserProfileData,
  type UserAssetData,
  type UserStatsData,
  type TeamMemberData,
} from "@/lib/api/userProfileApi";

function healthColor(p: number) {
  if (p >= 80) return "#10b981";
  if (p >= 60) return "#f59e0b";
  return "#ef4444";
}

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000);
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

/** Teammates shown on the dashboard card; the rest live on /user/users. */
const TEAM_PREVIEW_COUNT = 8;

export default function UserDashboardPage() {
  const [profile, setProfile] = React.useState<UserProfileData | null>(null);
  const [assets, setAssets] = React.useState<UserAssetData[]>([]);
  const [stats, setStats] = React.useState<UserStatsData | null>(null);
  const [team, setTeam] = React.useState<TeamMemberData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [p, a, s, t] = await Promise.all([
          fetchMyProfile(),
          fetchMyAssets().catch(() => [] as UserAssetData[]),
          fetchMyStats().catch(() => ({ assignedAssets: 0, activeAssets: 0 })),
          // One more than the card renders: the extra row only decides whether
          // to show the "view all" link. Unbounded this fetched the entire
          // department — 519 people / 150 KB to render 8 — and was the slowest
          // of these four parallel calls.
          getTeamMembers(TEAM_PREVIEW_COUNT + 1).catch(() => [] as TeamMemberData[]),
        ]);
        if (cancelled) return;
        setProfile(p); setAssets(a); setStats(s); setTeam(t);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load dashboard");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <PredictiXLoader label="Loading your dashboard…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-500/10 px-5 py-4 text-sm text-red-700 dark:text-red-400">
        <AlertCircle className="h-4 w-4 shrink-0" /> {error}
      </div>
    );
  }

  const serviceDueSoon = assets.filter((a) => {
    const d = daysUntil(a.nextServiceDate);
    return d != null && d <= 30;
  }).length;

  const avgHealth = assets.length
    ? Math.round(assets.reduce((s, a) => s + (a.healthPercent ?? 0), 0) / assets.length)
    : 0;

  const kpis = [
    { label: "Assigned Assets", value: stats?.assignedAssets ?? assets.length, icon: Boxes, color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-100 dark:bg-violet-500/15" },
    { label: "Active Assets", value: stats?.activeAssets ?? 0, icon: ShieldCheck, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-500/15" },
    { label: "Service Due (≤30d)", value: serviceDueSoon, icon: Wrench, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-500/15" },
    { label: "Avg Health", value: `${avgHealth}%`, icon: Activity, color: "text-sky-600 dark:text-sky-400", bg: "bg-sky-100 dark:bg-sky-500/15" },
  ];

  const firstName = profile?.firstName || profile?.name?.split(" ")[0] || "there";

  return (
    <div className="w-full space-y-6">
      {/* ── Welcome header ── */}
      <div className="relative overflow-hidden rounded-2xl border border-violet-200/60 dark:border-white/10 bg-linear-to-br from-violet-50/90 via-white/70 to-sky-50/80 dark:from-violet-500/8 dark:via-white/2 dark:to-transparent px-6 py-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {firstName} 👋</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Here&apos;s an overview of the assets and team you&apos;re working with.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="gap-1.5 rounded-full px-3 py-1 capitalize">
              <ShieldCheck className="h-3 w-3" /> {profile?.role ?? "user"}
            </Badge>
            {profile?.department && (
              <Badge variant="outline" className="gap-1.5 rounded-full px-3 py-1">
                <Building2 className="h-3 w-3" /> {profile.department}
              </Badge>
            )}
            {profile?.warehouse && (
              <Badge variant="outline" className="gap-1.5 rounded-full px-3 py-1">
                <MapPin className="h-3 w-3" /> {profile.warehouse}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} className="rounded-2xl">
            <CardContent className="flex items-center gap-3 p-5">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${k.bg}`}>
                <k.icon className={`h-5 w-5 ${k.color}`} />
              </div>
              <div>
                <div className="text-2xl font-bold">{k.value}</div>
                <div className="text-xs text-muted-foreground">{k.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* ── My assigned assets ── */}
        <Card className="rounded-2xl md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Boxes className="h-4 w-4 text-muted-foreground" /> My Assigned Assets
            </CardTitle>
            <Link href="/user/assets">
              <Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground">
                View all <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {assets.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No assets are currently assigned to you.</p>
            ) : (
              assets.map((a) => {
                const d = daysUntil(a.nextServiceDate);
                const h = Math.round(a.healthPercent ?? 0);
                return (
                  <div key={a.assignment_id} className="flex items-center gap-4 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15">
                      <Boxes className="h-5 w-5 text-indigo-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold">{a.name}</p>
                        <span className="rounded-full bg-slate-100 dark:bg-white/10 px-2 py-0.5 text-[10px] font-mono text-muted-foreground">{a.asset_code}</span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{a.location}</span>
                        {a.nextServiceDate && (
                          <span className={`inline-flex items-center gap-1 ${d != null && d <= 30 ? "text-amber-600 dark:text-amber-400 font-medium" : ""}`}>
                            <CalendarClock className="h-3 w-3" />
                            {d != null && d < 0 ? `service overdue ${Math.abs(d)}d` : `service in ${d}d`}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full" style={{ width: `${h}%`, background: healthColor(h) }} />
                      </div>
                      <span className="w-9 text-right text-xs font-semibold tabular-nums" style={{ color: healthColor(h) }}>{h}%</span>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* ── My team ── */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              {/* No count here: this card deliberately fetches only a preview,
                  so team.length is the page size, not the size of the
                  department. The full count lives on /user/users. */}
              <UsersIcon className="h-4 w-4 text-muted-foreground" /> My Team
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {team.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No teammates found in your department.</p>
            ) : (
              team.slice(0, TEAM_PREVIEW_COUNT).map((m) => (
                <div key={m.id} className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-muted/40">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">
                    {initials(m.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{m.name}</p>
                    <p className="truncate text-[11px] text-muted-foreground capitalize">{m.role} · {m.department}</p>
                  </div>
                </div>
              ))
            )}
            {/* The extra row fetched beyond the preview is the signal that
                more exist — it is not rendered, only counted. */}
            {team.length > TEAM_PREVIEW_COUNT && (
              <Link href="/user/users">
                <Button variant="ghost" size="sm" className="w-full gap-1 text-xs text-muted-foreground">
                  View all teammates <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
