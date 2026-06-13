"use client";

import * as React from "react";
import {
    X, Download, FileText, Loader2, RefreshCw,
    Activity, AlertTriangle, CheckCircle, Clock,
    Wrench, Ticket, TrendingUp, DollarSign,
    BarChart3, Shield, Zap, Bot
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/* ── Types ─────────────────────────────────────────────────────────────── */
type ReportData = {
    asset: {
        id: string;
        asset_name: string;
        asset_code: string;
        status: string;
        health_band: string | null;
        criticality_score: number | null;
        asset_type: string | null;
        vehicle_type: string | null;
        make: string | null;
        model: string | null;
        manufacture_year: number | null;
        last_service_date: string | null;
        next_service_date: string | null;
        warehouse_id: string;
    };
    metrics?: {
        total_events: number;
        total_tickets: number;
        open_tickets: number;
        health_score: number;
        failure_probability: number;
        risk_level: string;
        total_cost: number;
        estimated_cost: number;
        currency: string;
        days_until_maintenance: number | null;
        predicted_maintenance_date: string | null;
    };
};

type Props = {
    isOpen: boolean;
    onClose: () => void;
    assetId: string | null;
    assetName?: string;
};

/* ── Helpers ────────────────────────────────────────────────────────────── */
function fmt(d: string | null | undefined): string {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtCost(n: number, currency = "LKR"): string {
    return `${currency} ${Number(n).toLocaleString()}`;
}

const HEALTH_COLOR: Record<string, string> = {
    excellent: "text-emerald-400",
    good: "text-green-400",
    moderate: "text-amber-400",
    poor: "text-orange-400",
    critical: "text-red-400",
};

const RISK_COLOR: Record<string, string> = {
    Low: "text-emerald-400 bg-emerald-500/10 ring-emerald-500/20",
    Medium: "text-amber-400 bg-amber-500/10 ring-amber-500/20",
    High: "text-orange-400 bg-orange-500/10 ring-orange-500/20",
    Critical: "text-red-400 bg-red-500/10 ring-red-500/20",
};

/* ── KPI Card ───────────────────────────────────────────────────────────── */
function KpiCard({ icon: Icon, label, value, sub, accent }: {
    icon: React.ElementType; label: string; value: string; sub?: string; accent?: string;
}) {
    return (
        <div className="rounded-xl border border-white/8 bg-white/4 px-4 py-3 flex items-center gap-3">
            <div className={cn("rounded-lg p-2", accent ?? "bg-teal-500/15")}>
                <Icon className={cn("h-4 w-4", accent ? "text-white/70" : "text-teal-400")} />
            </div>
            <div>
                <div className="text-[10px] text-white/50 font-medium uppercase tracking-wider">{label}</div>
                <div className="text-base font-bold leading-tight">{value}</div>
                {sub && <div className="text-[11px] text-white/40 mt-0.5">{sub}</div>}
            </div>
        </div>
    );
}

/* ── Section ────────────────────────────────────────────────────────────── */
function Section({ title, icon: Icon, children }: {
    title: string; icon: React.ElementType; children: React.ReactNode;
}) {
    const [open, setOpen] = React.useState(true);
    return (
        <div className="rounded-2xl border border-white/8 bg-white/3 overflow-hidden">
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/4 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-teal-500/15 p-2">
                        <Icon className="h-4 w-4 text-teal-400" />
                    </div>
                    <span className="text-sm font-semibold">{title}</span>
                </div>
                <span className={cn("text-white/30 transition-transform duration-200", !open && "rotate-180")}>
                    ▲
                </span>
            </button>
            {open && <div className="px-5 pb-5 pt-1">{children}</div>}
        </div>
    );
}

/* ── Field Row ──────────────────────────────────────────────────────────── */
function Field({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-start justify-between py-2 border-b border-white/6 last:border-0">
            <span className="text-[12px] text-white/50">{label}</span>
            <span className="text-[12px] font-medium text-white/90 text-right max-w-[55%]">{value}</span>
        </div>
    );
}

/* ── Progress Bar ───────────────────────────────────────────────────────── */
function ProgressBar({ value, max = 100, color }: { value: number; max?: number; color: string }) {
    const pct = Math.min(100, Math.round((value / max) * 100));
    return (
        <div className="h-2 rounded-full bg-white/8 overflow-hidden">
            <div className={cn("h-full rounded-full transition-all duration-700", color)} style={{ width: `${pct}%` }} />
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════════════
   Main Modal Component
   ══════════════════════════════════════════════════════════════════════════ */
export default function AssetReportModal({ isOpen, onClose, assetId, assetName }: Props) {
    const [loading, setLoading] = React.useState(false);
    const [downloading, setDownloading] = React.useState(false);
    const [data, setData] = React.useState<ReportData | null>(null);
    const [error, setError] = React.useState<string | null>(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

    // ── Load report preview data when modal opens ──────────────────────────
    React.useEffect(() => {
        if (!isOpen || !assetId) return;
        setData(null);
        setError(null);
        setLoading(true);

        const load = async () => {
            try {
                // Fetch asset details for preview
                const res = await fetch(`${API_URL}/assets/${assetId}`);
                if (!res.ok) throw new Error(`Failed to load asset: ${res.status}`);
                const asset = await res.json();
                setData({ asset });
            } catch (e: any) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [isOpen, assetId]);

    // ── Download PDF ────────────────────────────────────────────────────────
    const handleDownloadPDF = async () => {
        if (!assetId) return;
        setDownloading(true);
        try {
            const response = await fetch(`${API_URL}/asset-reports/${assetId}`, { method: "POST" });
            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.detail ?? `Server error: ${response.status}`);
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `Asset_Report_${data?.asset?.asset_code ?? assetId}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success("Report downloaded successfully!");
        } catch (e: any) {
            toast.error("Download failed", { description: e.message });
        } finally {
            setDownloading(false);
        }
    };

    if (!isOpen) return null;

    const asset = data?.asset;
    const metrics = data?.metrics;
    const health = HEALTH_COLOR[asset?.health_band ?? ""] ?? "text-white/70";
    const healthScore = metrics?.health_score ?? (asset?.criticality_score ? Math.round(100 - Number(asset.criticality_score) * 10) : null);

    return (
        /* Backdrop */
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 backdrop-blur-sm p-4 pt-8">
            {/* Modal */}
            <div className="relative w-full max-w-4xl rounded-2xl border border-white/10 bg-[#0d1117] shadow-2xl shadow-black/60 mb-8">

                {/* ── Sticky Header ── */}
                <div className="sticky top-0 z-10 flex items-center justify-between gap-4 rounded-t-2xl border-b border-white/8 bg-[#0d1117]/95 backdrop-blur-sm px-6 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="rounded-xl bg-teal-500/15 p-2.5 shrink-0">
                            <FileText className="h-5 w-5 text-teal-400" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="text-base font-bold truncate">
                                    {asset?.asset_name ?? assetName ?? "Asset Performance Report"}
                                </h2>
                                {asset?.asset_code && (
                                    <span className="text-[11px] font-mono text-white/40 bg-white/6 px-2 py-0.5 rounded-full shrink-0">
                                        {asset.asset_code}
                                    </span>
                                )}
                            </div>
                            <p className="text-[12px] text-white/40 mt-0.5">
                                {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 rounded-xl gap-1.5 text-xs border-teal-500/30 bg-teal-500/10 text-teal-300 hover:bg-teal-500/20 hover:border-teal-500/50"
                            onClick={handleDownloadPDF}
                            disabled={downloading || loading}
                        >
                            {downloading ? (
                                <><Loader2 className="h-3.5 w-3.5 animate-spin" />Generating…</>
                            ) : (
                                <><Download className="h-3.5 w-3.5" />PDF</>
                            )}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 rounded-xl p-0 text-white/40 hover:text-white hover:bg-white/8"
                            onClick={onClose}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* ── Body ── */}
                <div className="px-6 py-6 space-y-6">

                    {/* Loading state */}
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
                            <p className="text-sm text-white/50">Loading asset data…</p>
                        </div>
                    )}

                    {/* Error state */}
                    {error && !loading && (
                        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                            <AlertTriangle className="h-8 w-8 text-red-400" />
                            <p className="text-sm font-medium text-red-400">Failed to load asset data</p>
                            <p className="text-xs text-white/40">{error}</p>
                            <Button variant="ghost" size="sm" className="gap-1.5 text-xs mt-2" onClick={() => {
                                setError(null); setLoading(true);
                                fetch(`${API_URL}/assets/${assetId}`)
                                    .then(r => r.json()).then(asset => setData({ asset }))
                                    .catch(e => setError(e.message))
                                    .finally(() => setLoading(false));
                            }}>
                                <RefreshCw className="h-3 w-3" />Retry
                            </Button>
                        </div>
                    )}

                    {/* Content */}
                    {asset && !loading && (
                        <>
                            {/* ── KPI Strip ── */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <KpiCard
                                    icon={Activity}
                                    label="Health Score"
                                    value={healthScore != null ? `${healthScore}%` : "—"}
                                    accent={healthScore != null && healthScore < 60 ? "bg-red-500/15" : "bg-teal-500/15"}
                                />
                                <KpiCard
                                    icon={AlertTriangle}
                                    label="Risk Level"
                                    value={metrics?.risk_level ?? "—"}
                                    accent="bg-orange-500/15"
                                />
                                <KpiCard
                                    icon={Wrench}
                                    label="Maintenance Events"
                                    value={metrics?.total_events != null ? String(metrics.total_events) : "—"}
                                />
                                <KpiCard
                                    icon={DollarSign}
                                    label="Est. Cost"
                                    value={metrics?.estimated_cost != null ? fmtCost(metrics.estimated_cost, metrics.currency) : "—"}
                                    accent="bg-violet-500/15"
                                />
                            </div>

                            {/* ── Asset Overview ── */}
                            <Section title="1. Asset Overview" icon={BarChart3}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                                    <div>
                                        <Field label="Asset Name" value={asset.asset_name ?? "—"} />
                                        <Field label="Asset Code" value={asset.asset_code ?? "—"} />
                                        <Field label="Type" value={[asset.asset_type, asset.vehicle_type].filter(Boolean).join(" · ") || "—"} />
                                        <Field label="Make / Model" value={[asset.make, asset.model, asset.manufacture_year].filter(Boolean).join(" ") || "—"} />
                                        <Field label="Status" value={asset.status ?? "—"} />
                                    </div>
                                    <div>
                                        <Field label="Health Band" value={asset.health_band ?? "—"} />
                                        <Field label="Criticality Score" value={asset.criticality_score != null ? String(asset.criticality_score) : "—"} />
                                        <Field label="Last Service" value={fmt(asset.last_service_date)} />
                                        <Field label="Next Service" value={fmt(asset.next_service_date)} />
                                        <Field label="Warehouse" value={asset.warehouse_id ? `${asset.warehouse_id.slice(0, 8)}…` : "—"} />
                                    </div>
                                </div>
                            </Section>

                            {/* ── Health & Risk ── */}
                            <Section title="2. Health & Risk Analysis" icon={Shield}>
                                <div className="space-y-5">
                                    {healthScore != null && (
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-white/60">Overall Health Score</span>
                                                <span className={cn("font-bold", health)}>{healthScore}%</span>
                                            </div>
                                            <ProgressBar
                                                value={healthScore}
                                                color={healthScore >= 80 ? "bg-emerald-500" : healthScore >= 60 ? "bg-amber-500" : "bg-red-500"}
                                            />
                                        </div>
                                    )}

                                    {metrics?.failure_probability != null && (
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-white/60">Failure Probability (8 weeks)</span>
                                                <span className="font-bold text-orange-400">{Math.round(metrics.failure_probability)}%</span>
                                            </div>
                                            <ProgressBar
                                                value={metrics.failure_probability}
                                                color={metrics.failure_probability >= 70 ? "bg-red-500" : metrics.failure_probability >= 40 ? "bg-amber-500" : "bg-emerald-500"}
                                            />
                                        </div>
                                    )}

                                    {metrics?.risk_level && (
                                        <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/4 px-4 py-3">
                                            <Zap className="h-4 w-4 text-amber-400 shrink-0" />
                                            <div>
                                                <div className="text-[11px] text-white/50">Risk Classification</div>
                                                <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset mt-1", RISK_COLOR[metrics.risk_level] ?? "text-white/70 bg-white/6 ring-white/10")}>
                                                    {metrics.risk_level}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="rounded-xl border border-white/8 bg-white/4 p-3">
                                            <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Predicted Maintenance</div>
                                            <div className="text-sm font-semibold">{fmt(metrics?.predicted_maintenance_date)}</div>
                                        </div>
                                        <div className="rounded-xl border border-white/8 bg-white/4 p-3">
                                            <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Days Until Maintenance</div>
                                            <div className="text-sm font-semibold">{metrics?.days_until_maintenance != null ? `${metrics.days_until_maintenance}d` : "—"}</div>
                                        </div>
                                    </div>
                                </div>
                            </Section>

                            {/* ── Maintenance Summary ── */}
                            <Section title="3. Maintenance Summary" icon={Wrench}>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {[
                                        { label: "Total Events", value: metrics?.total_events ?? "—" },
                                        { label: "Total Cost", value: metrics?.total_cost != null ? fmtCost(metrics.total_cost, metrics.currency) : "—" },
                                        { label: "Estimated Repair", value: metrics?.estimated_cost != null ? fmtCost(metrics.estimated_cost, metrics.currency) : "—" },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="rounded-xl border border-white/8 bg-white/4 p-3">
                                            <div className="text-[10px] text-white/40 uppercase tracking-wider">{label}</div>
                                            <div className="text-sm font-bold mt-1">{String(value)}</div>
                                        </div>
                                    ))}
                                </div>
                            </Section>

                            {/* ── Ticket Summary ── */}
                            <Section title="4. Ticket Summary" icon={Ticket}>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-xl border border-white/8 bg-white/4 p-3">
                                        <div className="text-[10px] text-white/40 uppercase tracking-wider">Total Tickets</div>
                                        <div className="text-2xl font-bold mt-1">{metrics?.total_tickets ?? "—"}</div>
                                    </div>
                                    <div className="rounded-xl border border-white/8 bg-white/4 p-3">
                                        <div className="text-[10px] text-white/40 uppercase tracking-wider">Open Tickets</div>
                                        <div className={cn("text-2xl font-bold mt-1", (metrics?.open_tickets ?? 0) > 0 ? "text-amber-400" : "text-emerald-400")}>
                                            {metrics?.open_tickets ?? "—"}
                                        </div>
                                    </div>
                                </div>
                            </Section>

                            {/* ── AI Insights Note ── */}
                            <Section title="5. AI Insights" icon={Bot}>
                                <div className="flex items-start gap-3 rounded-xl border border-teal-500/20 bg-teal-500/5 p-4">
                                    <Bot className="h-5 w-5 text-teal-400 shrink-0 mt-0.5" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-teal-300">AI-Generated Analysis Included in PDF</p>
                                        <p className="text-[12px] text-white/50 leading-relaxed">
                                            The downloadable PDF contains full AI-generated executive summary, maintenance recommendations,
                                            cost analysis, and future predictions based on current sensor data and historical patterns.
                                        </p>
                                    </div>
                                </div>
                            </Section>

                            {/* ── Download CTA ── */}
                            <div className="flex items-center justify-between rounded-2xl border border-teal-500/20 bg-teal-500/5 px-6 py-4">
                                <div>
                                    <p className="text-sm font-semibold text-teal-300">Ready to export full report</p>
                                    <p className="text-[12px] text-white/40 mt-0.5">
                                        Includes sensor data, maintenance logs, AI predictions & recommendations
                                    </p>
                                </div>
                                <Button
                                    className="h-10 rounded-xl px-5 gap-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold shrink-0"
                                    onClick={handleDownloadPDF}
                                    disabled={downloading}
                                >
                                    {downloading ? (
                                        <><Loader2 className="h-4 w-4 animate-spin" />Generating…</>
                                    ) : (
                                        <><Download className="h-4 w-4" />Download PDF</>
                                    )}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}