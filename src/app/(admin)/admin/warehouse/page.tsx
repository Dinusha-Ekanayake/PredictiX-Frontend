"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, FileText } from "lucide-react";

import WarehouseOverviewCards from "@/components/admin/warehouse/WarehouseOverviewCards";
import WarehouseInsightsSection from "@/components/admin/warehouse/WarehouseInsightsSection";

// ── Warehouse Report (my section — warehouse components only) ──
import WarehouseReportModal from "@/components/admin/warehouse/WarehouseReportModal";
import { getWarehouseSummary } from "@/lib/warehouseService";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
const REPORT_API = `${API_BASE_URL}/warehouse-dashboard/generate-report`;

export default function WarehousePage() {
  // ── Existing dashboard state (untouched) ──
  const [data, setData] = React.useState<any>(null);
  const [refreshing, setRefreshing] = React.useState(true);

  async function fetchData() {
    setRefreshing(true);
    try {
      const result = await getWarehouseSummary();
      setData(result);
    } catch (e) {
      console.error(e);
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
      const res = await fetch(REPORT_API);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }
      const result = await res.json();
      setReportData(result);
    } catch (e: unknown) {
      setReportError((e as Error).message);
    } finally {
      setGenerating(false);
    }
  }

  function openModal() {
    setModalOpen(true);
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

          {/* Generate Report → opens full-screen report modal */}
          <Button
            variant="secondary"
            id="btn-generate-warehouse-report"
            onClick={openModal}
          >
            <FileText className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* ── Existing dashboard (completely untouched) ── */}
      <WarehouseOverviewCards data={data?.kpiGrid} isLoading={refreshing && !data} />
      {data && <WarehouseInsightsSection data={data} />}

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