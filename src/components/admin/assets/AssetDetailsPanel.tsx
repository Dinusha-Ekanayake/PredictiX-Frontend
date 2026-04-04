"use client";

import type { ComponentProps } from "react";
import SectionCard from "@/components/admin/common/SectionCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
<<<<<<< HEAD
import { Separator } from "@/components/ui/separator";
=======
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
  AssetHealthBand,
  AssetRecord,
  MaintenanceEventType,
  MaintenanceLog,
  AssignmentEvent,
  AssetAuditEvent,
} from "./types";
>>>>>>> feature/warehouse-section-ui

import type { Asset } from "./types";

type BadgeVariant = ComponentProps<typeof Badge>["variant"];

function StatusBadge({ s }: { s: Asset["status"] }) {
  const variant: BadgeVariant =
    s === "CRITICAL"
      ? "destructive"
      : s === "MAINTENANCE"
        ? "secondary"
        : "default";

  return <Badge variant={variant}>{s}</Badge>;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}

type AssetDetailsPanelProps = {
  asset: Asset;
};

export default function AssetDetailsPanel({
  asset,
}: AssetDetailsPanelProps) {
  return (
    <div className="space-y-6">
      <SectionCard
        title="Asset Details"
        right={
          <div className="flex items-center gap-2">
            <Button variant="outline" className="h-8 rounded-xl px-3 text-xs">
              Edit
            </Button>
            <Button variant="destructive" className="h-8 rounded-xl px-3 text-xs">
              Delete
            </Button>
          </div>
        }
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-base font-semibold">{asset.name}</div>
              <StatusBadge s={asset.status} />
              <Badge variant="secondary">ID: {asset.id}</Badge>
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              {asset.description}
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-12 md:col-span-4">
            <Field label="Warehouse" value={asset.warehouse.name} />
          </div>
          <div className="col-span-12 md:col-span-4">
            <Field label="Location" value={asset.location} />
          </div>
          <div className="col-span-12 md:col-span-4">
            <Field
              label="Assigned Person"
              value={asset.assignedPerson?.name ?? "Unassigned"}
            />
          </div>

          <div className="col-span-12 md:col-span-4">
            <Field label="Health Score" value={`${asset.healthScore}%`} />
          </div>
          <div className="col-span-12 md:col-span-4">
            <Field
              label="Failure Probability (8w)"
              value={`${(asset.failureProbability8w * 100).toFixed(0)}%`}
            />
          </div>
          <div className="col-span-12 md:col-span-4">
            <Field
              label="Prediction Confidence"
              value={`${(asset.predictionConfidence * 100).toFixed(0)}%`}
            />
          </div>

          <div className="col-span-12 md:col-span-6">
            <Field
              label="Last Maintenance"
              value={asset.lastMaintenanceDate ?? "—"}
            />
          </div>
          <div className="col-span-12 md:col-span-6">
            <Field
              label="Next Maintenance"
              value={asset.nextMaintenanceDate ?? "—"}
            />
          </div>

          <div className="col-span-12 md:col-span-6">
            <Field
              label="Scheduled Maintenance"
              value={asset.scheduledMaintenanceDate ?? "—"}
            />
          </div>
          <div className="col-span-12 md:col-span-6">
            <Field
              label="Predicted Maintenance"
              value={asset.predictedMaintenanceDate ?? "—"}
            />
          </div>

          <div className="col-span-12 md:col-span-6">
            <Field
              label="Estimated Cost"
              value={`$${asset.estimatedCost.toLocaleString()}`}
            />
          </div>
          <div className="col-span-12 md:col-span-6">
            <Field
              label="Cost Variance (30d)"
              value={`${asset.costVariance30d >= 0 ? "+" : ""}${(
                asset.costVariance30d * 100
              ).toFixed(0)}%`}
            />
          </div>
        </div>

        <Separator className="my-4" />

        <Tabs defaultValue="insights">
          <TabsList className="rounded-xl">
            <TabsTrigger value="insights">Predictive Insights</TabsTrigger>
            <TabsTrigger value="history">Maintenance Logs</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="mt-4 space-y-4">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 lg:col-span-6">
                <div className="h-55 rounded-2xl border bg-muted/20 p-4 text-sm text-muted-foreground">
                  Health Score Trend & Forecast (placeholder)
                </div>
              </div>
              <div className="col-span-12 lg:col-span-6">
                <div className="h-55 rounded-2xl border bg-muted/20 p-4 text-sm text-muted-foreground">
                  Failure Probability Forecast (8 weeks) (placeholder)
                </div>
<<<<<<< HEAD
              </div>
              <div className="col-span-12">
                <div className="rounded-2xl border p-4">
                  <div className="text-sm font-medium">Insight Summary</div>
                  <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                    <li>
                      Predicted maintenance earlier than scheduled (based on risk
                      trend).
                    </li>
                    <li>Confidence reflects available sensor/log coverage.</li>
                    <li>
                      Estimated cost variance indicates recent maintenance cost
                      deviation.
                    </li>
                  </ul>
=======
              ) : (
                <div className="relative space-y-0">
                  {/* Timeline line */}
                  <div className="absolute left-[17px] top-2 bottom-2 w-px bg-border/40" />

                  {asset.maintenanceLogs.map((event: MaintenanceLog) => {
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
>>>>>>> feature/warehouse-section-ui
                </div>
              </div>
            </div>
          </TabsContent>

<<<<<<< HEAD
          <TabsContent value="history" className="mt-4 space-y-3">
            {asset.maintenanceLogs.length === 0 ? (
              <div className="rounded-2xl border p-4 text-sm text-muted-foreground">
                No maintenance logs available.
              </div>
            ) : (
              asset.maintenanceLogs.map((l) => (
                <div key={l.id} className="rounded-2xl border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold">{l.type}</div>
                      <div className="text-xs text-muted-foreground">{l.date}</div>
=======
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

                  {asset.assignmentHistory.map((assignment: AssignmentEvent) => (
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
>>>>>>> feature/warehouse-section-ui
                    </div>
                    <Badge variant="secondary">${l.cost.toLocaleString()}</Badge>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    {l.notes}
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Performed by: {l.performedBy?.name ?? "—"}
                  </div>
                </div>
              ))
            )}
          </TabsContent>

<<<<<<< HEAD
          <TabsContent value="assignments" className="mt-4 space-y-3">
            {asset.assignmentHistory.length === 0 ? (
              <div className="rounded-2xl border p-4 text-sm text-muted-foreground">
                No assignment history available.
              </div>
            ) : (
              asset.assignmentHistory.map((e) => (
                <div key={e.id} className="rounded-2xl border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold">{e.action}</div>
                      <div className="text-xs text-muted-foreground">{e.date}</div>
=======
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

                  {asset.auditTrail.map((event: AssetAuditEvent) => (
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
>>>>>>> feature/warehouse-section-ui
                    </div>
                    <Badge variant="secondary">{e.user?.name ?? "—"}</Badge>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Changed by: {e.byAdmin?.name ?? "—"}
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="audit" className="mt-4 space-y-3">
            {asset.auditTrail.length === 0 ? (
              <div className="rounded-2xl border p-4 text-sm text-muted-foreground">
                No audit events available.
              </div>
            ) : (
              asset.auditTrail.map((a) => (
                <div key={a.id} className="rounded-2xl border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold">{a.field}</div>
                      <div className="text-xs text-muted-foreground">{a.date}</div>
                    </div>
                    <Badge variant="secondary">{a.by?.name ?? "—"}</Badge>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    {a.oldValue} → <span className="font-medium">{a.newValue}</span>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </SectionCard>
    </div>
  );
}