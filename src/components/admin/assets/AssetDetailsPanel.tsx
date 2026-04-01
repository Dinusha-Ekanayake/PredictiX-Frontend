"use client";

import * as React from "react";
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
    default:
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
  }
}

function healthBandClasses(healthBand?: AssetHealthBand | null) {
  switch (healthBand) {
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
  }
}

function formatDate(date?: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString();
}

function formatDateTime(date?: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleString();
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
    </div>
  );
}

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

                <Badge
                  variant="outline"
                  className={cn("capitalize", statusClasses(asset.status))}
                >
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
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="properties" className="mt-4">
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-12 md:col-span-4">
                  <InfoField label="Asset UUID" value={asset.id} />
                </div>
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
    </div>
  );
}