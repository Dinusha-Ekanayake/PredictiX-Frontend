"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, FileText } from "lucide-react";

import PageHero from "@/components/common/PageHero";
import WarehouseOverviewCards from "@/components/admin/warehouse/WarehouseOverviewCards";
import WarehouseInsightsSection from "@/components/admin/warehouse/WarehouseInsightsSection";
import WarehouseMaintenanceSchedule from "@/components/admin/warehouse/WarehouseMaintenanceSchedule";

// ── Warehouse Report (my section — warehouse components only) ──
import WarehouseReportModal, { type WarehouseReportPayload } from "@/components/admin/warehouse/WarehouseReportModal";
import { getWarehouseSummary, type WarehouseSummaryData } from "@/lib/warehouseService";

const API_BASE_URL = "/api/proxy";
const REPORT_API = `${API_BASE_URL}/warehouse-dashboard/generate-report`;

export default function WarehousePage() {
  // ── Existing dashboard state (untouched) ──
  const [data, setData] = React.useState<WarehouseSummaryData | null>(null);
  const [refreshing, setRefreshing] = React.useState(true);

  async function fetchData() {
    setRefreshing(true);
    try {
      const result = await getWarehouseSummary();
      setData(result);
    } catch (e) {
      // Backend may be offline in dev — log as a warning so it doesn't trip
      // the Next.js error overlay, and render the empty/loading state instead.
      console.warn("Failed to fetch warehouse data:", e);
      setData(null);
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
  const [reportData, setReportData] = React.useState<WarehouseReportPayload | null>(null);
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
      console.error("Report generation error:", errorMsg);
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
      <PageHero
        crumbs={["PredictiX", "Admin", "Warehouse"]}
        title="Warehouse"
        subtitle="Overview of asset health, tickets, and predictive maintenance signals."
        right={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={fetchData} disabled={refreshing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              variant="secondary"
              id="btn-generate-warehouse-report"
              onClick={openModalAndGenerate}
            >
              <FileText className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </div>
        }
      />

      {/* ── Existing dashboard (completely untouched) ── */}
      <WarehouseOverviewCards data={data} isLoading={refreshing && !data} />
      {data && <WarehouseInsightsSection data={data} />}

      {/* ── Predictive Maintenance Schedule Chart ── */}
      <WarehouseMaintenanceSchedule />

      <div className="h-20" />

      {/* ── Full-screen Report Modal (portal, not in page flow) ── */}
      <WarehouseReportModal
        open={modalOpen}
        generating={generating}
        reportData={reportData}
        reportError={reportError}
        onGenerate={handleGenerate}
        onClose={closeModal}
        onRegenerate={handleGenerate}
      />
    </div>
  );
}