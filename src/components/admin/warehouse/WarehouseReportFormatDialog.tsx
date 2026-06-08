"use client";

import * as React from "react";
import {
  Brain,
  Loader2,
  X,
  Database,
  Cpu,
  BarChart3,
  FileCheck,
} from "lucide-react";

/**
 * WarehouseReportFormatDialog
 * ----------------------------
 * Simple confirmation window that appears when user clicks "Generate Report".
 * No format options — always generates the Full Report.
 * Shows what data sources and sections will be included.
 */

interface Props {
  open: boolean;
  generating: boolean;
  onClose: () => void;
  onGenerate: () => void;
}

const SECTIONS = [
  { icon: Brain, label: "Executive Insight Summary", desc: "Fleet overview, health, cost & activity" },
  { icon: BarChart3, label: "Risk & Failure Analysis", desc: "AI-identified risks, SHAP drivers, critical assets" },
  { icon: FileCheck, label: "Maintenance Intelligence", desc: "Service needs, cost forecast & downtime" },
  { icon: BarChart3, label: "Pattern & Trend Analysis", desc: "3-month ticket, maintenance & health trends" },
  { icon: Brain, label: "3-Month Warehouse Conclusion", desc: "Full RAG-powered summary with action recommendations" },
];

const SOURCES = [
  "assets", "asset_failure_predictions", "asset_cost_predictions",
  "maintenance_events", "tickets", "profiles", "prediction_explanations",
];

export default function WarehouseReportFormatDialog({
  open,
  generating,
  onClose,
  onGenerate,
}: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={!generating ? onClose : undefined}
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">

        {/* Header gradient */}
        <div className="relative bg-gradient-to-br from-violet-600 to-indigo-600 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white leading-tight">
                  Generate Warehouse Report
                </h2>
                <p className="text-xs text-violet-200 mt-0.5">
                  Full AI-powered analysis · Llama 3 (Meta AI)
                </p>
              </div>
            </div>
            {!generating && (
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 transition hover:bg-white/20"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          {/* What's included */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Report includes 5 AI-generated sections
            </p>
            <div className="space-y-1.5">
              {SECTIONS.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 px-3 py-2"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-950 text-violet-600 text-[10px] font-bold">
                    {i + 1}
                  </span>
                  <div>
                    <div className="text-xs font-medium">{s.label}</div>
                    <div className="text-[10px] text-muted-foreground">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Data sources */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
              <Database className="h-3.5 w-3.5 text-violet-500" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                PostgreSQL Data Sources
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SOURCES.map((s) => (
                <span
                  key={s}
                  className="rounded-md bg-violet-50 dark:bg-violet-950/40 px-2 py-0.5 text-[10px] font-mono text-violet-700 dark:text-violet-300"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* LLM note */}
          <div className="flex items-center gap-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 px-3 py-2.5">
            <Cpu className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
            <p className="text-[11px] text-indigo-700 dark:text-indigo-300">
              Live data is injected into <strong>Llama 3 (Meta AI)</strong> via LangChain.
              Generation takes approximately 10–25 seconds.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 px-5 pb-5">
          <button
            onClick={!generating ? onClose : undefined}
            disabled={generating}
            className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-700 py-2.5 text-sm font-medium transition hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            id="btn-warehouse-generate-report"
            onClick={onGenerate}
            disabled={generating}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-violet-700 hover:to-indigo-700 disabled:opacity-60"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Brain className="h-4 w-4" />
                Generate Full Report
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
