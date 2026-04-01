"use client";

import * as React from "react";
<<<<<<< HEAD
import SectionCard from "@/components/admin/common/SectionCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type {
  AssetHealthBand,
  AssetRecord,
  AssetStatus,
  MaintenanceEventType,
} from "./types";

function statusClasses(status: AssetStatus) {
  switch (status) {
    case "critical":
      return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
    case "under_maintenance":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
    case "inactive":
      return "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20";
    case "decommissioned":
      return "bg-zinc-500/10 text-zinc-700 dark:text-zinc-400 border-zinc-500/20";
    case "active":
=======
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Brain,
  Calendar,
  CircleDot,
  Clock,
  DollarSign,
  Edit3,
  FileText,
  History,
  Info,
  Lightbulb,
  MapPin,
  Settings2,
  Shield,
  TicketPlus,
  Truck,
  User,
  Wrench,
  Hash,
  AlertTriangle
} from "lucide-react";
import type {
  Asset,
  AssetStatus,
  MaintenanceLog,
} from "./types";

/* ═══════════════════════════════════════════════
   Shared utilities
   ═══════════════════════════════════════════════ */

function statusClasses(status: AssetStatus) {
  switch (status) {
    case "CRITICAL":
      return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
    case "MAINTENANCE":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
    case "OFFLINE":
      return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20";
    case "OPERATIONAL":
>>>>>>> 8fd9ee0d230ce884f4957d6664ed8fc3d212cbbb
    default:
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
  }
}

<<<<<<< HEAD
function healthBandClasses(healthBand?: AssetHealthBand | null) {
  switch (healthBand) {
=======
function getHealthBand(score: number) {
  if (score >= 80) return "excellent";
  if (score >= 60) return "good";
  if (score >= 40) return "moderate";
  if (score >= 20) return "poor";
  return "critical";
}

function healthBandClasses(score: number) {
  const band = getHealthBand(score);
  switch (band) {
>>>>>>> 8fd9ee0d230ce884f4957d6664ed8fc3d212cbbb
    case "critical":
      return "bg-red-500/10 text-red-600 dark:text-red-400";
    case "poor":
      return "bg-orange-500/10 text-orange-700 dark:text-orange-400";
    case "moderate":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-400";
    case "good":
      return "bg-sky-500/10 text-sky-700 dark:text-sky-400";
    case "excellent":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
    default:
      return "bg-muted text-muted-foreground";
  }
}

<<<<<<< HEAD
function maintenanceEventClasses(type: MaintenanceEventType) {
  switch (type) {
    case "breakdown":
      return "bg-red-500/10 text-red-600 dark:text-red-400";
    case "repair":
    case "corrective":
      return "bg-orange-500/10 text-orange-700 dark:text-orange-400";
    case "inspection":
    case "scheduled_service":
    case "preventive":
      return "bg-sky-500/10 text-sky-700 dark:text-sky-400";
    case "replacement":
      return "bg-violet-500/10 text-violet-700 dark:text-violet-400";
    default:
      return "bg-muted text-muted-foreground";
=======
function healthStrokeColor(score: number) {
  const band = getHealthBand(score);
  switch (band) {
    case "critical":
      return "#ef4444";
    case "poor":
      return "#f97316";
    case "moderate":
      return "#f59e0b";
    case "good":
      return "#0ea5e9";
    case "excellent":
      return "#10b981";
    default:
      return "#6b7280";
  }
}

function maintenanceEventConfig(type: MaintenanceLog["type"]) {
  switch (type) {
    case "CORRECTIVE":
      return {
        classes: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
        icon: <Wrench className="h-3.5 w-3.5" />,
      };
    case "INSPECTION":
    case "PREVENTIVE":
      return {
        classes: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
        icon: <Shield className="h-3.5 w-3.5" />,
      };
    default:
      return {
        classes: "bg-muted text-muted-foreground",
        icon: <Info className="h-3.5 w-3.5" />,
      };
>>>>>>> 8fd9ee0d230ce884f4957d6664ed8fc3d212cbbb
  }
}

function formatDate(date?: string | null) {
  if (!date) return "—";
<<<<<<< HEAD
  return new Date(date).toLocaleDateString();
=======
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
>>>>>>> 8fd9ee0d230ce884f4957d6664ed8fc3d212cbbb
}

function formatDateTime(date?: string | null) {
  if (!date) return "—";
<<<<<<< HEAD
  return new Date(date).toLocaleString();
=======
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
>>>>>>> 8fd9ee0d230ce884f4957d6664ed8fc3d212cbbb
}

function formatCurrency(value?: number | null, currency = "LKR") {
  if (typeof value !== "number") return "—";
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value?: number | null) {
  if (typeof value !== "number") return "—";
  return `${Math.round(value * 100)}%`;
}

<<<<<<< HEAD
function InfoField({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/60 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-medium">{value}</div>
=======
/* ═══════════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════════ */

/** Key-value field */
function Field({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
        {icon}
        {label}
      </div>
      <div className="text-sm font-medium">{value ?? "—"}</div>
>>>>>>> 8fd9ee0d230ce884f4957d6664ed8fc3d212cbbb
    </div>
  );
}

<<<<<<< HEAD
export default function AssetDetailsPanel({ asset }: { asset: AssetRecord }) {
  return (
    <div className="space-y-6">
      <SectionCard
        title="Asset Details"
        right={
          <div className="flex items-center gap-2">
            <Button variant="outline" className="h-8 rounded-xl px-3 text-xs">
              Edit
            </Button>
            <Button className="h-8 rounded-xl px-3 text-xs">Create Ticket</Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-lg font-semibold">{asset.assetName}</div>

=======
/** Radial health gauge (SVG arc) */
function HealthGauge({
  score,
  size = 80,
}: {
  score: number;
  size?: number;
}) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const strokeColor = healthStrokeColor(score);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/40"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold tabular-nums">{score}</span>
        <span className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
          Health
        </span>
      </div>
    </div>
  );
}

/** Metric chip */
function MetricChip({
  label,
  value,
  variant = "default",
}: {
  label: string;
  value: string;
  variant?: "default" | "danger" | "warning" | "success";
}) {
  const variants = {
    default: "bg-muted/40 text-foreground",
    danger: "bg-red-500/10 text-red-600 dark:text-red-400",
    warning: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    success: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-xl px-4 py-2.5",
        variants[variant]
      )}
    >
      <span className="text-lg font-bold tabular-nums">{value}</span>
      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Main component
   ═══════════════════════════════════════════════ */

export default function AssetDetailsPanel({ asset }: { asset: Asset }) {
  const healthScore = asset.healthScore ?? 0;
  const failureRisk = asset.failureProbability8w ?? 0;

  const riskVariant =
    failureRisk >= 0.7
      ? "danger"
      : failureRisk >= 0.4
        ? "warning"
        : "success";

  return (
    <div className="space-y-5">
      {/* ─── HEADER CARD ─── */}
      <Card className="rounded-2xl border-border/40 bg-card/80 backdrop-blur-xl">
        <CardContent className="p-5">
          {/* Top: Name row + actions */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-semibold tracking-tight">
                  {asset.name}
                </h2>
>>>>>>> 8fd9ee0d230ce884f4957d6664ed8fc3d212cbbb
                <Badge
                  variant="outline"
                  className={cn("capitalize", statusClasses(asset.status))}
                >
<<<<<<< HEAD
                  {asset.status.replaceAll("_", " ")}
                </Badge>

                <Badge
                  variant="secondary"
                  className={cn("capitalize", healthBandClasses(asset.healthBand))}
                >
                  {asset.healthBand ?? "unknown"}
                </Badge>

                <Badge variant="outline">{asset.assetCode}</Badge>
              </div>

              <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                {asset.description ?? "No description available."}
              </p>
            </div>

            <div className="grid min-w-[220px] grid-cols-2 gap-3">
              <InfoField
                label="Health Score"
                value={
                  typeof asset.prediction?.healthScore === "number"
                    ? `${asset.prediction.healthScore}%`
                    : "—"
                }
              />
              <InfoField
                label="Failure Risk"
                value={formatPercent(asset.prediction?.failureProbability)}
              />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-12 md:col-span-4">
              <InfoField label="Warehouse" value={asset.warehouse.name} />
            </div>
            <div className="col-span-12 md:col-span-4">
              <InfoField
                label="Assigned User"
                value={asset.assignedTo?.name ?? "Unassigned"}
              />
            </div>
            <div className="col-span-12 md:col-span-4">
              <InfoField
                label="Maintenance Priority"
                value={asset.maintenancePriority ?? "—"}
              />
            </div>

            <div className="col-span-12 md:col-span-4">
              <InfoField label="Type" value={asset.vehicleType ?? asset.assetType} />
            </div>
            <div className="col-span-12 md:col-span-4">
              <InfoField
                label="Make / Model"
                value={(asset.makeModel ?? [asset.make, asset.model].filter(Boolean).join(" / ")) || "—"}
              />
            </div>
            <div className="col-span-12 md:col-span-4">
              <InfoField
                label="Registration No."
                value={asset.registrationNumber ?? "—"}
              />
            </div>

            <div className="col-span-12 md:col-span-4">
              <InfoField
                label="Current Mileage"
                value={
                  typeof asset.currentMileage === "number"
                    ? `${asset.currentMileage.toLocaleString()} km`
                    : "—"
                }
              />
            </div>
            <div className="col-span-12 md:col-span-4">
              <InfoField
                label="Last Service Date"
                value={formatDate(asset.lastServiceDate)}
              />
            </div>
            <div className="col-span-12 md:col-span-4">
              <InfoField
                label="Next Service Date"
                value={formatDate(asset.nextServiceDate)}
              />
            </div>
          </div>

          <Separator />

          <Tabs defaultValue="predictions">
            <TabsList className="rounded-xl">
              <TabsTrigger value="predictions">Predictions</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
              <TabsTrigger value="properties">Properties</TabsTrigger>
              <TabsTrigger value="audit">Audit Trail</TabsTrigger>
            </TabsList>

            <TabsContent value="predictions" className="mt-4 space-y-4">
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-12 md:col-span-4">
                  <InfoField
                    label="Confidence"
                    value={formatPercent(asset.prediction?.confidence)}
                  />
                </div>
                <div className="col-span-12 md:col-span-4">
                  <InfoField
                    label="Predicted Maintenance Date"
                    value={formatDate(asset.prediction?.predictedMaintenanceDate)}
                  />
                </div>
                <div className="col-span-12 md:col-span-4">
                  <InfoField
                    label="Days Until Maintenance"
                    value={asset.prediction?.daysUntilMaintenance ?? "—"}
                  />
                </div>

                <div className="col-span-12 md:col-span-4">
                  <InfoField
                    label="Estimated Cost"
                    value={formatCurrency(
                      asset.prediction?.estimatedCost,
                      asset.prediction?.currency
                    )}
                  />
                </div>
                <div className="col-span-12 md:col-span-4">
                  <InfoField
                    label="Estimated Cost Range"
                    value={`${formatCurrency(
                      asset.prediction?.minCost,
                      asset.prediction?.currency
                    )} — ${formatCurrency(
                      asset.prediction?.maxCost,
                      asset.prediction?.currency
                    )}`}
                  />
                </div>
                <div className="col-span-12 md:col-span-4">
                  <InfoField
                    label="Criticality Score"
                    value={asset.criticalityScore ?? "—"}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-border/60 p-4">
                <div className="text-sm font-semibold">Top Explanations</div>
                {asset.prediction?.topExplanations?.length ? (
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {asset.prediction.topExplanations.map((item, index) => (
                      <li
                        key={`${item}-${index}`}
                        className="rounded-xl bg-muted/30 px-3 py-2"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">
                    No explanation data available.
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="maintenance" className="mt-4 space-y-3">
              {asset.maintenanceEvents.length === 0 ? (
                <div className="rounded-2xl border p-4 text-sm text-muted-foreground">
                  No maintenance events available.
                </div>
              ) : (
                asset.maintenanceEvents.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-2xl border border-border/60 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-semibold">{event.title}</div>
                          <Badge
                            variant="secondary"
                            className={cn(
                              "capitalize",
                              maintenanceEventClasses(event.eventType)
                            )}
                          >
                            {event.eventType.replaceAll("_", " ")}
                          </Badge>
                        </div>

                        {event.description ? (
                          <p className="mt-2 text-sm text-muted-foreground">
                            {event.description}
                          </p>
                        ) : null}
                      </div>

                      <div className="text-sm font-medium">
                        {formatCurrency(event.costAmount, event.currency)}
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-12 gap-3 text-sm">
                      <div className="col-span-12 md:col-span-4">
                        <InfoField
                          label="Scheduled"
                          value={formatDateTime(event.scheduledDate)}
                        />
                      </div>
                      <div className="col-span-12 md:col-span-4">
                        <InfoField
                          label="Performed"
                          value={formatDateTime(event.performedAt)}
                        />
                      </div>
                      <div className="col-span-12 md:col-span-4">
                        <InfoField
                          label="Performed By"
                          value={event.performedBy?.name ?? "—"}
                        />
                      </div>
                    </div>

                    {event.notes ? (
                      <div className="mt-3 rounded-xl bg-muted/25 p-3 text-sm text-muted-foreground">
                        {event.notes}
                      </div>
                    ) : null}
=======
                  {asset.status?.toLowerCase().replaceAll("_", " ")}
                </Badge>
                <Badge
                  variant="secondary"
                  className={cn(
                    "capitalize",
                    healthBandClasses(healthScore)
                  )}
                >
                  {getHealthBand(healthScore)}
                </Badge>
              </div>

              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted-foreground">
                <span className="font-mono text-[12px]">
                  {asset.id}
                </span>
                <span className="text-muted-foreground/30">|</span>
                <span>{asset.location}</span>
                <span className="text-muted-foreground/30">|</span>
                <span>{asset.warehouse.name}</span>
              </div>

              {asset.description && (
                <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">
                  {asset.description}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex shrink-0 items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-xl text-[13px]"
              >
                <Edit3 className="mr-1.5 h-3.5 w-3.5" />
                Edit
              </Button>
              <Button size="sm" className="h-8 rounded-xl text-[13px]">
                <TicketPlus className="mr-1.5 h-3.5 w-3.5" />
                Create Ticket
              </Button>
            </div>
          </div>

          {/* Metrics row */}
          <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-border/30 pt-5">
            <HealthGauge score={healthScore} />
            <div className="flex flex-wrap gap-2">
              <MetricChip
                label="Failure Risk (8W)"
                value={formatPercent(failureRisk)}
                variant={riskVariant}
              />
              <MetricChip
                label="Confidence"
                value={formatPercent(asset.predictionConfidence)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── KEY INFO GRID ─── */}
      <Card className="rounded-2xl border-border/40 bg-card/80 backdrop-blur-xl">
        <CardContent className="p-5">
          <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 lg:grid-cols-4">
            <Field
              label="Assigned To"
              value={asset.assignedPerson?.name ?? "Unassigned"}
              icon={<User className="h-3 w-3" />}
            />
            <Field
              label="Asset ID"
              value={
                <span className="font-mono text-[12px]">{asset.id}</span>
              }
              icon={<Hash className="h-3 w-3" />}
            />
            <Field
              label="Last Service"
              value={formatDate(asset.lastMaintenanceDate)}
              icon={<Calendar className="h-3 w-3" />}
            />
            <Field
              label="Next Service"
              value={formatDate(asset.nextMaintenanceDate)}
              icon={<Clock className="h-3 w-3" />}
            />
          </div>
        </CardContent>
      </Card>

      {/* ─── TABBED SECTION ─── */}
      <Card className="rounded-2xl border-border/40 bg-card/80 backdrop-blur-xl">
        <CardContent className="p-5">
          <Tabs defaultValue="predictions">
            <TabsList className="rounded-xl">
              <TabsTrigger value="predictions" className="text-[13px]">
                <Brain className="mr-1.5 h-3.5 w-3.5" />
                Predictions
              </TabsTrigger>
              <TabsTrigger value="maintenance" className="text-[13px]">
                <Wrench className="mr-1.5 h-3.5 w-3.5" />
                Maintenance
              </TabsTrigger>
              <TabsTrigger value="assignments" className="text-[13px]">
                <User className="mr-1.5 h-3.5 w-3.5" />
                Assignments
              </TabsTrigger>
              <TabsTrigger value="audit" className="text-[13px]">
                <History className="mr-1.5 h-3.5 w-3.5" />
                Audit
              </TabsTrigger>
            </TabsList>

            {/* ── Predictions Tab ── */}
            <TabsContent value="predictions" className="mt-5 space-y-5">
              {/* Cost estimates */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-border/30 p-4 text-center">
                  <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
                    Estimated Cost
                  </div>
                  <div className="mt-1 text-lg font-bold">
                    {formatCurrency(asset.estimatedCost)}
                  </div>
                </div>
                <div className="rounded-xl border border-border/30 p-4 text-center">
                  <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
                    Cost Variance (30d)
                  </div>
                  <div className="mt-1 text-sm font-semibold flex items-center justify-center">
                    <span
                      className={cn(
                        asset.costVariance30d > 0
                          ? "text-red-500"
                          : "text-emerald-500"
                      )}
                    >
                      {asset.costVariance30d > 0 ? "+" : ""}
                      {formatPercent(asset.costVariance30d)}
                    </span>
                  </div>
                </div>
                <div className="rounded-xl border border-border/30 p-4 text-center">
                  <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
                    Predicted Maintenance
                  </div>
                  <div className="mt-1 text-sm font-semibold">
                    {formatDate(asset.predictedMaintenanceDate)}
>>>>>>> 8fd9ee0d230ce884f4957d6664ed8fc3d212cbbb
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="properties" className="mt-4">
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-12 md:col-span-4">
                  <InfoField label="Asset UUID" value={asset.id} />
                </div>
<<<<<<< HEAD
                <div className="col-span-12 md:col-span-4">
                  <InfoField label="VIN" value={asset.vin ?? "—"} />
                </div>
                <div className="col-span-12 md:col-span-4">
                  <InfoField
                    label="Payload Capacity"
                    value={
                      typeof asset.payloadCapacityKg === "number"
                        ? `${asset.payloadCapacityKg.toLocaleString()} kg`
                        : "—"
                    }
                  />
                </div>

                <div className="col-span-12 md:col-span-4">
                  <InfoField label="Fuel Type" value={asset.fuelType ?? "—"} />
                </div>
                <div className="col-span-12 md:col-span-4">
                  <InfoField
                    label="Transmission"
                    value={asset.transmission ?? "—"}
                  />
                </div>
                <div className="col-span-12 md:col-span-4">
                  <InfoField
                    label="Service Provider"
                    value={asset.serviceProviderType ?? "—"}
                  />
                </div>

                <div className="col-span-12 md:col-span-4">
                  <InfoField
                    label="Vehicle Age"
                    value={
                      typeof asset.vehicleAgeYears === "number"
                        ? `${asset.vehicleAgeYears} years`
                        : "—"
                    }
                  />
                </div>
                <div className="col-span-12 md:col-span-4">
                  <InfoField
                    label="Lifetime Services"
                    value={asset.lifetimeServiceCount ?? "—"}
                  />
                </div>
                <div className="col-span-12 md:col-span-4">
                  <InfoField
                    label="Lifetime Breakdowns"
                    value={asset.lifetimeBreakdownCount ?? "—"}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="audit" className="mt-4 space-y-3">
              {asset.auditTrail.length === 0 ? (
                <div className="rounded-2xl border p-4 text-sm text-muted-foreground">
                  No audit trail available.
                </div>
              ) : (
                asset.auditTrail.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-2xl border border-border/60 p-4"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="text-sm font-semibold">{event.field}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDateTime(event.createdAt)}
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {event.changedBy?.name ?? "System"}
                      </Badge>
                    </div>

                    <div className="mt-3 text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {event.oldValue ?? "—"}
                      </span>{" "}
                      →{" "}
                      <span className="font-medium text-foreground">
                        {event.newValue ?? "—"}
                      </span>
                    </div>

                    {event.reason ? (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Reason: {event.reason}
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </SectionCard>
=======
              </div>
            </TabsContent>

            {/* ── Maintenance Tab ── */}
            <TabsContent value="maintenance" className="mt-5">
              {(!asset.maintenanceLogs || asset.maintenanceLogs.length === 0) ? (
                <div className="flex flex-col items-center py-12 text-center">
                  <Wrench className="mb-3 h-8 w-8 text-muted-foreground/25" />
                  <p className="text-sm text-muted-foreground">
                    No maintenance events recorded
                  </p>
                </div>
              ) : (
                <div className="relative space-y-0">
                  {/* Timeline line */}
                  <div className="absolute left-[17px] top-2 bottom-2 w-px bg-border/40" />

                  {asset.maintenanceLogs.map((event) => {
                    const config = maintenanceEventConfig(event.type);
                    return (
                      <div key={event.id} className="relative flex gap-4 pb-5 last:pb-0">
                        {/* Timeline dot */}
                        <div
                          className={cn(
                            "relative z-10 mt-1 flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full border-2 border-background",
                            config.classes
                          )}
                        >
                          {config.icon}
                        </div>

                        {/* Event content */}
                        <div className="flex-1 rounded-xl border border-border/30 p-4">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold">
                                  Maintenance
                                </span>
                                <Badge
                                  variant="secondary"
                                  className={cn(
                                    "text-[10px] capitalize",
                                    config.classes
                                  )}
                                >
                                  {event.type?.toLowerCase()}
                                </Badge>
                              </div>
                            </div>
                            <span className="text-sm font-semibold">
                              {formatCurrency(event.cost)}
                            </span>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[12px] text-muted-foreground">
                            <span>
                              <Calendar className="mr-1 inline h-3 w-3" />
                              {formatDate(event.date)}
                            </span>
                            {event.performedBy && (
                              <span>
                                <User className="mr-1 inline h-3 w-3" />
                                {event.performedBy.name}
                              </span>
                            )}
                          </div>

                          {event.notes && (
                            <div className="mt-3 rounded-lg bg-muted/20 px-3 py-2 text-[12px] text-muted-foreground/80">
                              {event.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* ── Assignments Tab ── */}
            <TabsContent value="assignments" className="mt-5">
              {(!asset.assignmentHistory || asset.assignmentHistory.length === 0) ? (
                <div className="flex flex-col items-center py-12 text-center">
                  <User className="mb-3 h-8 w-8 text-muted-foreground/25" />
                  <p className="text-sm text-muted-foreground">
                    No assignment history available
                  </p>
                </div>
              ) : (
                <div className="relative space-y-0">
                  <div className="absolute left-[17px] top-2 bottom-2 w-px bg-border/40" />

                  {asset.assignmentHistory.map((assignment: any) => (
                    <div
                      key={assignment.id}
                      className="relative flex gap-4 pb-5 last:pb-0"
                    >
                      {/* Timeline dot */}
                      <div
                        className={cn(
                          "relative z-10 mt-1 flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full border-2 border-background",
                          assignment.action === "ASSIGNED"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-muted/40 text-muted-foreground"
                        )}
                      >
                        <User className="h-3.5 w-3.5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 rounded-xl border border-border/30 p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold">
                                {assignment.user?.name ?? "Unknown User"}
                              </span>
                              <Badge
                                variant="secondary"
                                className="bg-muted text-[10px] capitalize"
                              >
                                {assignment.action?.toLowerCase()}
                              </Badge>
                            </div>
                            {assignment.byAdmin && (
                              <p className="mt-0.5 text-[12px] text-muted-foreground">
                                By {assignment.byAdmin.name}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[12px] text-muted-foreground">
                          <span>
                            <Calendar className="mr-1 inline h-3 w-3" />
                            {formatDate(assignment.date)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ── Audit Trail Tab ── */}
            <TabsContent value="audit" className="mt-5">
              {(!asset.auditTrail || asset.auditTrail.length === 0) ? (
                <div className="flex flex-col items-center py-12 text-center">
                  <History className="mb-3 h-8 w-8 text-muted-foreground/25" />
                  <p className="text-sm text-muted-foreground">
                    No audit trail available
                  </p>
                </div>
              ) : (
                <div className="relative space-y-0">
                  <div className="absolute left-[17px] top-2 bottom-2 w-px bg-border/40" />

                  {asset.auditTrail.map((event: any) => (
                    <div
                      key={event.id}
                      className="relative flex gap-4 pb-5 last:pb-0"
                    >
                      {/* Timeline dot */}
                      <div className="relative z-10 mt-1 flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full border-2 border-background bg-muted/40 text-muted-foreground">
                        <FileText className="h-3.5 w-3.5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 rounded-xl border border-border/30 p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-sm font-semibold capitalize">
                              {event.field?.replaceAll("_", " ")}
                            </div>
                            <div className="mt-0.5 text-[12px] text-muted-foreground">
                              {formatDate(event.date)}
                            </div>
                          </div>
                          {event.by && (
                            <Badge variant="secondary" className="text-[10px]">
                              {event.by.name}
                            </Badge>
                          )}
                        </div>

                        {/* Value change */}
                        <div className="mt-3 flex items-center gap-2 text-sm">
                          <span className="rounded-md bg-red-500/8 px-2 py-0.5 font-medium text-red-600 line-through dark:text-red-400">
                            {event.oldValue ?? "—"}
                          </span>
                          <span className="text-muted-foreground">→</span>
                          <span className="rounded-md bg-emerald-500/8 px-2 py-0.5 font-medium text-emerald-700 dark:text-emerald-400">
                            {event.newValue ?? "—"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
>>>>>>> 8fd9ee0d230ce884f4957d6664ed8fc3d212cbbb
    </div>
  );
}