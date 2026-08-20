"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, FileText } from "lucide-react";

import PageHero from "@/components/common/PageHero";
import PredictiXLoader from "@/components/loading/PredictiXLoader";
import WarehouseOverviewCards from "@/components/admin/warehouse/WarehouseOverviewCards";
import WarehouseInsightsSection from "@/components/admin/warehouse/WarehouseInsightsSection";
import WarehouseMaintenanceSchedule from "@/components/admin/warehouse/WarehouseMaintenanceSchedule";
import { MonthlyTicketVolumeCard } from "@/components/admin/warehouse/WarehouseTicketInsights";
import WarehouseDepartmentsOverview, {
  type DepartmentOverviewRow,
} from "@/components/admin/warehouse/WarehouseDepartmentsOverview";
import type { TicketsByDepartmentRow } from "@/components/admin/warehouse/WarehouseTicketsByDepartment";

import { getMaintenanceSchedule } from "@/lib/warehouseService";
import { getAccessToken } from "@/lib/authService";

// ── Warehouse Report (my section — warehouse components only) ──
import WarehouseReportModal from "@/components/admin/warehouse/WarehouseReportModal";
import WarehouseSurvivalAnalysis from "@/components/admin/warehouse/WarehouseSurvivalAnalysis";
import { getSurvivalAnalysis, type SurvivalSummary } from "@/lib/warehouseService";

// Use the same env-driven base URL as warehouseService rather than a hardcoded host.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
const REPORT_API = `${API_BASE_URL}/warehouse-dashboard/generate-report`;

export default function WarehousePage() {
  // ── Existing dashboard state (untouched) ──
  const [data, setData] = React.useState<any>(null);
  const [survivalData, setSurvivalData] = React.useState<SurvivalSummary | null>(null);
  const [maintenanceSchedule, setMaintenanceSchedule] = React.useState<any[]>([]);
  const [refreshing, setRefreshing] = React.useState(true);
  // Distinguishes the very first load (full-page loader, same as every other
  // page in the app) from a later manual "Refresh" click (lighter skeletons).
  const [initialLoad, setInitialLoad] = React.useState(true);

  // ── Departments overview + ticket load by department ──
  const [departments, setDepartments] = React.useState<DepartmentOverviewRow[]>([]);
  const [ticketsByDepartment, setTicketsByDepartment] = React.useState<TicketsByDepartmentRow[]>([]);

  function authedGet(path: string) {
    return fetch(`${API_BASE_URL}${path}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(getAccessToken() ? { Authorization: `Bearer ${getAccessToken()}` } : {}),
      },
    });
  }

  async function fetchData() {
    setRefreshing(true);
    try {
      // Step 1: Fast queries
      const [summaryRes, deptRes] = await Promise.allSettled([
        authedGet("/warehouse-dashboard/summary"),
        authedGet("/warehouse-dashboard/departments-overview"),
      ]);

      if (summaryRes.status === "fulfilled" && summaryRes.value.ok) {
        setData(await summaryRes.value.json());
      } else {
        if (summaryRes.status === "rejected") {
          console.warn("Warehouse summary unavailable:", summaryRes.reason?.message);
        }
        setData(null);
      }

      if (deptRes.status === "fulfilled" && deptRes.value.ok) {
        const deptJson = await deptRes.value.json();
        setDepartments(deptJson.departments ?? []);
        setTicketsByDepartment(deptJson.ticketsByDepartment ?? []);
      } else {
        if (deptRes.status === "rejected") {
          console.warn("Departments overview unavailable:", deptRes.reason?.message);
        }
        setDepartments([]);
        setTicketsByDepartment([]);
      }
      
      // Instantly unblock UI so top half loads
      setInitialLoad(false);

      // Step 2: Heavy queries
      const [scheduleData, survivalRes] = await Promise.allSettled([
        getMaintenanceSchedule(),
        getSurvivalAnalysis(),
      ]);

      setSurvivalData(survivalRes.status === "fulfilled" ? survivalRes.value : null);
      setMaintenanceSchedule(
        scheduleData.status === "fulfilled" ? scheduleData.value : []
      );
    } finally {
      setRefreshing(false);
      setInitialLoad(false);
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
          // The endpoint is guarded by require_user — attach the JWT like every
          // other warehouse-dashboard call, otherwise it 401s "Not authenticated".
          ...(getAccessToken() ? { Authorization: `Bearer ${getAccessToken()}` } : {}),
        },
      });

      if (res.status === 401) {
        throw new Error("Your session has expired. Please log out and log back in, then try again.");
      }
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

  if (initialLoad) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <PredictiXLoader label="Loading warehouse…" />
      </div>
    );
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

      {/* ── Monthly Ticket Volume (Full Width) ── */}
      <MonthlyTicketVolumeCard data={data?.monthlyTicketVolume} />

      {/* ── Departments Overview ── */}
      <div className="w-full">
        <WarehouseDepartmentsOverview departments={departments} isLoading={refreshing && departments.length === 0} />
      </div>

      {/* ── Component Survival Risk & Maintenance Schedule ── */}
      <div className="grid gap-4 lg:grid-cols-2 mt-6">
        <WarehouseSurvivalAnalysis data={survivalData} isLoading={refreshing && !survivalData} />
        <WarehouseMaintenanceSchedule data={maintenanceSchedule} isLoading={refreshing && maintenanceSchedule.length === 0} />
      </div>

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
