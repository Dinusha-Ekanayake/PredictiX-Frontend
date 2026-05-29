"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, FileText } from "lucide-react";

import WarehouseOverviewCards from "@/components/admin/warehouse/WarehouseOverviewCards";
import WarehouseInsightsSection from "@/components/admin/warehouse/WarehouseInsightsSection";
import WarehouseMaintenanceSchedule from "@/components/admin/warehouse/WarehouseMaintenanceSchedule";
import WarehouseComponentHealth from "@/components/admin/warehouse/WarehouseComponentHealth";
import WarehouseRecentMaintenance from "@/components/admin/warehouse/WarehouseRecentMaintenance";
import { getMaintenanceSchedule } from "@/lib/warehouseService";

// ── Warehouse Report (my section — warehouse components only) ──
import WarehouseReportModal from "@/components/admin/warehouse/WarehouseReportModal";

const REPORT_API = "http://127.0.0.1:8000/warehouse-dashboard/generate-report";

export default function WarehousePage() {
  // ── Existing dashboard state (untouched) ──
  const [data, setData] = React.useState<any>(null);
  const [maintenanceSchedule, setMaintenanceSchedule] = React.useState<any[]>([]);
  const [refreshing, setRefreshing] = React.useState(true);

  async function fetchData() {
    setRefreshing(true);
    try {
      // Fetch summary and maintenance schedule in parallel
      const [summaryRes, scheduleData] = await Promise.allSettled([
        fetch("http://127.0.0.1:8000/warehouse-dashboard/summary", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }),
        getMaintenanceSchedule(),
      ]);

      if (summaryRes.status === "fulfilled" && summaryRes.value.ok) {
        setData(await summaryRes.value.json());
      } else {
        if (summaryRes.status === "rejected") {
          console.warn("Warehouse summary unavailable:", summaryRes.reason?.message);
        }
        setData(null);
      }

      setMaintenanceSchedule(
        scheduleData.status === "fulfilled" ? scheduleData.value : []
      );
    } finally {
      setRefreshing(false);
    }
  }

  React.useEffect(() => {
    fetchData();
  }, []);

  // ── Report modal state ──
  const [modalOpen, setModalOpen] = React.useState(false);
  const [generating, setGenerating] = React.useState(false);
  const [reportData, setReportData] = React.useState<any>(null);
  const [reportError, setReportError] = React.useState<string | null>(null);

  async function handleGenerate() {
    setGenerating(true);
    setReportError(null);
    setReportData(null);
    try {
      const res = await fetch(REPORT_API, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }
      
      const result = await res.json();
      setReportData(result);
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      // Error is surfaced in the modal UI — no need to also log to console
      setReportError(errorMsg);
    } finally {
      setGenerating(false);
    }
  }

  function openModalAndGenerate() {
    setModalOpen(true);
    setGenerating(true);
    setReportError(null);
    setReportData(null);
    // Start generation immediately
    handleGenerate();
  }

  function closeModal() {
    setModalOpen(false);
    setReportData(null);
    setReportError(null);
    setGenerating(false);
  }

  return (
    <div className="w-full space-y-6">
      {/* ── Page header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Warehouse</h1>
          <p className="text-sm text-muted-foreground">
            Overview of asset health, tickets, and predictive maintenance signals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={fetchData} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          {/* Generate Report → Skip confirmation, go directly to generating */}
          <Button
            variant="secondary"
            id="btn-generate-warehouse-report"
            onClick={openModalAndGenerate}
          >
            <FileText className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* ── Existing dashboard (completely untouched) ── */}
      <WarehouseOverviewCards data={data} isLoading={refreshing && !data} />
      {data && <WarehouseInsightsSection data={data} />}

      {/* ── Component Health Overview (sensor_readings) ── */}
      <WarehouseComponentHealth
        componentHealth={data?.componentHealth}
        totalFaultCodes={data?.totalFaultCodes}
        assetsWithSensors={data?.assetsWithSensors}
        isLoading={refreshing && !data}
      />

      {/* ── Predictive Maintenance Schedule Chart ── */}
      <WarehouseMaintenanceSchedule data={maintenanceSchedule} />

      {/* ── Recent Maintenance Events (maintenance_events) ── */}
      <WarehouseRecentMaintenance
        events={data?.recentMaintenance}
        isLoading={refreshing && !data}
      />

      <div className="h-20" />

      {/* ── Full-screen Report Modal (portal, not in page flow) ── */}
      <WarehouseReportModal
        open={modalOpen}
        generating={generating}
        reportData={reportData}
        reportError={reportError}
        maintenanceSchedule={maintenanceSchedule}
        onGenerate={handleGenerate}
        onClose={closeModal}
        onRegenerate={handleGenerate}
      />
    </div>
  );
}