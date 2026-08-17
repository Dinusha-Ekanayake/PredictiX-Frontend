"use client";

import * as React from "react";
import {
  X, Download, FileText, Loader2,
  Activity, AlertTriangle, Wrench, Bot, Shield,
  DollarSign, Ticket, BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/customToast";
import { cn } from "@/lib/utils";
import { downloadAssetPDF, downloadAssetPDFServer, type AssetReportData } from "@/lib/assetPdfExport";
import { getAccessToken } from "@/lib/authService";
import { apiFetch } from "@/lib/apiClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  assetId: string | null;
  assetName?: string;
};

/** Icon colour that goes with each KPI accent tint.
 *
 * The tints are translucent, so they read as a pale wash on a light surface.
 * A white icon on top of that is invisible, which is why each accent names its
 * own icon colour with a light and a dark value instead. */
const KPI_ICON_FOR_ACCENT: Record<string, string> = {
  "bg-red-500/15":    "text-red-600 dark:text-red-400",
  "bg-orange-500/15": "text-orange-600 dark:text-orange-400",
  "bg-violet-500/15": "text-violet-600 dark:text-violet-400",
  "bg-amber-500/15":  "text-amber-600 dark:text-amber-400",
  "bg-teal-500/15":   "text-teal-600 dark:text-teal-400",
};

const TEAL_ICON = "text-teal-600 dark:text-teal-400";

function KpiCard({ icon: Icon, label, value, accent }: {
  icon: React.ElementType; label: string; value: string; accent?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/40 px-4 py-3 flex items-center gap-3">
      <div className={cn("rounded-lg p-2", accent ?? "bg-teal-500/15")}>
        <Icon className={cn("h-4 w-4", accent ? (KPI_ICON_FOR_ACCENT[accent] ?? TEAL_ICON) : TEAL_ICON)} />
      </div>
      <div>
        <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{label}</div>
        <div className="text-base font-bold leading-tight text-foreground">{value}</div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between py-2 border-b border-border/70 last:border-0">
      <span className="text-[12px] text-muted-foreground">{label}</span>
      <span className="text-[12px] font-medium text-foreground text-right max-w-[55%]">{value}</span>
    </div>
  );
}

