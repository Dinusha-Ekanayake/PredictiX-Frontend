"use client";

import SectionCard from "@/components/admin/common/SectionCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

import type { Asset } from "./types";

function StatusBadge({ s }: { s: Asset["status"] }) {
  const variant =
    s === "CRITICAL" ? "destructive" : s === "MAINTENANCE" ? "secondary" : "default";
  return <Badge variant={variant as any}>{s}</Badge>;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}

export default function AssetDetailsPanel({ asset }: { asset: Asset }) {
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
            <div className="mt-1 text-sm text-muted-foreground">{asset.description}</div>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Key fields grid */}
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-12 md:col-span-4">
            <Field label="Warehouse" value={asset.warehouse.name} />
          </div>
          <div className="col-span-12 md:col-span-4">
            <Field label="Location" value={asset.location} />
          </div>
          <div className="col-span-12 md:col-span-4">
            <Field label="Assigned Person" value={asset.assignedPerson?.name ?? "Unassigned"} />
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
            <Field label="Last Maintenance" value={asset.lastMaintenanceDate ?? "—"} />
          </div>
          <div className="col-span-12 md:col-span-6">
            <Field label="Next Maintenance" value={asset.nextMaintenanceDate ?? "—"} />
          </div>

          <div className="col-span-12 md:col-span-6">
            <Field label="Scheduled Maintenance" value={asset.scheduledMaintenanceDate ?? "—"} />
          </div>
          <div className="col-span-12 md:col-span-6">
            <Field label="Predicted Maintenance" value={asset.predictedMaintenanceDate ?? "—"} />
          </div>

          <div className="col-span-12 md:col-span-6">
            <Field label="Estimated Cost" value={`$${asset.estimatedCost.toLocaleString()}`} />
          </div>
          <div className="col-span-12 md:col-span-6">
            <Field
              label="Cost Variance (30d)"
              value={`${asset.costVariance30d >= 0 ? "+" : ""}${(asset.costVariance30d * 100).toFixed(0)}%`}
            />
          </div>
        </div>

        <Separator className="my-4" />

        {/* Tabs */}
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
                <div className="h-[220px] rounded-2xl border bg-muted/20 p-4 text-sm text-muted-foreground">
                  Health Score Trend & Forecast (placeholder)
                </div>
              </div>
              <div className="col-span-12 lg:col-span-6">
                <div className="h-[220px] rounded-2xl border bg-muted/20 p-4 text-sm text-muted-foreground">
                  Failure Probability Forecast (8 weeks) (placeholder)
                </div>
              </div>
              <div className="col-span-12">
                <div className="rounded-2xl border p-4">
                  <div className="text-sm font-medium">Insight Summary</div>
                  <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                    <li>Predicted maintenance earlier than scheduled (based on risk trend).</li>
                    <li>Confidence reflects available sensor/log coverage.</li>
                    <li>Estimated cost variance indicates recent maintenance cost deviation.</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

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
                    </div>
                    <Badge variant="secondary">${l.cost.toLocaleString()}</Badge>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">{l.notes}</div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Performed by: {l.performedBy?.name ?? "—"}
                  </div>
                </div>
              ))
            )}
          </TabsContent>

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