function Section({ title, icon: Icon, children }: {
  title: string; icon: React.ElementType; children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(true);
  return (
    <div className="rounded-2xl border border-border bg-muted/25 overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/60 transition-colors">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-teal-500/15 p-2"><Icon className={cn("h-4 w-4", TEAL_ICON)} /></div>
          <span className="text-sm font-semibold text-foreground">{title}</span>
        </div>
        <span className={cn("text-muted-foreground transition-transform duration-200", !open && "rotate-180")}>▲</span>
      </button>
      {open && <div className="px-5 pb-5 pt-1">{children}</div>}
    </div>
  );
}

// ── Helper: safe JSON parse ───────────────────────────────────────
async function safeJson(res: Response | null): Promise<any> {
  if (!res || !res.ok) return null;
  try { return await res.json(); } catch { return null; }
}

/**
 * Like {@link safeJson}, but also reports why the request failed.
 *
 * Used for the cost endpoint, whose failures are otherwise invisible without
 * opening the Network tab.
 */
async function safeJsonWithError(res: Response | null): Promise<{ data: any; error?: string }> {
  if (!res) return { data: null, error: "Request failed to reach the server (network error)." };
  if (!res.ok) {
    let bodyText = "";
    try { bodyText = await res.text(); } catch { /* ignore */ }
    let detail = bodyText;
    try {
      const parsed = JSON.parse(bodyText);
      detail = parsed?.detail ?? bodyText;
    } catch { /* bodyText wasn't JSON, use as-is */ }
    return { data: null, error: `HTTP ${res.status}${detail ? `: ${String(detail).slice(0, 300)}` : ""}` };
  }
  try {
    return { data: await res.json() };
  } catch {
    return { data: null, error: "Server returned an invalid response (not JSON)." };
  }
}

/** Modal that gathers an asset's data and downloads it as a PDF report. */
export default function AssetReportModal({ isOpen, onClose, assetId, assetName }: Props) {
  const [loading, setLoading]       = React.useState(false);
  const [generating, setGenerating] = React.useState(false);
  const [reportData, setReportData] = React.useState<AssetReportData | null>(null);
  const [error, setError]           = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isOpen || !assetId) return;
    setReportData(null);
    setError(null);
    setLoading(true);

    const load = async () => {
      try {
        // ── Step 1: asset + fleet summary in parallel ──────────
        const [assetRes, fleetRes] = await Promise.all([
          apiFetch(`/assets/${assetId}`),
          apiFetch(`/admin-dashboard/summary`).catch(() => null),
        ]);
        if (!assetRes.ok) throw new Error(`Asset not found (${assetRes.status})`);
        const asset = await assetRes.json();
        const fleet = await safeJson(fleetRes) ?? {};

        // Step 2: fetch all asset-level data at once. Predictions come only
        // from /batch-predictions/{id}, which the nightly job and the "Run AI"
        // button both write.
        const [
          batchPredRes, costPredRes,
          maintRes, ticketRes, sensorRes,
          warehouseRes, deptRes,
        ] = await Promise.all([
          apiFetch(`/batch-predictions/${assetId}`).catch(() => null),
          // Cost model has its own endpoint and a flat response shape.
          // See step 7b below for how its drivers are read.
          apiFetch(`/predictions/cost/${assetId}`).catch(() => null),
          apiFetch(`/maintenance?asset_id=${assetId}&limit=50`).catch(() => null),
          apiFetch(`/tickets?asset_id=${assetId}&limit=20`).catch(() => null),
          // Path-based route, not a query param. It takes no limit and
          // always returns up to 50 readings, newest first, so sensorList[0]
          // below already takes just the latest reading from that.
          apiFetch(`/sensor-readings/asset/${assetId}`).catch(() => null),
          asset.warehouse_id
            ? apiFetch(`/warehouses/${asset.warehouse_id}`).catch(() => null)
            : Promise.resolve(null),
          asset.department_id
            ? apiFetch(`/departments/${asset.department_id}`).catch(() => null)
            : Promise.resolve(null),
        ]);

        // ── Step 3: parse all responses ────────────────────────
        const batchPred   = await safeJson(batchPredRes);
        const { data: costPred, error: costError } = await safeJsonWithError(costPredRes);
        const maintList   = await safeJson(maintRes) ?? [];
        const ticketList  = await safeJson(ticketRes) ?? [];
        const sensorList  = await safeJson(sensorRes) ?? [];
        const warehouse   = await safeJson(warehouseRes);
        const dept        = await safeJson(deptRes);

        // ── Step 4: resolve prediction ──────────────────────────
        const latestPred = (Array.isArray(batchPred) ? batchPred[0] : batchPred) ?? null;

        const sensor = Array.isArray(sensorList) ? sensorList[0] : sensorList ?? null;
        const mArr   = Array.isArray(maintList)  ? maintList      : [];
        const tArr   = Array.isArray(ticketList) ? ticketList     : [];

        // ── Step 6: maintenance metrics ────────────────────────
        const preventive    = mArr.filter((m: any) => (m.event_type ?? "").toLowerCase() === "preventive").length;
        const openTickets   = tArr.filter((t: any) => ["open","in_progress"].includes((t.status ?? "").toLowerCase()));
        const highPri       = openTickets.filter((t: any) => (t.priority ?? "").toLowerCase() === "high");
        const closedT       = tArr.filter((t: any) => ["closed","resolved"].includes((t.status ?? "").toLowerCase()));
        const totalCost     = mArr.reduce((s: number, m: any) => s + (parseFloat(m.cost_amount) || 0), 0);
        const totalDowntime = mArr.reduce((s: number, m: any) => s + (parseFloat(m.downtime_hours) || 0), 0);

        // ── Step 7: prediction values ──────────────────────────
        const health_score     = latestPred?.health_score     != null ? Math.round(Number(latestPred.health_score) * 10) / 10     : undefined;
        const failure_prob     = latestPred?.failure_probability != null ? Math.round(Number(latestPred.failure_probability) * 100 * 10) / 10 : undefined;
        const risk_level       = latestPred?.risk_level       ?? undefined;
        const days_until_maint = latestPred?.predicted_days_until_maintenance ?? null;
        const pred_maint_date  = latestPred?.predicted_maintenance_date ?? null;
        // top_explanations can arrive either as a flat {feature: value} map
        // or as an array of objects, so normalise both into a map. The
        // magnitude key varies by source, hence the list of names checked.
        const rawTopExpl = latestPred?.top_explanations;
        let top_explanations: Record<string, number> | undefined;
        if (Array.isArray(rawTopExpl)) {
          top_explanations = rawTopExpl.reduce((acc: Record<string, number>, item: any) => {
            const name = item?.feature ?? item?.name;
            const mag = item?.shap_value ?? item?.impact ?? item?.importance ?? item?.contribution ?? item?.value;
            if (name != null && mag != null && !isNaN(Number(mag))) acc[String(name)] = Number(mag);
            return acc;
          }, {});
          if (Object.keys(top_explanations).length === 0) top_explanations = undefined;
        } else if (rawTopExpl && typeof rawTopExpl === "object") {
          top_explanations = rawTopExpl as Record<string, number>;
        }

        const est_cost = latestPred?.estimated_cost_lkr ?? undefined;
        // Fallbacks for cost_lower / cost_upper when the cost endpoint fails.
        const batch_min_cost = latestPred?.min_cost_lkr != null ? Number(latestPred.min_cost_lkr) : undefined;
        const batch_max_cost = latestPred?.max_cost_lkr != null ? Number(latestPred.max_cost_lkr) : undefined;

        // Step 7b: cost model output, falling back to the values already on
        // the batch prediction. The response is flat, with no wrapper object.
        // top_drivers gives relative_impact as a percentage share and a
        // direction, not a rupee amount.
        const cost_estimate      = costPred?.predicted_cost_lkr != null ? Number(costPred.predicted_cost_lkr) : est_cost;
        const cost_lower         = costPred?.pi_80_lower_lkr    != null ? Number(costPred.pi_80_lower_lkr)    : batch_min_cost;
        const cost_upper         = costPred?.pi_80_upper_lkr    != null ? Number(costPred.pi_80_upper_lkr)    : batch_max_cost;
        const cost_model_version = costPred?.model_version ?? undefined;
        const fleet_avg_cost     = costPred?.fleet_mean_lkr     != null ? Number(costPred.fleet_mean_lkr)     : undefined;
        const cost_net_shap      = costPred?.vs_fleet_mean_lkr  != null ? Number(costPred.vs_fleet_mean_lkr)  : undefined;
        const cost_drivers = Array.isArray(costPred?.top_drivers)
          ? costPred.top_drivers.map((d: any) => ({
              feature: String(d.feature ?? "—"),
              value: String(d.value ?? "—"),
              relative_impact: Number(d.relative_impact ?? 0),
              direction: d.direction === "increases" ? "increases" as const : "decreases" as const,
            }))
          : [];
        // Accuracy stats for the model version actually loaded on the server.
        const cost_test_r2      = costPred?.test_r2       != null ? Number(costPred.test_r2)       : undefined;
        const cost_test_mae     = costPred?.test_mae_lkr  != null ? Number(costPred.test_mae_lkr)  : undefined;
        const cost_test_medae   = costPred?.test_medae_lkr!= null ? Number(costPred.test_medae_lkr): undefined;
        const cost_picp_80      = costPred?.picp_80_pct   != null ? Number(costPred.picp_80_pct)   : undefined;

        // ── Step 8: fleet data ─────────────────────────────────
        const kpis      = fleet.kpis ?? {};
        const healthDist = (fleet.healthDistribution ?? []) as Array<{ name: string; count: number }>;
        const topRisk    = (fleet.topRiskAssets ?? []).slice(0, 5) as Array<any>;

        // ── Step 9: AI insights from prediction ────────────────
        const hasPred = latestPred != null;
        const executiveSummary = hasPred
          ? `${asset.asset_name} shows a health score of ${health_score ?? "—"}% with a failure probability of ${failure_prob ?? "—"}%. Risk level is classified as ${risk_level ?? "unknown"}. ${days_until_maint != null ? `Maintenance is predicted in ${days_until_maint} days.` : ""} ${cost_estimate ? `Estimated maintenance cost: LKR ${Number(cost_estimate).toLocaleString()}.` : ""}`
          : `${asset.asset_name} (${asset.asset_code}) is currently ${asset.status ?? "active"} with a health band of ${asset.health_band ?? "unknown"}. No AI prediction has been run for this asset yet. Use the Run AI feature to generate predictive maintenance insights.`;

        const criticalRecs: string[] = [];
        const highRecs: string[]     = [];
        const mediumRecs: string[]   = [
          "Ensure maintenance schedule is kept up to date.",
          "Log all maintenance events and sensor readings regularly.",
        ];

        if (hasPred) {
          if ((health_score ?? 100) < 60)  criticalRecs.push("Schedule immediate maintenance inspection — health score is critical.");
          if ((failure_prob ?? 0) > 70)     criticalRecs.push("Asset has high failure probability — prioritise before next deployment.");
          if ((health_score ?? 100) < 75)   highRecs.push("Plan preventive maintenance within 14 days.");
          if (days_until_maint != null && days_until_maint < 7) highRecs.push(`Maintenance due in ${days_until_maint} days — schedule urgently.`);
        }
        if (openTickets.length > 3)  highRecs.push(`${openTickets.length} open tickets — review and resolve backlog.`);
        if (highPri.length > 0)      criticalRecs.push(`${highPri.length} high-priority ticket(s) require immediate attention.`);

        const conclusion = hasPred
          ? `${asset.asset_name} ${(health_score ?? 100) < 60 ? "requires urgent maintenance intervention" : (health_score ?? 100) < 80 ? "should be scheduled for preventive maintenance" : "is within acceptable operating parameters"}. ${pred_maint_date ? `Next maintenance predicted: ${pred_maint_date.slice(0,10)}.` : ""} ${cost_estimate ? `Estimated cost: LKR ${Number(cost_estimate).toLocaleString()}.` : ""} Regular monitoring and timely maintenance will help maximise asset lifespan and minimise downtime.`
          : `Run the AI Prediction engine on this asset to generate comprehensive health scores, failure probabilities, and maintenance cost estimates. Regular monitoring and logging of maintenance events will improve prediction accuracy.`;

        // ── Step 10: build final report data ──────────────────
        const data: AssetReportData = {
          assetName:    asset.asset_name ?? assetName ?? "Asset Report",
          assetCode:    asset.asset_code ?? "—",
          warehouseName:warehouse?.name ?? dept?.name ?? asset.warehouse_id?.slice(0,8) ?? "LankaLogix",
          reportDate:   new Date().toLocaleString("en-GB", { day:"2-digit", month:"long", year:"numeric", hour:"2-digit", minute:"2-digit", hour12:true }),
          asset: {
            ...asset,
            // add department name if available
            description: asset.description ?? (dept ? `Department: ${dept.name}` : undefined),
          },
          health_score,
          failure_probability: failure_prob,
          risk_level,
          days_until_maintenance: days_until_maint,
          predicted_maintenance_date: pred_maint_date,
          estimated_cost: cost_estimate != null ? Number(cost_estimate) : undefined,
          cost_lower,
          cost_upper,
          cost_net_shap,
          fleet_avg_cost,
          cost_model_version,
          cost_test_r2,
          cost_test_mae,
          cost_test_medae,
          cost_picp_80,
          cost_drivers,
          cost_error: costError,
          currency: "LKR",
          top_explanations,
          sensor: sensor ?? undefined,
          maintenance: mArr,
          maintenanceMetrics: {
            total_events:        mArr.length,
            preventive_count:    preventive,
            corrective_count:    mArr.length - preventive,
            total_cost:          Math.round(totalCost),
            total_downtime_hours:Math.round(totalDowntime * 10) / 10,
          },
          tickets: tArr,
          ticketMetrics: {
            total_tickets:         tArr.length,
            open_tickets:          openTickets.length,
            high_priority_tickets: highPri.length,
            closed_tickets:        closedT.length,
          },
          fleet: {
            total_assets:         kpis.totalAssets        ?? 0,
            fleet_health:         kpis.fleetHealth        ?? 0,
            critical_alerts:      kpis.criticalAlerts     ?? 0,
            open_tickets:         kpis.openTickets        ?? 0,
            predicted_failures:   kpis.predictedFailures  ?? 0,
            est_maintenance_cost: kpis.estMaintenanceCost ?? 0,
            health_distribution:  healthDist,
            // Left empty on purpose. The PDF declares these fields but never
            // renders them, and filling them meant loading every asset.
            status_distribution:  [],
            vehicle_distribution: [],
            top_risk_assets:      topRisk.map((r: any) => ({
              name:               r.name  ?? r.asset_name  ?? "—",
              location:           r.location ?? r.warehouse_name ?? "—",
              healthScore:        Math.round(Number(r.healthScore ?? r.health_score ?? 0)),
              failureProbability: Number(r.failureProbability ?? r.failure_probability ?? 0),
              daysToMaintenance:  r.daysToMaintenance ?? r.days_until_maintenance ?? null,
            })),
          },
          insights: {
            executive_summary: executiveSummary,
            recommendations: { critical: criticalRecs, high: highRecs, medium: mediumRecs },
            conclusion,
          },
        };

        setReportData(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isOpen, assetId, assetName]);

  const handleDownloadPDF = async () => {
    if (!reportData) return;
    setGenerating(true);
    const filename = `Asset_Report_${reportData.assetCode}.pdf`;

    const attemptServerRender = async (): Promise<void> => {
      // Read the token at call time, not when the modal opened. If it has
      // since been refreshed, this picks up the new one automatically.
      const token = getAccessToken();
      await downloadAssetPDFServer(
        reportData,
        filename,
        API_URL,
        token ? { Authorization: `Bearer ${token}` } : {},
      );
    };

    try {
      await attemptServerRender();
      toast.success("Report downloaded");
    } catch (serverErr: any) {
      const msg = String(serverErr?.message ?? "");
      const isAuthFailure = msg.includes("401") || msg.includes("403");

      if (isAuthFailure) {
        // Don't fall back to the print dialog on an auth failure. It makes a
        // worse PDF and hides the real cause, which is an expired session.
        toast.error("Your session has expired", {
          description: "Please refresh the page and sign in again, then retry Download PDF.",
        });
        setGenerating(false);
        return;
      }

      // Any other failure (server error, network) can still fall back to the
      // print dialog, which produces a usable if less polished PDF.
      try {
        downloadAssetPDF(reportData, filename);
        toast.success("Report opened — choose 'Save as PDF', and turn off 'Headers and footers' in More settings for a clean export");
      } catch (fallbackErr: any) {
        toast.error("Failed to generate report", { description: fallbackErr.message ?? serverErr.message });
      }
    } finally {
      setGenerating(false);
    }
  };

  if (!isOpen) return null;

  const asset  = reportData?.asset;
  const hs     = reportData?.health_score;
  const fp     = reportData?.failure_probability;
  const rl     = reportData?.risk_level;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 backdrop-blur-sm p-4 pt-8">
      <div className="relative w-full max-w-4xl rounded-2xl border border-border bg-card text-card-foreground shadow-2xl shadow-black/30 dark:shadow-black/60 mb-8">

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 rounded-t-2xl border-b border-border bg-card/95 backdrop-blur-sm px-6 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="rounded-xl bg-teal-500/15 p-2.5 shrink-0">
              <FileText className={cn("h-5 w-5", TEAL_ICON)} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold truncate text-foreground">
                  {reportData?.assetName ?? assetName ?? "Asset Performance Report"}
                </h2>
                {reportData?.assetCode && reportData.assetCode !== "—" && (
                  <span className="text-[11px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-full shrink-0">
                    {reportData.assetCode}
                  </span>
                )}
              </div>
              <p className="text-[12px] text-muted-foreground mt-0.5">
                {new Date().toLocaleDateString("en-GB", { day:"2-digit", month:"long", year:"numeric" })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm"
              className="h-9 rounded-xl gap-1.5 text-xs border-teal-500/30 bg-teal-500/10 text-teal-700 dark:text-teal-300 hover:bg-teal-500/20"
              onClick={handleDownloadPDF} disabled={generating || loading || !reportData}>
              {generating
                ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Generating…</>
                : <><Download className="h-3.5 w-3.5" />PDF</>}
            </Button>
            <Button variant="ghost" size="sm"
              className="h-9 w-9 rounded-xl p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
              onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-6">

          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className={cn("h-8 w-8 animate-spin", TEAL_ICON)} />
              <p className="text-sm text-muted-foreground">Loading asset data from database…</p>
            </div>
          )}

          {error && !loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
              <p className="text-sm font-medium text-red-600 dark:text-red-400">Failed to load asset data</p>
              <p className="text-xs text-muted-foreground">{error}</p>
            </div>
          )}

          {reportData && !loading && (
            <>
              {/* KPI Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <KpiCard icon={Activity} label="Health Score"
                  value={hs != null ? `${hs}%` : "No prediction"}
                  accent={hs != null && hs < 60 ? "bg-red-500/15" : "bg-teal-500/15"} />
                <KpiCard icon={AlertTriangle} label="Failure Probability"
                  value={fp != null ? `${fp}%` : "No prediction"} accent="bg-orange-500/15" />
                <KpiCard icon={Shield} label="Risk Level"
                  value={rl ?? "No prediction"} accent="bg-violet-500/15" />
                <KpiCard icon={Wrench} label="Maint. Events"
                  value={String(reportData.maintenanceMetrics.total_events)} />
                <KpiCard icon={Ticket} label="Open Tickets"
                  value={String(reportData.ticketMetrics.open_tickets)} accent="bg-amber-500/15" />
                <KpiCard icon={DollarSign} label="Est. Cost"
                  value={reportData.estimated_cost ? `LKR ${reportData.estimated_cost.toLocaleString()}` : "—"}
                  accent="bg-violet-500/15" />
              </div>

              {/* Asset Overview */}
              <Section title="1. Asset Overview" icon={BarChart3}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                  <div>
                    <Field label="Asset Name"    value={reportData?.assetName ?? "—"} />
                    <Field label="Type"          value={[asset?.asset_type, asset?.vehicle_type].filter(Boolean).join(" · ") || "—"} />
                    <Field label="Make / Model"  value={[asset?.make, asset?.model, asset?.manufacture_year].filter(Boolean).join(" ") || "—"} />
                    <Field label="Fuel Type"     value={asset?.fuel_type ?? "—"} />
                    <Field label="Status"        value={asset?.status ?? "—"} />
                    <Field label="Health Band"   value={asset?.health_band ?? "—"} />
                  </div>
                  <div>
                    <Field label="Criticality"        value={String(asset?.criticality_score ?? "—")} />
                    <Field label="Current Mileage"    value={asset?.current_mileage ? `${asset.current_mileage} km` : "—"} />
                    <Field label="Last Service"       value={asset?.last_service_date?.slice(0,10) ?? "—"} />
                    <Field label="Next Service"       value={asset?.next_service_date?.slice(0,10) ?? "—"} />
                    <Field label="Pred. Maintenance"  value={reportData.predicted_maintenance_date?.slice(0,10) ?? "—"} />
                    <Field label="Days Until Maint."  value={reportData.days_until_maintenance != null ? `${reportData.days_until_maintenance}d` : "—"} />
                  </div>
                </div>
              </Section>

              {/* Maintenance */}
              <Section title="2. Maintenance Summary" icon={Wrench}>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    ["Total Events",  String(reportData.maintenanceMetrics.total_events)],
                    ["Preventive",    String(reportData.maintenanceMetrics.preventive_count)],
                    ["Corrective",    String(reportData.maintenanceMetrics.corrective_count)],
                    ["Total Cost",    `LKR ${reportData.maintenanceMetrics.total_cost.toLocaleString()}`],
                    ["Downtime",      `${reportData.maintenanceMetrics.total_downtime_hours}h`],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-border bg-muted/40 p-3">
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
                      <div className="text-sm font-bold mt-1 text-foreground">{value}</div>
                    </div>
                  ))}
                </div>
              </Section>

              {/* Tickets */}
              <Section title="3. Ticket Summary" icon={Ticket}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    ["Total",         String(reportData.ticketMetrics.total_tickets),          ""],
                    ["Open",          String(reportData.ticketMetrics.open_tickets),           "text-amber-600 dark:text-amber-400"],
                    ["High Priority", String(reportData.ticketMetrics.high_priority_tickets),  "text-red-600 dark:text-red-400"],
                    ["Closed",        String(reportData.ticketMetrics.closed_tickets),         "text-emerald-600 dark:text-emerald-400"],
                  ].map(([label, value, color]) => (
                    <div key={label} className="rounded-xl border border-border bg-muted/40 p-3 text-center">
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
                      <div className={cn("text-2xl font-bold mt-1", color || "text-foreground")}>{value}</div>
                    </div>
                  ))}
                </div>
              </Section>

              {/* AI Insights */}
              <Section title="4. AI Insights" icon={Bot}>
                <div className="flex items-start gap-3 rounded-xl border border-teal-500/20 bg-teal-500/5 p-4">
                  <Bot className={cn("h-5 w-5 shrink-0 mt-0.5", TEAL_ICON)} />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-teal-700 dark:text-teal-300">
                      {reportData.health_score != null ? "AI Analysis Available" : "No Prediction Data Yet"}
                    </p>
                    <p className="text-[12px] text-muted-foreground leading-relaxed">
                      {reportData.insights.executive_summary}
                    </p>
                  </div>
                </div>
              </Section>

              {/* Download CTA */}
              <div className="flex items-center justify-between rounded-2xl border border-teal-500/20 bg-teal-500/5 px-6 py-4">
                <div>
                  <p className="text-sm font-semibold text-teal-700 dark:text-teal-300">Ready to export full report</p>
                  <p className="text-[12px] text-muted-foreground mt-0.5">
                    Includes fleet overview, charts, sensor data, maintenance logs &amp; AI insights
                  </p>
                </div>
                <Button className="h-10 rounded-xl px-5 gap-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold shrink-0"
                  onClick={handleDownloadPDF} disabled={generating}>
                  {generating
                    ? <><Loader2 className="h-4 w-4 animate-spin" />Generating…</>
                    : <><Download className="h-4 w-4" />Download PDF</>}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}